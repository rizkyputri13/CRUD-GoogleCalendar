const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const { google } = require('googleapis');

const dbConfig = require("./config/db.config");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    secret: "COOKIE_SECRET",
    httpOnly: true,
  })
);

const db = require("./models");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "admin",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_PRIVATE_KEY= "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6g/Xv5Ft8Urxc\nBs9NtNFB+PPK/OE86tMH3RavsQ8LAiAZk1mndr4lmXuWxaZiOsC3d1alJy4byxIX\naCKFoSTwHlmf1QsUSmb7/uVZZq9PjKUCqYeGZcoGFuvAhbYoBmaJd3OUDc5nDk14\naRPIFJtLhmXy+U2+DZboCRTwHdL/5gruDX0LLjqIrrdZ2J4f/d9v1RVbC8sX//Nx\nlsJx7+7f+k0Qlm06HQIcietF8uvNQe5pGzy6KD8eX+iiOMJy1+84RqjEYBC+7ky/\nvRMngREZHlZ/GANYzDJODMb2Swzb4PeLExwWReuiq8wgfjPJMIWnPVBfNbKdGGbn\ngYEwPap5AgMBAAECggEABnzLTRnZbEfmRRcCttUCn9EIgs+cXS2c+OsB4bXOsa8e\n3cuJfL46uNeqNrP0g09q7167ZkEdqj9m8fvlZ9Y+G4uEtMm4tKRDXtcZKWHy2FlK\neTRGHQtqlTRkJMUfMUHKvH6UXV/vEALYIzzCwJd7O4Dm3Xu6LmbY2u82RHABzDSI\nHUtcIobK2nX64nsPJvJdV/DbZPrUVdbqrgcdQYYVOhD2SXl2OGcsDOLKTN2Yp8CY\nOnCUyvFRtmqj7MCFPvvS3B9UhmqKCNyA/NxW//Rx8Sj3UtN3R+i2gxjH+0MfH85H\nFcSfa82Ame5qWIEq1AW9IajpN2TxThOimlkI9zqWAQKBgQDiphsdWf/u0oRS7JCi\nVd2IYOVHKbO6MLLKEs7dYTqoqjFHmTB3nSVQfgg9JVUG51QHqr6kA0nyNjFPyjGa\nUS/O1SkPtHk6Ey9hHQEI+IEBv2Y9avg8knM0Dyk9xErdSm6Zs/Fm9qeyk0OygzFv\njrUzj4LFLPNT+xYwp/tY/+l0eQKBgQDSq1jwIuCaz2aspG2rdsbVovoLJRxN0+oy\nZLuObS8+snVGDEQJN0Uym2TeFji8D2bn1uEWmob8ZExgDv4VdLYTCdrz5t78zxuO\nCps5tzKSEaxAdtkq9WwPkQBEdMbfVx2/ux3i/TJDb90p8K7/yxtV51cE/gxnfkeO\nxx1hWExmAQKBgQCZCcftPcQOop8uzwWqV4hKegLW1lXBNvjCcYi0+t383U6BJfMQ\nEVAM1c0CXJ7ZFoIq2yP24zGfFvCdC84KgR9i7ZPYQuhISoQHcuosAIA7id2jQwNz\nAwA++q3CQzS5z3R23IX4HDyH2+AuPV+4EAhSVGjccsmqvzPwjrytD7+3IQKBgQCS\nGxwXj1jOhUDkQzV8UWgdCmb4C8jRgUNPp+UcJkU56nLDHgahjZ+ENZmDHU5DvzrT\nV4fMMWek67q8dClroAIWuiMMPPYxx0GJBXoaUR/VhkQ8gTCkRomnUh0pXQQAKV8M\ndi2IG6occxyj1bTI2ogez87eO4NG06G1OAr8VEzIAQKBgAFIkxOFqMb5aK1NQONW\nnnWFg7g6V2vNfSS1e4kjB9wyOQ5d8TpR/feC2DyWYSpXfioqXqXQhMWc+toC8Mac\nzX9Co54JH7HVJFZ+xrxpi3Q6ouz9hCrstDaAQbgsiUBMrrFKp+C5zobQaj+x+VT+\nbdZ+fy9ISlD85hF9ZgB9LFHG\n-----END PRIVATE KEY-----\n"
const GOOGLE_CLIENT_EMAIL = "calendar@core-silicon-380604.iam.gserviceaccount.com"
const GOOGLE_PROJECT_NUMBER = "546004617940"
const GOOGLE_CALENDAR_ID =   "d1676426b7dcd86aa9601be3b30ee3ff28f59ef411c4e7bfd0f6a53c8824cc89@group.calendar.google.com"


const jwtClient = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  null,
  GOOGLE_PRIVATE_KEY,
  SCOPES
);

const calendar = google.calendar({
  version: 'v3',
  project: GOOGLE_PROJECT_NUMBER,
  auth: jwtClient
});

app.get('/', (req, res) => {
  calendar.events.list({
    calendarId: GOOGLE_CALENDAR_ID,
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (error, result) => {
    if (error) {
      res.send(JSON.stringify({ error: error }));
    } else {
      if (result.data.items.length) {
        res.send(JSON.stringify({ events: result.data.items }));
      } else {
        res.send(JSON.stringify({ message: 'No upcoming events found.' }));
      }
    }
  });
});

app.get("/createEvent",(req,res)=>{
  var event = {
    'summary': 'My first event!',
    'location': 'Magelang, Indonesia',
    'description': 'First event with nodeJS!',
    'start': {
      'dateTime': '2023-03-15T09:00:00-07:00',
      'timeZone': 'Asia/Jakarta',
    },
    'end': {
      'dateTime': '2023-03-15T17:00:00-07:00',
      'timeZone': 'Asia/Jakarta',
    },
    'attendees': [],
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10},
      ],
    },
  };
  
  const auth = new google.auth.GoogleAuth({
    keyFile: '<full-path-of-JSON-file>',
    scopes: 'https://www.googleapis.com/auth/calendar',
  });
  auth.getClient().then(a=>{
    calendar.events.insert({
      auth:a,
      calendarId: GOOGLE_CALENDAR_ID,
      resource: event,
    }, function(err, event) {
      if (err) {
        console.log('There was an error contacting the Calendar service: ' + err);
        return;
      }
      console.log('Event created: %s', event.data);
      res.jsonp("Event successfully created!");
    });
  })
})

