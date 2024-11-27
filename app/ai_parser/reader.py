import json

import google.generativeai as genai
import PyPDF2


class AiParser:

    def __init__(self, file, gemini_api_key):
        pdf_reader = PyPDF2.PdfReader(file)
        extracted_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text

        self.extracted_text = extracted_text
        self.gemini_api_key = gemini_api_key

    def generate_json(self):

        exampleFormat = {
            "course": "course name",
            "location": "NW1234",
            "description": "",
            "startTime": "2024-09-21T14:00:00-07:00",
            "endTime": "2024-09-21T17:00:00-07:00",
            "noOfWeeks": 14,
            "events": [
                {
                    "name": "quiz 1",
                    "description": "",
                    "startTime": "2024-09-21T14:00:00-07:00",
                    "endTime": "2024-09-21T17:00:00-07:00",
                    "reminders": [],
                }
            ],
        }

        genai.configure(api_key=self.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        firstPrompt = "Create json format for this pdf file with the format: " + str(
            exampleFormat
        )
        finetuning = "Only create event for quiz, midterm, assignment, project. Location should set similar to this format N5107 with no more than 10 characters. ALl description set to empty string for both events and the main course. Start times and end times should set the time similar to the course but the date should be different for the events, for the course start time and end time it should up to the length of the class like from 3pm to 5pm based on the pdf file. For events like quiz it should set reminders with 1000 as a member of the reminders, for midterm it should set reminders with 2000 as a member of the reminders, for assignment it should set reminders with 3000 as a member of the reminders, for project it should set reminders with 4000 as a member of the reminders. The events should be in ascending order and should handle DST transition in Vancouver between Nov 3 and Mar 10. The start time maybe different due to DST, so make sure to adjust the time accordingly. The start date for the course should be the same as the first event but it should be consider in the office hour, course time, or/and class day to make sure it correct, example the first event will be held on monday but the office hours will be on wednesday so the start date of course should be on wednesday same for class day."

        response = model.generate_content(
            [
                firstPrompt,
                self.extracted_text,
                finetuning,
            ],
            generation_config={
                "response_mime_type": "application/json",
            },
        )
        json_response = json.loads(response.text)
        return json_response
