import Koa from 'koa';
import Router from 'koa-router';
import bodyparser from 'koa-bodyparser';
import { instrument } from"@socket.io/admin-ui";

const cors = require('@koa/cors');
import {v5 as uuid} from 'uuid';


const app = new Koa();
const router = new Router();
const port: number = 3004;

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
    console.log(`Time: ${Date.now()} Path: ${ctx.URL.pathname}`);
    await next();
});


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
        let quiz = findQuiz(quizId)
        io.sockets.to(roomId).emit('room-brocast', `Quiz start`);
        //io.sockets.to(roomId).emit('quiz', quiz);
        io.sockets.to(roomId).emit('quiz-start', quiz);
        io.sockets.to(roomId).emit('timerStatus', {status: true , time: quiz.time});
        // setTimeout(()=>{
        //         io.sockets.to(roomId).emit('timerStatus', false);
        //         console.log('end_timer')
        //     }, quiz.time*1000)
    })
    socket.on('next-question', ({roomId:roomId, questionNum:questionNum}) => {
        io.sockets.to(roomId).emit('next-question', questionNum);
    })

})


const findQuiz = (quizId) => {

    let quiz =
        {
            quiz_id: "84532",
            created_by: "terry",
            course: "COMP333",
            start_date: "2023-01-11T05:52:49.508Z",
            end_date: "2023-01-13T05:52:49.508Z",
            time: 10000,
            mc: true,
            random: true,
            questionSet: [
                {
                    point:10,
                    question: "when have grade ar",
                    img: "",
                    answers: ["11/1", "12/1", "13/1", "14/1"],
                    correct: 1
                },
                {
                    point:10,
                    question: "when2",
                    img: "",
                    answers: ["have", "grade", "ar"],
                    correct: 3
                },
                {
                    point:10,
                    question: "when3",
                    img: "",
                    answers: ["have", "grade", "ar", "ar"],
                    correct: 4
                },
            ]
        }
    return quiz
}




