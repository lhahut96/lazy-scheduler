import datetime
import os.path
import json
from pdf_parser.schedule_reader import get_schedule_table

from flask import Flask
from flask import request
from flask_cors import CORS
from datetime import datetime, timedelta

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

app = Flask(__name__)
CORS(app)

# If modifying these scopes, delete the file token.json.
# SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

# @app.route("/check-permission")
def checkGooglePermission():
    """Shows basic usage of the Google Calendar API.
    Prints the start and name of the next 10 events on the user's calendar.
    """

    creds = None

    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists("credentials/token.json"):
        creds = Credentials.from_authorized_user_file("credentials/token.json", SCOPES)

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "credentials/credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
    
    # Save the credentials for the next run
    with open("credentials/token.json", "w") as token:
        token.write(creds.to_json())

    return creds

# @app.route('/create-schedule', methods=['POST'])
@app.route('/create-schedule', methods=['GET'])
def createEvents():

    # eventName = request.form.get('language')
    data = '''
{
  "course": "course 1",
  "location": "NW1234",
  "description": "this is description/remarks/notes",
  "startTime": "2024-09-21T14:00:00-07:00",
  "endTime": "2024-09-21T17:00:00-07:00",
  "noOfWeeks": 14,
  "events": [
    {
      "name": "quiz 1",
      "description": "this is description/remarks/notes",
      "startTime": "2024-09-21T14:00:00-07:00",
      "endTime": "2024-09-21T17:00:00-07:00",
      "reminders": [
        1440,
        10080
      ]
    },
    {
      "name": "assignment 1",
      "description": "this is description/remarks/notes",
      "startTime": "2024-09-22T14:00:00-07:00",
      "endTime": "2024-09-22T17:00:00-07:00",
      "reminders": [
        1440,
        10080
      ]
    }
  ]
}
'''
    # print(data)

    try:
        creds = checkGooglePermission()
        service = build("calendar", "v3", credentials=creds)

        course = json.loads(data)
        # print(jsonData)

        # create weekly class event
        weeklyClass = {
            'summary': course['course'],
            'location': course['location'],
            'description': course['description'],
            'start': {
                'dateTime': course['startTime'],
                'timeZone': 'Canada/Pacific',
            },
            'end': {
                'dateTime': course['endTime'],
                'timeZone': 'Canada/Pacific',
            },
            'recurrence': [
                'RRULE:FREQ=WEEKLY;COUNT={}'.format(course['noOfWeeks'])
            ]
        }

        weeklyClass = service.events().insert(calendarId='primary', body=weeklyClass).execute()

        # create other events e.g. quiz, assignment etc
        for event in course['events']:
            eventData = {
                'summary': event['name'],
                'location': course['location'],
                'description': event['description'],
                'start': {
                    'dateTime': event['startTime'],
                    'timeZone': 'Canada/Pacific',
                },
                'end': {
                    'dateTime': event['endTime'],
                    'timeZone': 'Canada/Pacific',
                }
            }

            # check if need reminders
            if len(event['reminders']):
                reminders = []

                for reminder in event['reminders']:
                    tmp = {'method': 'popup', 'minutes': reminder}
                    reminders.append(tmp)

                eventData['reminders'] = {
                    'useDefault': False,
                    'overrides': reminders
                }

            print(eventData)
            eventData = service.events().insert(calendarId='primary', body=eventData).execute()
            result = 'Event created: %s' % (eventData.get('htmlLink'))
            print(result)

    except HttpError as error:
        print(f"HTTP error occurred: {error}")
    except Exception as e:
        print(f"Other error occurred: {e}")

    ######

    # try:
    #     service = build("calendar", "v3", credentials=creds)

    #     # insert to calendar
    #     print("Inserting event to calendar")

    #     event = {
    #         'summary': 'Lazy Scheduler',
    #         'location': 'NW 5107',
    #         'description': 'Test event',
    #         'start': {
    #             'dateTime': '2024-09-21T14:00:00-07:00',
    #             'timeZone': 'Canada/Pacific',
    #         },
    #         'end': {
    #             'dateTime': '2024-09-21T17:00:00-07:00',
    #             'timeZone': 'Canada/Pacific',
    #         },
    #         'recurrence': [
    #             'RRULE:FREQ=WEEKLY;COUNT=2'
    #             # "RRULE:FREQ=WEEKLY;UNTIL=20110701T170000Z",
    #         ],
    #         'reminders': {
    #             'useDefault': False,
    #             'overrides': [
    #                 {'method': 'popup', 'minutes': 24 * 60},
    #                 {'method': 'popup', 'minutes': 10},
    #             ],
    #         },
    #     }

    #     event = service.events().insert(calendarId='primary', body=event).execute()
    #     result = 'Event created: %s' % (event.get('htmlLink'))
    #     print(result)

        # # Call the Calendar API
        # now = datetime.datetime.utcnow().isoformat() + "Z"  # 'Z' indicates UTC time
        # print("Getting the upcoming 10 events")
        # events_result = (
        #     service.events()
        #     .list(
        #         calendarId="primary",
        #         timeMin=now,
        #         maxResults=10,
        #         singleEvents=True,
        #         orderBy="startTime",
        #     )
        #     .execute()
        # )
        # events = events_result.get("items", [])

        # if not events:
        #     print("No upcoming events found.")
        #     return

        # Prints the start and name of the next 10 events
        # for event in events:
        #     start = event["start"].get("dateTime", event["start"].get("date"))
        #     print(start, event["summary"])

    # except HttpError as error:
    #     print(f"An error occurred: {error}")

    return 'abcd'

@app.route('/upload', methods=['POST'])
def upload():
    courseName = request.form['courseName']
    roomNumber = request.form['roomNumber']
    time = request.form['time']
    file = request.files['outlineFile'].read()

    # courseName = "course name"
    # roomNumber = "123"

    # time = '14:00'
    tmp = time.split(':')
    hour = int(tmp[0])
    minute = int(tmp[1])

    # print(file)
    # print(courseName)
    # print(roomNumber)

    # call image parser
    # rawResp = get_schedule_table(file_name="course-outline.png",
    #                            file_stream=file,
    #                            schedule_type="course-outline")

    
    # print(rawResp)
    # return "adsfsdf"

    with open('parser-sample-response.json') as f:
        rawResp = json.load(f)
        
    strStartTime = ""
    strEndTime = ""
    events = []
    noOfWeeks = rawResp['no_of_weeks']
    rawEvents = rawResp['events']
    for event in rawEvents:
        rawDate = datetime.strptime(event['date'],"%Y-%m-%dT%H:%M:%S")
        startTime = rawDate.replace(hour=hour, minute=minute)
        endTime = startTime + timedelta(minutes=170) 
        # print(endTime)
        
        strStartTime = str(startTime.strftime("%Y-%m-%dT%H:%M:%S")) + '-07:00'
        strEndTime = str(endTime.strftime("%Y-%m-%dT%H:%M:%S")) + '-07:00'

        tmp = {
            "name": event['name'],
            "description": "",
            "startTime": strStartTime,
            "endTime": strEndTime,
            "reminders": []
        }

        events.append(tmp)

    # print(events)

    resp = {
        "course": courseName,
        "location": roomNumber,
        "description": "",
        "startTime": strStartTime,
        "endTime": strEndTime,
        "noOfWeeks": noOfWeeks,
        "events": events
    }

    return resp