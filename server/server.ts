import Koa from 'koa';
import express from 'express'
import Router from 'koa-router';
import bodyparser from 'body-parser';
import { instrument } from"@socket.io/admin-ui";
import cors from 'cors'

import {liveQuiz} from './controllers/liveQuiz';
import {v5 as uuid} from 'uuid';
import {quiz} from "../client/src/state"

const app = express()
//const app = new Koa();
const router = new Router();
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


router.get('/api/play/quiz/:quizId', async ctx => {
    let quiz_id = ctx.params
});

router.get('/api/quiz/:roomId', async ctx => {
    ctx.body = ctx.params;
});

router.get('/api/login', async ctx => {
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
