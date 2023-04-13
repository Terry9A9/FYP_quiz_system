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
            console.log(`user ${studId} join room ${roomId}`)
            let roomIndex = roomArr.findIndex(x => x.room_id == roomId)
            const myInfo = {
                playerId:socket.id,
                userName:studId || 'anonymous',
                totalPoint:0,
                mouseleaveTime:0,
                mouseleaveCount:0,
                answered_question:[]
            }
            if (roomIndex === -1){
                dbconnect("room", roomId,(roomInfo) => {
                    let roomIndex = roomArr.findIndex(x => x.room_id == roomId)
                    roomIndex === -1 && roomArr.push(roomInfo) // if room not exist in roomArr then push it

                    let index = roomInfo.leaderboard.findIndex(x => x.userName == studId);
                    index === -1 && roomInfo.leaderboard.push(myInfo) // if user not exist in leaderboard then push it

                    socket.emit('join-room-message', myInfo);
                    io.sockets.to(roomId).emit('room-info', roomInfo);
                    console.log(roomArr)
                })  
            }else {
                let index = roomArr[roomIndex].leaderboard.findIndex(x => x.userName == studId);
                index === -1 && roomArr[roomIndex].leaderboard.push(myInfo)
                socket.emit('join-room-message', myInfo);
                io.sockets.to(roomId).emit('room-info', roomArr[roomIndex]);
            }
        });

        socket.on('create-room', () => { //ignore this
            const roomId = uuid(`${Date.now()}`, uuid.DNS);
            socket.join(roomId);
            socket.emit('join-room-message', `You've join ${roomId} room`);
            io.to(roomId).emit('room-brocast', `${socket.id} has join this room`);
        })

        socket.on('quiz-start', ({roomId:roomId, quizId:quizId}) => {
            let quiz:quiz
            let roomIndex = roomArr.findIndex(x => x.room_id == roomId);
            roomArr[roomIndex].status = true;
            dbconnect("quiz", quizId,(data) => {
                quiz = data;
                console.log(`here is socket quiz: ${JSON.stringify(quiz)}`)
                io.sockets.to(roomId).emit('room-brocast', `Quiz start`);
                io.sockets.to(roomId).emit('quiz-start', quiz);
                io.sockets.to(roomId).emit('timerStatus', {status: true , time: quiz.time});
            })
        })

        socket.on('quiz-finish', ({roomInfo: roomInfo}) => {
            console.log("quiz-finish")
            let roomIndex = roomArr.findIndex(x => x.room_id == roomInfo.room_id);
            roomArr[roomIndex].status = false;
            dbconnect("replaceRoom", roomArr[roomIndex],(roomInfo) => {
                console.log(roomInfo)
            }) 
            // roomArr.splice(roomIndex,1)
        })

        // when timer end, emit end-timer to client
        socket.on('end-timer',({roomId:roomId}) => {
            io.sockets.to(roomId).emit('timerStatus', {status: false , time: 0});
            console.log('end_timer')
        })

        socket.on('next-question', ({roomId:roomId, questionNum:questionNum, time: time}) => {
            let roomIndex = roomArr.findIndex(x => x.room_id == roomId);
            roomArr[roomIndex].question_num = questionNum;
            io.sockets.to(roomId).emit('next-question', questionNum);
            io.sockets.to(roomId).emit('timerStatus', {status: true , time: time});
        })

        // when count down end client submit the total point then we rank it and update the leaderboard
        socket.on('point-submit', ({roomId: roomId, totalPoint: totalPoint, myInfo: myInfo}) => { 
            let roomIndex = roomArr.findIndex((e) => e.room_id === roomId)
            let rankIndex = roomArr[roomIndex]?.leaderboard?.findIndex((e) => e.userName === myInfo.userName)
            if ( rankIndex != -1){
                roomArr[roomIndex].leaderboard[rankIndex] = myInfo
            }else{
                roomArr[roomIndex]?.leaderboard.push(myInfo)
            }
            rank[roomId] = roomArr[roomIndex].leaderboard
            rank[roomId].sort((a,b)=> b.totalPoint - a.totalPoint)
            roomArr[roomIndex].leaderboard = rank[roomId]
            io.sockets.to(roomId).emit('show-rank', {status: true , info: rank[roomId].slice(0,5), roomInfo: roomArr[roomIndex]});
            console.log("rank: "+JSON.stringify(rank).toString())
        })
    })

    const dbReplaceRoom = async (db, criteria, replace, callback) => {
        let replaceRoomData = {};
        const result = await db.collection('Rooms').replaceOne(criteria, replace)
        console.log(`Modified ${result.modifiedCount} document(s)`);
        callback("success")
    }

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
        try {
            let fetchQuizData = {} as quiz;
            let fetchRoomData = {} as room;
            const client = new MongoClient(mongourl, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect((err) => {
                try{
                    assert.equal(null, err);
                    console.log("Connected successfully to mongoDB");
                    const db = client.db(dbName);
    
                    //find quiz with passing the search criteria
                    console.log(queryTpye)
    
                    switch (queryTpye) {
                        case "quiz":
                            let quizQuery = {};
                            console.log(`finding quiz...`);
                            quizQuery['quiz_id'] = queryValue;
                            dbSearchQuiz(db, quizQuery, (getQuizData) => {  // docs contain 1 document (hopefully)
                                client.close();
                                console.log("Close DB connection");
                                fetchQuizData = getQuizData;
                                callback(fetchQuizData) as quiz
                            });
                            break;
    
                        case "room":
                            let roomQuery = {};
                            console.log(`finding room...`);
                            roomQuery['room_id'] = queryValue;
                            dbSearchRoom(db, roomQuery, (getRooomData) => {  // docs contain 1 document (hopefully)
                                client.close();
                                console.log("Close DB connection");
                                fetchRoomData = getRooomData;
                                callback(fetchRoomData) as room
                            });
                            break;
    
                        case "replaceRoom":
                            let replaceRoomQuery = {};
                            console.log(`replace room...`);
                            replaceRoomQuery['room_id'] = queryValue.room_id;
                            dbReplaceRoom(db, replaceRoomQuery, queryValue, (getRooomData) => {
                                client.close();
                                console.log("Close DB connection");
                            })
                            break;
                    }
                }catch{ console.error("mongoDB connection error")}
               

            })
        } catch { console.error("mongoDB connection error") }
    }
}

