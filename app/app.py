from flask import Flask

import datetime
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

app = Flask(__name__)

# If modifying these scopes, delete the file token.json.
# SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

@app.route("/")
def hello_world():
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

    result = None

    try:
        service = build("calendar", "v3", credentials=creds)

        # insert to calendar
        print("Inserting event to calendar")

        event = {
            'summary': 'Lazy Scheduler',
            'location': 'NW 5107',
            'description': 'Test event',
            'start': {
                'dateTime': '2024-09-21T14:00:00-07:00',
                'timeZone': 'Canada/Pacific',
            },
            'end': {
                'dateTime': '2024-09-21T17:00:00-07:00',
                'timeZone': 'Canada/Pacific',
            },
            'recurrence': [
                'RRULE:FREQ=WEEKLY;COUNT=2'
                # "RRULE:FREQ=WEEKLY;UNTIL=20110701T170000Z",
            ],
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'popup', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 10},
                ],
            },
        }

        event = service.events().insert(calendarId='primary', body=event).execute()
        result = 'Event created: %s' % (event.get('htmlLink'))
        print(result)

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

    except HttpError as error:
        print(f"An error occurred: {error}")

    return result