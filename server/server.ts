import Koa from 'koa';
import Router from 'koa-router';
import bodyparser from 'koa-bodyparser';
import { instrument } from"@socket.io/admin-ui";
const cors = require('@koa/cors');
import {v5 as uuid} from 'uuid';
import {quiz} from "../client/src/state"

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mongourl = 'mongodb+srv://FYP:123@cluster0.oxp1vse.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'FYP_DATA';
const assert = require('assert');

const app = new Koa();
const router = new Router();
const port: number = 3004;

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
    console.log(`Time: ${Date.now()} Path: ${ctx.URL.pathname}`);
    await next();
});

type stuProfile = {
    socketId: string,
    totalPoint: number
}

router.get('/api/play/quiz/:quizId', async ctx => {
    let quiz_id = ctx.params
    // "2023-01-13T05:52:49.508Z" is a ISO date format (ISO 8601)
    let quiz_set =
        {
            quiz_id: "84532",
            created_by: "terry",
            course: "COMP333",
            start_date: "2023-01-11T05:52:49.508Z",
            end_date: "2023-01-13T05:52:49.508Z",
            time: 30,
            mc: true,
            random: true,
            questionSet: [
                {
                    question: "when1",
                    img: "",
                    answers: ["have", "grade", "ar"],
                    correct: 2
                },
                {
                    question: "when2",
                    img: "",
                    answers: ["have", "grade", "ar"],
                    correct: 1
                },
                {
                    question: "when3",
                    img: "",
                    answers: ["have", "grade", "ar", "ar"],
                    correct: 4
                },
            ]
        }
    //const numOfQuestion = quiz_set.questionSet.length
    ctx.body = quiz_set
    // syncTimer(quiz_set.time, numOfQuestion);
});

router.get('/api/quiz/:roomId', async ctx => {
    ctx.body = ctx.params;
});

app.use(router.routes());
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

let rank = {}
let rankPointArr : stuProfile[] = []

io.on('connect', async (socket) => {

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.emit('join-room-message', `You've join ${roomId} room`);
        io.sockets.to(roomId).emit('room-brocast', `${socket.id} has join this room`);
    });
    socket.on('create-room', () => {
        const roomId = uuid(`${Date.now()}`, uuid.DNS);
        socket.join(roomId);
        socket.emit('join-room-message', `You've join ${roomId} room`);
        io.to(roomId).emit('room-brocast', `${socket.id} has join this room`);
    })
    socket.on('quiz-start', ({roomId:roomId, quizId:quizId}) => {
        let quiz = findQuiz(quizId) as quiz
        io.sockets.to(roomId).emit('room-brocast', `Quiz start`);
        //io.sockets.to(roomId).emit('quiz', quiz);
        io.sockets.to(roomId).emit('quiz-start', quiz);
        io.sockets.to(roomId).emit('timerStatus', {status: true , time: quiz.time});
        setTimeout(()=>{
                io.sockets.to(roomId).emit('timerStatus', {status: false , time: 0});
                console.log('end_timer')
            }, quiz.time)
    })
    socket.on('next-question', ({roomId:roomId, questionNum:questionNum, quizId: quizId}) => {
        let quiz = findQuiz(quizId) as quiz
        io.sockets.to(roomId).emit('next-question', questionNum);
        io.sockets.to(roomId).emit('timerStatus', {status: true , time: quiz.time});
        setTimeout(()=>{
            io.sockets.to(roomId).emit('timerStatus', {status: false , time: 0});
            console.log('end_timer')
        }, quiz.time)
    })

    socket.on('ans_submit', ({questionNum: questionNum, quizId: quizId, ans: selectedAnsIndex, roomId: roomId}) => {
        let quiz = findQuiz(quizId) as quiz
        if (quiz.questionSet[questionNum].correct == selectedAnsIndex){
            socket.emit('point', quiz.questionSet[questionNum].point);
        }
    })

    socket.on('point_submit', ({roomId: roomId, totalPoint: totalPoint}) => {
        let data = {socketId: socket.id, totalPoint: totalPoint}
        let rankIndex = rankPointArr.findIndex((e:{socketId:string}) => e.socketId === socket.id)
        if ( rankIndex != -1){
            rankPointArr[rankIndex] = data
        }else{
            rankPointArr.push(data)
        }
        rank[roomId] = rankPointArr
        rank[roomId].sort((a,b)=> b.totalPoint - a.totalPoint)
        io.sockets.to(roomId).emit('show-rank', {status: true , info: rank[roomId]});
        console.log(JSON.stringify(rank).toString())
    })
})

const getQuiz = (db, criteria, callback) => {
    let cursor = db.collection('Quiz').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err,quizdata) => {
        assert.equal(err,null);
        console.log(`Number Of Document Found: ${quizdata.length}`);
        callback(quizdata);
    });
}

const findQuiz = (quizId) => {
    //connect to mongoDB
    const client = new MongoClient(mongourl);
    var quizdata = {}
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to mongoDB");
        const db = client.db(dbName);

        //find quiz with passing the search criteria
        console.log(`finding quiz...`);
        let DOCID = {};
        DOCID['_id'] = ObjectID('63df677c25278606dc2881f5');

		getQuiz(db, DOCID, (quizdata) => {  // docs contain 1 document (hopefully)
            console.log(`quiz: ${JSON.stringify(quizdata)}`);
            client.close();
            console.log("Close DB connection");
		});
    });
    return quizdata
}




