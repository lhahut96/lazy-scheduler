import json
import os
from os.path import join, dirname

from dateparser import parse

import boto3

from pdf_parser.utils.cache_utils import cache

AWS_DEFAULT_REGION = "us-west-2"


def get_rows_columns_map(table_result, blocks_map, schedule_type):
    rows = {}
    scores = []
    for relationship in table_result['Relationships']:
        if relationship['Type'] == 'CHILD':
            for child_id in relationship['Ids']:
                cell = blocks_map[child_id]
                if cell['BlockType'] == 'CELL':
                    row_index = cell['RowIndex']
                    col_index = cell['ColumnIndex']
                    if row_index not in rows:
                        # create new row
                        rows[row_index] = {}

                    # get confidence score
                    scores.append(str(cell['Confidence']))

                    # get the text value
                    if row_index > 1 and col_index == 5 and schedule_type == "course-schedule":
                        split = True
                    else:
                        split = False
                    rows[row_index][col_index] = get_text(cell, blocks_map, split=split)
    return rows, scores


def get_text(cell, blocks_map, split):
    text = ''
    if 'Relationships' in cell:
        prev_word = None
        for relationship in cell['Relationships']:
            if relationship['Type'] == 'CHILD':
                for child_id in relationship['Ids']:
                    word = blocks_map[child_id]
                    if not prev_word:
                        prev_word = word
                    if split:
                        if word["Geometry"]["BoundingBox"]["Top"] - prev_word["Geometry"]["BoundingBox"]["Top"] > \
                                word["Geometry"]["BoundingBox"]["Height"] / 2:
                            word["Text"] = "\n" + word["Text"]
                            prev_word = word
                    if word['BlockType'] == 'WORD':
                        if "," in word['Text'] and word['Text'].replace(",", "").isnumeric():
                            text += '"' + word['Text'] + '"' + ' '
                        else:
                            text += word['Text'] + ' '
                    if word['BlockType'] == 'SELECTION_ELEMENT':
                        if word['SelectionStatus'] == 'SELECTED':
                            text += 'X '
    return text


@cache("TextractClient")
def _get_textract_client():
    return boto3.client("textract", region_name=AWS_DEFAULT_REGION)


def get_schedule_table(file_stream, file_name, schedule_type):
    json_file = join(dirname(__file__), "data/" + file_name[:-4] + ".json")
    if os.path.exists(json_file):
        blocks = json.load(open(json_file))
    else:
        client = _get_textract_client()
        response = client.analyze_document(Document={'Bytes': file_stream}, FeatureTypes=['TABLES'])

        # Get the text blocks
        blocks = response['Blocks']

        with open(json_file, "w") as f:
            f.write(json.dumps(blocks, indent=4))

    blocks_map = {}
    table_blocks = []
    for block in blocks:
        blocks_map[block['Id']] = block
        if block['BlockType'] == "TABLE":
            table_blocks.append(block)

    if len(table_blocks) <= 0:
        return "<b> NO Table FOUND </b>"
    result = {"events": [],
              "no_of_weeks": 0}
    for table in table_blocks:
        rows, scores = get_rows_columns_map(table, blocks_map, schedule_type)
        headers = rows[1]
        start_date = None
        for row_index, row in rows.items():
            if row_index == 1:
                continue
            result["no_of_weeks"] += 1
            event = {}
            cells = []
            for column_index, cell in row.items():
                if column_index == 5 and schedule_type == "course-schedule":
                    if row_index == 1:
                        cells += ["start_date", "end_date", "weekday", "start_time", "end_time", "location",
                                  "instructor"]
                    else:
                        lines = cell.split("\n")
                        start_date, end_date = lines[0].strip().split()
                        weekday = lines[1].strip()
                        times = lines[2].strip().split()
                        start_time = " ".join(times[:2])
                        end_time = " ".join(times[2:])
                        location = lines[3].strip()
                        if location.startswith("- "):
                            location = location[2:]
                        instructor = lines[4].strip()
                        cells += [start_date, end_date, weekday, start_time, end_time, location, instructor]
                else:
                    # field = headers[column_index].lower()
                    if column_index == 1:
                        field = "week"
                    if column_index == 2:
                        field = "date"
                    if column_index == 3:
                        field = "activities"
                    if column_index == 4 and len(headers) == 4:
                        field = "assessment"
                    if column_index == 5 and len(headers) == 5:
                        field = "assessment"
                    if field == "activities" or field == "assessment":
                        if "type" not in event:
                            if (("exam" in cell.lower() or "test" in cell.lower())
                                    and "review" not in cell.lower()
                                    and "final" not in cell.lower()) :
                                event["type"] = "exam"
                                event["name"] = cell.strip()
                            elif "assignment" in cell.lower() and "review" not in cell.lower():
                                event["type"] = "assignment"
                                event["name"] = cell.strip()
                            elif "quiz" in cell.lower() and "review" not in cell.lower():
                                event["type"] = "quiz"
                                event["name"] = cell.strip()
                            elif "project" in cell.lower() and "review" not in cell.lower() and field == "assessment":
                                event["type"] = "project"
                                event["name"] = cell.strip()
                        continue
                    if field == "date":
                        if not cell.strip():
                            continue

                        cell = cell.split(" - ")[0].strip()
                        date = parse(cell).isoformat()
                        event[field] = date
                        if not start_date:
                            start_date = date
                    else:
                        event[field] = cell.strip()
            if event.get("type"):
                result["events"].append(event)
        result["start_date"] = start_date
        break
    return result


def main(file_path):
    with open(file_path, 'rb') as file:
        img_test = file.read()
        bytes_test = bytearray(img_test)
        print('Image loaded', file_path)

    table = get_schedule_table(file_name=file_path.split("/")[-1],
                               file_stream=bytes_test,
                               schedule_type="course-outline")
    with open('data/schedule.json', 'w') as outfile:
        json.dump(table, outfile, indent=4)


if __name__ == "__main__":
    # file_name = sys.argv[1]
    main("data/WhatsApp Image 2024-09-22 at 10.30.16 AM.jpeg")
