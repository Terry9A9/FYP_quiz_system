import {v5 as uuid} from 'uuid';
import { quiz } from '../../client/src/state'
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


let roomArr =
        {
            id: "weggiwyer4234",
            room_id: 1234,
            status: false,
            public: false,
            password:"",
            quiz_id: "fghj3w5",
            allow_emoji_popup: true,
            create_time: "123123123", //unix
            finish_time: "1233636", //unix
            leaderboard:[
                {
                    playerId: "435yrhgert",
                    userName: "a",
                    totalPoint: 1700,
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
                },
                {
                    playerId: "ghjk5u23",
                    userName: "b",
                    totalPoint: 1500,
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
                },
                {
                    playerId: "fghj039845",
                    userName: "c",
                    totalPoint: 1000,
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
                },
            ],
            players:[
                {
                    playerId: "435yrhgert",
                    userName: "terry",
                    badge:[],
                    rank: 1,
                    mouseLeveTime: 12,
                    mouseLeveCount:2
                },
                {
                    playerId: "fghj039845",
                    userName: "c",
                    badge:[],
                    rank:3
                },
                {
                    playerId: "ghjk5u23",
                    userName: "b",
                    badge:[],
                    rank:3
                },
            ],
        }


export function liveQuiz(io) {

    io.on('connect', async (socket) => {

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            const myInfo = {
                playerId: socket.id,
                userName: socket.id,
                badge:[],
                rank:3
            }
            let index = roomArr.players.findIndex(x => x.playerId == socket.id);
            index === -1 && roomArr.players.push(myInfo)
            socket.emit('join-room-message', myInfo);
            io.sockets.to(roomId).emit('room-info', roomArr);
        });

        socket.on('create-room', () => {
            const roomId = uuid(`${Date.now()}`, uuid.DNS);
            socket.join(roomId);
            socket.emit('join-room-message', `You've join ${roomId} room`);
            io.to(roomId).emit('room-brocast', `${socket.id} has join this room`);
        })

        socket.on('quiz-start', ({roomId:roomId, quizId:quizId}) => {
            let quiz:quiz
            dbconnect((data) => {
                quiz = data;
                console.log(`here is socket quiz: ${JSON.stringify(quiz)}`)
                io.sockets.to(roomId).emit('room-brocast', `Quiz start`);
                //io.sockets.to(roomId).emit('quiz', quiz);
                io.sockets.to(roomId).emit('quiz-start', quiz);
                io.sockets.to(roomId).emit('timerStatus', {status: true , time: quiz.time});
                setTimeout(()=>{
                    io.sockets.to(roomId).emit('timerStatus', {status: false , time: 0});
                    console.log('end_timer')
                }, quiz.time)
            })
        })

        socket.on('next-question', ({roomId:roomId, questionNum:questionNum, quizId: quizId}) => {
            let quiz:quiz
            dbconnect((data) => {
                quiz = data;
                io.sockets.to(roomId).emit('next-question', questionNum);
                io.sockets.to(roomId).emit('timerStatus', {status: true , time: quiz.time});
                setTimeout(()=>{
                    io.sockets.to(roomId).emit('timerStatus', {status: false , time: 0});
                    console.log('end_timer')
                }, quiz.time)
            })
        })

        socket.on('ans_submit', ({questionNum: questionNum, quizId: quizId, ans: selectedAnsIndex, roomId: roomId}) => {
            let quiz:quiz
            dbconnect((data) => {
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
                }
            let rankIndex = roomArr.leaderboard.findIndex((e) => e.playerId === socket.id)
            if ( rankIndex != -1){
                roomArr.leaderboard[rankIndex] = data
            }else{
                roomArr.leaderboard.push(data)
            }
            rank[roomId] = roomArr.leaderboard
            rank[roomId].sort((a,b)=> b.totalPoint - a.totalPoint)
            roomArr.leaderboard =
            io.sockets.to(roomId).emit('show-rank', {status: true , info: rank[roomId].slice(0,5)});
            console.log("rank: "+JSON.stringify(rank).toString())
        })
    })


    const dbSearch = (db, criteria, callback) => {
        let getQuizData = {};
        let cursor = db.collection('Quiz').find(criteria).project({_id:0});
        console.log(`findDocument: ${JSON.stringify(criteria)}`);
        cursor.toArray((err,getQuizData) => {
            assert.equal(err,null);
            console.log(`Number Of Document Found: ${getQuizData.length}`);
            callback(getQuizData[0]) as quiz;
        });
    }

    const dbconnect = (callback) => {
        let fetchData = {};
        const client = new MongoClient(mongourl, {useNewUrlParser: true, useUnifiedTopology: true});
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to mongoDB");
            const db = client.db(dbName);

            //find quiz with passing the search criteria
            console.log(`finding quiz...`);
            let DOCID = {};
            DOCID['_id'] = ObjectID('63df677c25278606dc2881f5');

            dbSearch(db, DOCID, (getQuizData) => {  // docs contain 1 document (hopefully)
                client.close();
                console.log("Close DB connection");
                fetchData = getQuizData;
                callback(fetchData) as quiz
            });
        })
    }
}

