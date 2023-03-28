import {v5 as uuid} from 'uuid';
import { quiz, room } from '../../client/src/state'
type stuProfile = {
    socketId: string,
    totalPoint: number
}

let rank = {}
let rankPointArr : stuProfile[] = []
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mongourl = 'mongodb+srv://FYP:123@cluster0.oxp1vse.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'FYP_DATA';
const assert = require('assert');


let roomArr = [] as room[]

export function liveQuiz(io) {

    io.on('connect', async (socket) => {

        socket.on('join-room', (roomId, studId) => {
            socket.join(roomId);
            let roomIndex = roomArr.findIndex(x => x.room_id == roomId)
            const myInfo = {
                playerId:socket.id,
                userName:studId,
                totalPoint:0,
                mouseleaveTime:0,
                mouseleaveCount:0,
                answered_question:[]
            }
            if (roomIndex === -1){
                dbconnect("room", roomId,(roomInfo) => {
                    let roomIndex = roomArr.findIndex(x => x.room_id == roomId)
                    roomIndex === -1 && roomArr.push(roomInfo)
                    let index = roomInfo.leaderboard.findIndex(x => x.userName == studId);
                    index === -1 && roomInfo.leaderboard.push(myInfo)
                    socket.emit('join-room-message', roomInfo);
                    io.sockets.to(roomId).emit('room-info', roomInfo);
                    console.log(roomArr)
                })  
            }else {
                let index = roomArr[roomIndex].leaderboard.findIndex(x => x.userName == studId);

                index === -1 && roomArr[roomIndex].leaderboard.push(myInfo)
                socket.emit('join-room-message', roomArr[roomIndex]);
                io.sockets.to(roomId).emit('room-info', roomArr[roomIndex]);
                console.log(roomArr,"else" , roomArr[roomIndex].leaderboard)
            }
           
        });

        socket.on('create-room', () => {
            const roomId = uuid(`${Date.now()}`, uuid.DNS);
            socket.join(roomId);
            socket.emit('join-room-message', `You've join ${roomId} room`);
            io.to(roomId).emit('room-brocast', `${socket.id} has join this room`);
        })

        socket.on('quiz-start', ({roomId:roomId, quizId:quizId}) => {
            let quiz:quiz
            dbconnect("quiz", quizId,(data) => {
                quiz = data;
                console.log(`here is socket quiz: ${JSON.stringify(quiz)}`)
                io.sockets.to(roomId).emit('room-brocast', `Quiz start`);
                io.sockets.to(roomId).emit('quiz-start', quiz);
                io.sockets.to(roomId).emit('timerStatus', {status: true , time: quiz.time});
            })
        })

        socket.on('end-timer',({roomId:roomId}) => {
            io.sockets.to(roomId).emit('timerStatus', {status: false , time: 0});
            console.log('end_timer')
        })

        socket.on('next-question', ({roomId:roomId, questionNum:questionNum, quizId: quizId}) => {
            let quiz:quiz
            dbconnect("quiz","84532",(data) => {
                quiz = data;
                io.sockets.to(roomId).emit('next-question', questionNum);
                io.sockets.to(roomId).emit('timerStatus', {status: true , time: quiz.time});
            })
        })

        socket.on('ans_submit', ({questionNum: questionNum, quizId: quizId, ans: selectedAnsIndex, roomId: roomId}) => {
            let quiz:quiz
            dbconnect("quiz","84532", (data) => {
                if(quiz.question_set[questionNum].correct == selectedAnsIndex){
                    socket.emit('point', quiz.question_set[questionNum].point);
                }
            })
        })

        socket.on('point-submit', ({roomId: roomId, totalPoint: totalPoint}) => {
            let data = {
                playerId: socket.id,
                userName: socket.id,
                totalPoint: totalPoint,
                mouseleaveTime:0,
                mouseleaveCount:0,
                answered_question:[
                    {
                        type:"mc",
                        correct: true,
                        ans: ["1"] //mc index
                    },
                    {
                        type:"fill",
                        correct: true,
                        ans: ["test","test1"]
                    },
                    {
                        type:"t&f",
                        correct: true,
                        ans: ["test","test1"]
                    },
                ]
            };
            let roomIndex = roomArr.findIndex((e) => e.room_id === roomId)
            let rankIndex = roomArr[roomIndex].leaderboard?.findIndex((e) => e.playerId === socket.id)
            if ( rankIndex != -1){
                roomArr[roomIndex].leaderboard[rankIndex] = data
            }else{
                roomArr[roomIndex].leaderboard.push(data)
            }
            rank[roomId] = roomArr[roomIndex].leaderboard
            rank[roomId].sort((a,b)=> b.totalPoint - a.totalPoint)
            io.sockets.to(roomId).emit('show-rank', {status: true , info: rank[roomId].slice(0,5)});
            console.log("rank: "+JSON.stringify(rank).toString())
        })
    })


    const dbSearchQuiz = (db, criteria, callback) => {
        let getQuizData = {};
        let cursor = db.collection('Quiz').find(criteria).project({_id:0});
        console.log(`findDocument: ${JSON.stringify(criteria)}`);
        cursor.toArray((err,getQuizData) => {
            assert.equal(err,null);
            console.log(`Number Of Document Found: ${getQuizData.length}`);
            callback(getQuizData[0]) as quiz;
        });
    }

    const dbSearchRoom = (db, criteria, callback) => {
        let getRoomData = {};
        let cursor = db.collection('Rooms').find(criteria).project({_id:0});
        console.log(`findDocument: ${JSON.stringify(criteria)}`);
        cursor.toArray((err,getRoomData) => {
            assert.equal(err,null);
            console.log(`Number Of Document Found: ${getRoomData.length}`);
            callback(getRoomData[0]) as quiz;
        });
    }

    const dbUpdateRoom = (db, criteria, callback) => {
        let getRoomData = {};
        let cursor = db.collection('Rooms').update(criteria)
        console.log(`findDocument: ${JSON.stringify(criteria)}`);
        cursor.toArray((err,getRoomData) => {
            assert.equal(err,null);
            console.log(`Number Of Document Found: ${getRoomData.length}`);
            callback(getRoomData[0]) as quiz;
        });
    }


    const dbconnect = (queryTpye, queryValue ,callback) => {
        let fetchQuizData = {} as quiz;
        let fetchRoomData = {} as room;
        const client = new MongoClient(mongourl, {useNewUrlParser: true, useUnifiedTopology: true});
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to mongoDB");
            const db = client.db(dbName);

            //find quiz with passing the search criteria
            console.log(`finding quiz...`);
            let DOCID = {};

            switch(queryTpye){
                case "quiz" :
                    DOCID['quiz_id']=queryValue;
                    dbSearchQuiz(db, DOCID, (getQuizData) => {  // docs contain 1 document (hopefully)
                        console.log("Close DB connection");
                        fetchQuizData = getQuizData;
                        callback(fetchQuizData) as quiz
                    });
                
                case "room":
                    DOCID['room_id']=queryValue;
                    dbSearchRoom(db, DOCID, (getRooomData) => {  // docs contain 1 document (hopefully)
                        console.log("Close DB connection");
                        fetchRoomData = getRooomData;
                        callback(fetchRoomData) as room
                    });
        
            }
            client.close();
        })
    }
}

