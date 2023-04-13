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

app.get('/api/attendanceQuiz/:quizID', cors({ origin: false }), async (req, res) => {
    const client = await MongoClient.connect(mongourl,{ useNewUrlParser: true, useUnifiedTopology: true });
    const coll = client.db('FYP_DATA').collection('Quiz');
    let cursor = coll.find({quiz_id:req.params.quizID}).project({_id:0});
    const result = await cursor.toArray();
    await client.close();
    res.json(result[0])
});

app.get('/api/gptQuiz/:lectureNoteID', cors({ origin: false }), (req, res) => {
    GptQuizAPI(req.params.lectureNoteID).then((result) => {res.send(result)})
});

app.get('/api/quiz/:roomId',cors({ origin: false }), (req,res) => {
    req.body = req.params;
    res.send("12");
});

app.post('/api/login',cors({ origin: false }), async(req,res) => {
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
    const client = await MongoClient.connect(mongourl,{ useNewUrlParser: true, useUnifiedTopology: true });
    //push the data to DB
    try{
        const db = client.db('FYP_DATA');
        db.collection('loginData').insertOne(loginData, function (err, collection) {
			if (err) throw err;
			console.log(`[loginData] Record inserted Successfully: ${JSON.stringify(loginData)}`);
		});
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
                try{
                    db.collection('User').insertOne(data, function (err, collection) {
                        if (err) throw err;
                        console.log(`[User] Record inserted Successfully: ${JSON.stringify(loginData)}`);
                    });
                    res.json({role:"student"});
                    
                }finally{
                    client.close();
                }
                
            }
        });
    }finally{
        client.close();
    }
});

app.post('/api/get-role',cors({ origin: false }), async(req,res) => {
    const idTokenClaims = req.body.idTokenClaims
    const client = await MongoClient.connect(mongourl,{ useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('FYP_DATA');
    const collection = db.collection('User');
    let cursor = collection.find({oid:idTokenClaims.oid}).project({_id:0});
    console.log(`[role] finding User: ${JSON.stringify(idTokenClaims.oid)}`);
    const result = await cursor.toArray();
    if(result.length > 0) {
        console.log(`Found User: ${result[0].display_name}`);
        console.log(`User role: ${result[0].role}`);
        res.json({role:result[0].role});
    } else { //If user not found in database, role "student" will be assigned
        console.log(`[role] No User found in record, assign role "student" to this user`);
        res.json({role:"student"});
    }
});

app.get('/download/:note_id', downloadPDF);

async function downloadPDF (req, res){
    let note_id = req.params.note_id;
    const client = await MongoClient.connect(mongourl,{ useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('FYP_DATA');
    const collection = db.collection('courses');
    const projection = {
        'notes.$': 1
      };
    const pdf = await collection.find({"notes.note_id":note_id},{projection});
    const result = await pdf.toArray();
    if (!result) {
      return res.status(404).json({
        message: 'PDF file not found',
      });
    }
  
    const buffer = Buffer.from(result[0].notes[0].content.buffer);
  
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${result[0].notes[0].title}.pdf`);
    res.send(buffer);
  
    client.close();
};

app.post('/api/getRooms',cors({ origin: false }), async(req,res) => {
    const client = await MongoClient.connect(mongourl,{ useNewUrlParser: true, useUnifiedTopology: true });
    try{
        const db = client.db('FYP_DATA');
        const collection = db.collection('Rooms');
        let cursor = collection.find({status: true})
        cursor.toArray((err,getRoomData) => {
            res.send({data:getRoomData});
        });
    }finally{
        client.close();
    }
});
app.get("/socket.io",cors({ origin: false }))
app.post('/api/rooms',cors({ origin: false }), async (req, res) => {
    const { room_name, quiz_id, create_time, quiz_type, create_by, room_id } = req.body;
  
    // Generate random room ID
    
    // Create new room object
    const newRoom : room = {
        room_id,
        room_name,
        status: true,
        quiz_id,
        create_time,
        finish_time: '',
        quiz_type: quiz_type,
        leaderboard: [],
        create_by: create_by,
        question_num: -1,
        course: 'ELECS431F',
    };
    const client = await MongoClient.connect(mongourl,{ useNewUrlParser: true, useUnifiedTopology: true });
    try{
        const db = client.db('FYP_DATA');
        db.collection('Rooms').insertOne(newRoom, function (err, collection) {
            if (err) throw err;
            console.log(`[Rooms] Record inserted Successfully: ${JSON.stringify(newRoom)}`);
        });
    }finally{
        client.close();
    }
  });
const server = app.listen(port, () => {
    console.log(`Server start at port http://localhost:${port}`)
});

const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
})

instrument(io, {
    auth: false
});



  
liveQuiz(io)
