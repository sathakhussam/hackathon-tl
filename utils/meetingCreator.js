const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library"); // Use OAuth2Client instead of OAuth2
const fs = require("fs");
const readline = require("readline");
const { v4: uuidv4 } = require("uuid");
// Scopes for Google Calendar
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = "utils/files/token.json";
const CREDENTIALS_PATH = "utils/files/credentials.json";

class CreateMeet {
  attendees = null;
  eventTime = null;
  topic = null;
  constructor(attendees, eventTime, topic) {
    this.attendees = attendees;
    this.eventTime = eventTime;
    this.topic = topic;
  }

  async start() {
    const auth = await this.authenticate();

    const attendeesList = this.attendees.map((email) => ({ email }));
    const event = await this.createEvent(
      attendeesList,
      this.eventTime,
      auth,
      this.topic
    );
    return event["hangoutLink"];
  }

  async createEvent(attendees, eventTime, auth, topic) {
    const calendar = google.calendar({ version: "v3", auth });
    const event = {
      conferenceData: {
        createRequest: {
          requestId: uuidv4(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      attendees,
      start: { dateTime: eventTime.start, timeZone: "Asia/Kolkata" },
      end: { dateTime: eventTime.end, timeZone: "Asia/Kolkata" },
      summary: topic,
      reminders: { useDefault: true },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      sendNotifications: true,
      conferenceDataVersion: 1,
      requestBody: event,
    });
    return response.data;
  }

  async authenticate() {
    try {
      let creds;
      let initialCreds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
      if (fs.existsSync(TOKEN_PATH)) {
        creds = JSON.parse(fs.readFileSync(TOKEN_PATH));
      } else {
        creds = await this.getNewToken();
      }
      const { client_secret, client_id, redirect_uris } = initialCreds.web;
      const oAuth2Client = new OAuth2Client(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      if (creds) {
        oAuth2Client.setCredentials(creds);
        if (creds.expiry_date <= Date.now()) {
          await oAuth2Client.refreshAccessToken();
        }
        return oAuth2Client;
      }
    } catch (error) {
      console.error("Error in authentication", error);
      throw error;
    }
  }

  async getNewToken() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new OAuth2Client(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    return await Promise((resolve, reject) => {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });

      console.log("Authorize this app by visiting this url:", authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("Enter the code from that page here: ", (code) => {
        rl.close();
        oAuth2Client
          .getToken(code)
          .then((token) => {
            if (!token) {
              reject(new Error("Invalid token received"));
            }
            oAuth2Client.setCredentials(token);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(token["tokens"]));
            resolve(oAuth2Client);
          })
          .catch((err) => {
            console.error("Error retrieving access token:", err);
            reject(err);
          });
      });
    });
  }
}

// const main = async () => {
//   const x = new CreateMeet(
//     ["uzhamdev@gmail.com"],
//     {
//       start: `2024-09-22T16:48:44.938Z`,
//       end: `2024-09-22T17:48:44.938Z`,
//     },
//     "HI"
//   );
//   console.log(await x.start());
// };

// main();

module.exports = CreateMeet;
