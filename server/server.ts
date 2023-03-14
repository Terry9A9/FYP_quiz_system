import Koa from 'koa';
import express from 'express'
import bodyparser from 'body-parser';
import { instrument } from"@socket.io/admin-ui";
import cors from 'cors'

import {liveQuiz} from './controllers/liveQuiz';
import {v5 as uuid} from 'uuid';
import {quiz} from "../client/src/state"

const app = express()
const port: number = 3004;

app.use(bodyparser());
app.use(cors());
app.use((req,res, next) => {
    console.log(`Time: ${Date.now()} Path: ${req.path}`);
    next();
});

type stuProfile = {
    socketId: string,
    totalPoint: number
}

app.get('/api/play/quiz/:quizId', async ctx => {})

app.get('/api/play/quiz/:quizId', async ctx => {

    let quiz_id = ctx.params
});

app.get('/api/quiz/:quizId', (req,res) => {
    console.log("apiiiii")
    res.send("apiiiiiaai")

});

app.get('/api/login', async ctx => {
    ctx.body = ctx.params;
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
