import React from 'react'
import {useState, useEffect} from 'react'
import axios from 'axios'
import webSocket from 'socket.io-client'
import {useParams} from "react-router-dom";
import {quiz, question} from "../state";
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';


function PlayQuiz() {
    const [quiz, setQuiz]  = useState({} as quiz)
    const [ws, setWs] = useState()
    const [course, setCourse] = useState("")
    const [time, setTime] = useState(0)
    const [questionSet, setQuestionSet] = useState([] as quiz["questionSet"])
    const [quizId, setQuizId] = useState("")
    const [questionNum, setQuestionNum] = useState(-1)
    const [selectedAnsIndex, setSelectedAnsIndex] = useState(-1)
    const [point, setPoint] = useState(0)
    const [joinedRoom, setJoinedRoom] = useState(false)
    const [roomMsg, setRoomMsg] = useState("")
    const [showRoomMsg, setShowRoomMsg] = useState(false)

    let {roomId} = useParams(); //get URL params
    const connectWebSocket = () => {
        setWs(webSocket('ws://localhost:3004'))
    }

    //initWebSocket
    useEffect(() => {
        if (ws) {
            initWebSocket()
            console.log('initWebSocket!')
        }
    }, [ws])

    const joinRoomMsg = () => {
        return (
            <h4>joined quiz room {roomId}</h4>
        )
    }

    const roomBroadcastToast = () => {
        return (
            <ToastContainer>
                <Toast show={showRoomMsg} delay={3000} autohide={true} onClose={() => setShowRoomMsg(false)}>
                    <Toast.Header>
                        <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
                        <strong className="me-auto">Room</strong>
                        <small>11 mins ago</small>
                    </Toast.Header>
                    <Toast.Body>{roomMsg}</Toast.Body>
                </Toast>
            </ToastContainer>
        )
    }

    const initWebSocket = () => {
        ws.on('connect', () => {
            if (roomId) {
                ws.emit('join-room', roomId);
                console.log('join-room')
                setJoinedRoom(true)

            } else {
                ws.emit('create-room');
                console.log('create-room')
            }
        });
        ws.on('join-room-message', (msg) => {
            console.log(msg);
        });
        ws.on('room-brocast', (msg) => {
            setRoomMsg(msg)
            setShowRoomMsg(true)
            console.log(msg);
        });
        ws.on('quiz-start', (msg) => {
            setQuiz(msg)
            setQuestionSet(msg.questionSet)
            setQuestionNum(0)
        });
        ws.on('timerStatus', (msg: boolean) => {
            console.log(msg)
            msg ? "start_timer" : "end_timer"
        })
        ws.on('next-question', (msg) => {
            setQuestionNum(msg)
        })

    }

    const startQuiz = () => {
        ws.emit('quiz-start', {roomId: roomId, quizId: quizId});
    }

    const nextQuestion = () => {
        ws.emit('next-question', {roomId: roomId, questionNum: questionNum + 1});
    }

    const submit_ans = () => {
        if(selectedAnsIndex == questionSet[questionNum]?.correct){
            setPoint(point+questionSet[questionNum]?.point)
        }
    }

    const mouseLeave = () => {
        setRoomMsg("mouse Leave!!")
        setShowRoomMsg(true)
    }

    const mouseEnter = () => {
        setRoomMsg("mouse Enter!!")
        setShowRoomMsg(true)
    }



    return (
        <div className="playQuiz" onMouseLeave={mouseLeave} onMouseEnter={mouseEnter}>
            {joinedRoom && joinRoomMsg()}
            <input type='button' value='connectWebSocket' onClick={connectWebSocket}/>
            <input type='button' value='quiz start' onClick={startQuiz}/>
            <select name='QuizId' value={quizId} onChange={(v) => setQuizId(v.target.value)}>
                <option value=""></option>
                <option value="5671">390test1</option>
                <option value="0786">333test3</option>
                <option value="2347">390test2</option>
                <option value="4590">390test3</option>
            </select>
            {questionNum+1 < questionSet?.length?
                <input type='button' value='next question' onClick={nextQuestion}/>:" "}
            <br/>
            <h1>
            {questionNum>=0 ? (`Q${questionNum+1} `): ""}
            {questionSet[questionNum]?.question}</h1>
            point: {point} <br/>
            {
                questionSet[questionNum]?.answers.map((q,index) =>
                    <><label id={q}>{q}</label>
                        <input type="radio" id={q} name="question" value={index} onChange={()=>setSelectedAnsIndex(index)}/>
                        <br/>
                    </>)
            }
            <input type='button' value='submit' onClick={submit_ans}/>
            {roomBroadcastToast()}
        </div>
    )
}

export default PlayQuiz