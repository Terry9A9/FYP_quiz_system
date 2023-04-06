import express from 'express'
import bodyparser from 'body-parser';
import { instrument } from"@socket.io/admin-ui";
import cors from 'cors'

import {liveQuiz} from './controllers/liveQuiz';
import {v5 as uuid} from 'uuid';
import {quiz,room} from "../client/src/state"
import { getUserData, handleLogin } from './controllers/loginFunction';

import { GptQuizAPI } from './controllers/GetGptQuiz';
const app = express()
const port: number = 3004;

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors());
app.use((req,res, next) => {
    console.log(`Time: ${Date.now()} Path: ${req.path}`);
    next();
});

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mongourl = 'mongodb+srv://FYP:123@cluster0.oxp1vse.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'FYP_DATA';
const assert = require('assert');

type stuProfile = {
    socketId: string,
    totalPoint: number
}

app.get('/api/gptQuiz/:lectureNoteNum', (req, res) => {
    GptQuizAPI(req.params.lectureNoteNum).then((result) => {res.send(result)})
});

app.get('/api/quiz/:roomId', (req,res) => {
    req.body = req.params;
    res.send("12");
});

app.post('/api/login', async(req,res) => {
    const idTokenClaims = JSON.parse(req.body.idTokenClaims);
    const user = JSON.parse(req.body.user);
    //console.log(`Received data: ${idToken} ${idTokenClaims}, ${user}`);
    //push the login data to the database
    const loginData = {
        displayName: user.displayName,
        oid: idTokenClaims.oid,
        email: user.mail,
        loginTime: idTokenClaims.iat,
    }

    //push the data to DB
    const client = new MongoClient(mongourl, {useNewUrlParser: true, useUnifiedTopology: true});
    await client.connect((err) => {
		console.log("[LoginData] Connected successfully to mongoDB");
		const db = client.db(dbName);

		db.collection('loginData').insertOne(loginData, function (err, collection) {
			if (err) throw err;
			console.log(`[loginData] Record inserted Successfully: ${JSON.stringify(loginData)}`);
		});

        //find the user in the database and get the role
        let cursor = db.collection('User').find({oid:idTokenClaims.oid}).project({_id:0});
        console.log(`[role] finding User: ${JSON.stringify(idTokenClaims.oid)}`);
        cursor.toArray((err,getUserData) => {
            //handle the result
            if(getUserData.length > 0) {
                console.log(`Found User: ${getUserData[0].display_name}`);
                console.log(`User role: ${getUserData[0].role}`);
                res.json({role:getUserData[0].role});
                client.close();
            } else { //If user not found in database, role "student" will be assigned
                console.log(`[role] No User found in record, assign role "student" to this user and add to database`);
                // load the data to database
                const data = {
                    display_name: user.displayName,
                    email: user.mail,
                    role: "student",
                    oid: idTokenClaims.oid
                }
                db.collection('User').insertOne(data, function (err, collection) {
                    if (err) throw err;
                    console.log(`[User] Record inserted Successfully: ${JSON.stringify(loginData)}`);
                });
                res.json({role:"student"});
                client.close();
            }
        });
    });
});

app.post('/api/get-role', async(req,res) => {
    const idTokenClaims = JSON.parse(req.body.idTokenClaims);

    const client = new MongoClient(mongourl, {useNewUrlParser: true, useUnifiedTopology: true});
    await client.connect((err) => {
		console.log("[role] Connected successfully to mongoDB");
		const db = client.db(dbName);

        //find the user in the database and get the role
        let cursor = db.collection('User').find({oid:idTokenClaims.oid}).project({_id:0});
        console.log(`[role] finding User: ${JSON.stringify(idTokenClaims.oid)}`);
        cursor.toArray((err,getUserData) => {
            //handle the result
            if(getUserData.length > 0) {
                console.log(`Found User: ${getUserData[0].display_name}`);
                console.log(`User role: ${getUserData[0].role}`);
                res.json({role:getUserData[0].role});
            } else { //If user not found in database, role "student" will be assigned
                console.log(`[role] No User found in record, assign role "student" to this user`);
                res.json({role:"student"});
            }
        });
        client.close();
    });

});

app.post('/api/rooms', async (req, res) => {
    const { room_name, quiz_id, ispublic, password, allow_emoji_popup, create_time } = req.body;
  
    // Generate random room ID
    const room_id = (Math.floor(Math.random() * 99999999) + 1).toString;
    // Create new room object
    const newRoom = {
      room_id,
      room_name,
      status: true,
      ispublic,
      password,
      quiz_id,
      allow_emoji_popup,
      create_time,
      finish_time: '',
      leaderboard: []
    };
    
    const client = new MongoClient(mongourl, {useNewUrlParser: true, useUnifiedTopology: true});
    await client.connect((err) => {
        const db = client.db(dbName);
        db.collection('Rooms').insertOne(newRoom, function (err, collection) {
            if (err) throw err;
            console.log(`[Rooms] Record inserted Successfully: ${JSON.stringify(newRoom)}`);
        });
    });
    client.close();
  });
const server = app.listen(port, () => {
    console.log(`Server start at port http://localhost:${port}`)
});

const io = require('socket.io')(server, {
    cors: {
        origin: ["http://localhost:5173","https://admin.socket.io"],
        methods: ["GET", "POST"]
    }
})

instrument(io, {
    auth: false
});



  
liveQuiz(io)
