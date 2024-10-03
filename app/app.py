import datetime
from datetime import datetime, timedelta

import flask
import google.oauth2.credentials
import google_auth_oauthlib
import google_auth_oauthlib.flow
import googleapiclient.discovery
from ai_parser import AiParser
from dotenv import dotenv_values
from flask import Flask, abort, request
from flask_cors import CORS
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from pdf_parser.schedule_reader import get_schedule_table

app = Flask(__name__)
CORS(app, origins=["*"])
app.secret_key = "super secret key"
app.config["SESSION_TYPE"] = "filesystem"


# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/calendar.events"]
API_SERVICE_NAME = "drive"
API_VERSION = "v2"
CLIENT_SECRETS_FILE = "credentials/credentials.json"
CLIENT_ID = "411838841138-ktj1q566ul6jcjpg0v95l5ldavg9mtbi.apps.googleusercontent.com"


@app.route("/check-permission")
def checkGooglePermission(token: str):
    """Shows basic usage of the Google Calendar API.
    Prints the start and name of the next 10 events on the user's calendar.
    """

    creds = None

    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if token:
        creds = Credentials(token)

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


@app.route("/create-schedule", methods=["GET", "POST"])
def createEvents():
    response = {"success": False, "message": ""}

    try:
        course = request.get_json()
        validated = validateReminder(course["events"])

        if validated:
            creds = checkGooglePermission(course["token"])
            service = build("calendar", "v3", credentials=creds)

            # create weekly class event
            weeklyClass = {
                "summary": course["course"],
                "location": course["location"],
                "description": course["description"],
                "start": {
                    "dateTime": course["startTime"],
                    "timeZone": "Canada/Pacific",
                },
                "end": {
                    "dateTime": course["endTime"],
                    "timeZone": "Canada/Pacific",
                },
                "recurrence": [
                    "RRULE:FREQ=WEEKLY;COUNT={}".format(course["noOfWeeks"])
                ],
            }

            weeklyClass = (
                service.events()
                .insert(calendarId="primary", body=weeklyClass)
                .execute()
            )
            result = "Event created: %s" % (weeklyClass.get("htmlLink"))
            print(result + "\n")

            # create other events e.g. quiz, assignment etc
            for event in course["events"]:
                eventData = {
                    "summary": event["name"],
                    "location": course["location"],
                    "description": event["description"],
                    "start": {
                        "dateTime": event["startTime"],
                        "timeZone": "Canada/Pacific",
                    },
                    "end": {
                        "dateTime": event["endTime"],
                        "timeZone": "Canada/Pacific",
                    },
                }

                # check if need reminders
                if len(event["reminders"]):
                    reminders = []

                    for reminder in event["reminders"]:
                        tmp = {"method": "popup", "minutes": reminder}
                        reminders.append(tmp)

                    eventData["reminders"] = {
                        "useDefault": False,
                        "overrides": reminders,
                    }

                eventData = (
                    service.events()
                    .insert(calendarId="primary", body=eventData)
                    .execute()
                )
                result = "Event created: %s" % (eventData.get("htmlLink"))
                print(result + "\n")

            response = {
                "success": True,
                "message": "Event created successfully",
                "link": weeklyClass.get("htmlLink"),
            }
        else:
            response = {
                "success": False,
                "message": "The available reminder of an event is 0 mintues to 4 weeks",
            }
    except HttpError as error:
        print(f"HTTP error occurred: {error}")
        abort(500, error)
    except Exception as e:
        print(f"Other error occurred: {e}")

    return response


@app.route("/clear-schedule", methods=["POST"])
def clearEvents():
    response = {"success": False, "message": ""}

    try:
        course = request.get_json()
        creds = checkGooglePermission(course["token"])
        service = build("calendar", "v3", credentials=creds)

        service.calendars().clear(calendarId="primary").execute()
    except HttpError as error:
        print(f"HTTP error occurred: {error}")
        abort(500, error)
    except Exception as e:
        print(f"Other error occurred: {e}")

    return response


@app.route("/authorize", methods=["GET", "POST"])
def authorize():
    # Create flow instance to manage the OAuth 2.0 Authorization Grant Flow steps.
    # app.logger.info("Authorizing")
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES
    )

    # The URI created here must exactly match one of the authorized redirect URIs
    # for the OAuth 2.0 client, which you configured in the API Console. If this
    # value doesn't match an authorized URI, you will get a 'redirect_uri_mismatch'
    # error.
    flow.redirect_uri = flask.url_for("oauth2callback", _external=True)

    authorization_url, state = flow.authorization_url(
        # Enable offline access so that you can refresh an access token without
        # re-prompting the user for permission. Recommended for web server apps.
        access_type="offline",
        # Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes="true",
    )

    # Store the state so the callback can verify the auth server response.
    flask.session["state"] = state
    return {
        "authorization_url": authorization_url,
    }


@app.route("/clear-session", methods=["GET", "POST"])
def clear_session():
    flask.session.clear()
    return flask.redirect("/")


@app.route("/test", methods=["GET", "POST"])
def test_api_request():
    if "credentials" not in flask.session:
        return flask.redirect("authorize")

    # Load credentials from the session.
    credentials = google.oauth2.credentials.Credentials(**flask.session["credentials"])

    drive = googleapiclient.discovery.build(
        API_SERVICE_NAME, API_VERSION, credentials=credentials
    )

    files = drive.files().list().execute()

    # Save credentials back to session in case access token was refreshed.
    # ACTION ITEM: In a production app, you likely want to save these
    #              credentials in a persistent database instead.
    flask.session["credentials"] = credentials_to_dict(credentials)

    return flask.jsonify(**files)


@app.route("/oauth2callback")
def oauth2callback():
    # Specify the state when creating the flow in the callback so that it can
    # verified in the authorization server response.
    state = request.args.get("state")

    # app.logger.info("State: %s", state)

    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        "credentials/credentials.json", scopes=SCOPES, state=state
    )
    flow.redirect_uri = flask.url_for("oauth2callback", _external=True)

    # Use the authorization server's response to fetch the OAuth 2.0 tokens.
    authorization_response = flask.request.url
    flow.fetch_token(authorization_response=authorization_response)

    # Store credentials in the session.
    # ACTION ITEM: In a production app, you likely want to save these
    #              credentials in a persistent database instead.
    credentials = flow.credentials
    # Save credentials to json file
    with open("credentials/token.json", "w") as token:
        token.write(credentials.to_json())
    flask.session["credentials"] = credentials_to_dict(credentials)

    return flask.redirect(flask.url_for("test_api_request"))


def credentials_to_dict(credentials):
    return {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes,
    }


def validateReminder(jsonData):
    for event in jsonData:
        if len(event["reminders"]) > 0:
            for minute in event["reminders"]:
                if minute < 0 or minute > 40320:
                    return False

    return True


@app.route("/upload", methods=["POST"])
def upload():
    courseName = request.form["courseName"]
    roomNumber = request.form["roomNumber"]
    time = request.form["time"]
    file = request.files["outlineFile"]

    tmp = time.split(":")
    hour = int(tmp[0])
    minute = int(tmp[1])

    # create AiParser instance
    config = dotenv_values(".env")
    aiParser = AiParser(file, config["GEMINI_API_KEY"])

    resp = aiParser.generate_json()
    # call image parser
    # rawResp = get_schedule_table(
    #     file_name=file.filename, file_stream=file.read(), schedule_type="course-outline"
    # )

    # events = []
    # noOfWeeks = rawResp["no_of_weeks"]
    # rawEvents = rawResp["events"]

    # for event in rawEvents:
    #     rawDate = datetime.strptime(event["date"], "%Y-%m-%dT%H:%M:%S")
    #     startTime = rawDate.replace(hour=hour, minute=minute)
    #     endTime = startTime + timedelta(minutes=170)

    #     tmp = {
    #         "name": event["name"],
    #         "description": "",
    #         "startTime": startTime.astimezone().strftime("%Y-%m-%dT%H:%M:%S%z"),
    #         "endTime": endTime.astimezone().strftime("%Y-%m-%dT%H:%M:%S%z"),
    #         "reminders": [],
    #     }

    #     events.append(tmp)

    # # get date for first week
    # rawFirstWeekDate = datetime.strptime(rawResp["start_date"], "%Y-%m-%dT%H:%M:%S")
    # startTime = rawFirstWeekDate.replace(hour=hour, minute=minute)
    # endTime = startTime + timedelta(minutes=170)

    # resp = {
    #     "course": courseName,
    #     "location": roomNumber,
    #     "description": "",
    #     "startTime": startTime.astimezone().strftime("%Y-%m-%dT%H:%M:%S%z"),
    #     "endTime": endTime.astimezone().strftime("%Y-%m-%dT%H:%M:%S%z"),
    #     "noOfWeeks": noOfWeeks,
    #     "events": events,
    # }

    return resp

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
