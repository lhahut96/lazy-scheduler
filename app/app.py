import datetime
import os.path
import json
import pytz
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

@app.route('/create-schedule', methods=['GET', 'POST'])
def createEvents():
    response = {
        "success": False,
        "message": ""
    }
    
    try:
        course = request.get_json()
        validated = validateReminder(course['events'])

        if validated:
            creds = checkGooglePermission()
            service = build("calendar", "v3", credentials=creds)

            # course = json.loads(data)
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
            result = 'Event created: %s' % (weeklyClass.get('htmlLink'))
            print(result + "\n")

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

                # print(eventData)
                eventData = service.events().insert(calendarId='primary', body=eventData).execute()
                result = 'Event created: %s' % (eventData.get('htmlLink'))
                print(result + "\n")

            response = {
                "success": True,
                "message": "Event created successfully",
                "link": weeklyClass.get('htmlLink')
            }
        else:
            response = {
                "success": False,
                "message": "The available reminder of an event is 0 mintues to 4 weeks"
            }

    except HttpError as error:
        print(f"HTTP error occurred: {error}")
    except Exception as e:
        print(f"Other error occurred: {e}")

    return response

def validateReminder(jsonData):
    print(jsonData)
    for event in jsonData:
        if len(event['reminders']) > 0:
            for minute in event['reminders']:
                print(minute)
                if minute < 0 or minute > 40320:
                    print("masuk")
                    return False

    return True

@app.route('/upload', methods=['POST'])
def upload():
    courseName = request.form['courseName']
    roomNumber = request.form['roomNumber']
    time = request.form['time']
    file = request.files['outlineFile']

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
    rawResp = get_schedule_table(file_name=file.filename,
                               file_stream=file.read(),
                               schedule_type="course-outline")

    
    print(rawResp)
        
    events = []
    noOfWeeks = rawResp['no_of_weeks']
    rawEvents = rawResp['events']

    for event in rawEvents:
        rawDate = datetime.strptime(event['date'],"%Y-%m-%dT%H:%M:%S")
        startTime = rawDate.replace(hour=hour, minute=minute)
        endTime = startTime + timedelta(minutes=170)

        tmp = {
            "name": event['name'],
            "description": "",
            "startTime": startTime.astimezone().strftime("%Y-%m-%dT%H:%M:%S%z"),
            "endTime": endTime.astimezone().strftime("%Y-%m-%dT%H:%M:%S%z"),
            "reminders": []
        }

        events.append(tmp)

    # print(events)

    # get date for first week
    rawFirstWeekDate = datetime.strptime(rawResp['start_date'],"%Y-%m-%dT%H:%M:%S")
    startTime = rawFirstWeekDate.replace(hour=hour, minute=minute)
    endTime = startTime + timedelta(minutes=170) 

    resp = {
        "course": courseName,
        "location": roomNumber,
        "description": "",
        "startTime": startTime.astimezone().strftime("%Y-%m-%dT%H:%M:%S%z"),
        "endTime": endTime.astimezone().strftime("%Y-%m-%dT%H:%M:%S%z"),
        "noOfWeeks": noOfWeeks,
        "events": events
    }

    return resp