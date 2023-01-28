import React from 'react'
import {useState, useEffect} from 'react'
import axios from 'axios'
import webSocket from 'socket.io-client'
import {useParams} from "react-router-dom";
import {quiz, profile} from "../state";
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import {Container, Row, Col} from 'react-bootstrap';
import {Simulate} from "react-dom/test-utils";


function PlayQuiz() {
    const [quiz, setQuiz] = useState({} as quiz)
    const [ws, setWs] = useState()
    const [course, setCourse] = useState("")
    const [times, setTimes] = useState(-1)
    const [timerStatus, setTimerStatus] = useState(false)
    const [questionSet, setQuestionSet] = useState([] as quiz["questionSet"])
    const [quizId, setQuizId] = useState("")
    const [questionNum, setQuestionNum] = useState(-1)
    const [selectedAnsIndex, setSelectedAnsIndex] = useState(-1)
    const [totalPoint, setTotalPoint] = useState(0)
    const [joinedRoom, setJoinedRoom] = useState(false)
    const [roomMsg, setRoomMsg] = useState("")
    const [showRoomMsg, setShowRoomMsg] = useState(false)
    const [waitMsg, setWaitMsg] = useState(false)
    const [showRank, setShowRank] = useState(false)
    const [rankInfo, setRankInfo] = useState([] as profile[])

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

    useEffect(() => {
        if (timerStatus && times > 0) {
            // times == 0 ? clearInterval(timer)
            let timer = setInterval(() => {
                setTimes((times) => times - 1)
            }, 1000)
            return () => clearInterval(timer);
        } else if (times == 0){
            submit_ans()
            //nextQuestion()
            setWaitMsg(false)
        }else {
            setTimes(0)
            setWaitMsg(false)
        }
    }, [timerStatus, times])

    function RoomBroadcastToast() { //react component
        return (
            <ToastContainer>
                <Toast show={showRoomMsg} delay={3000} autohide={true} onClose={() => setShowRoomMsg(false)}>
                    <Toast.Header>
                        <img src="holder.js/20x20?text=%20" className="rounded me-2" alt=""/>
                        <strong className="me-auto">Room</strong>
                        <small>11 mins ago</small>
                    </Toast.Header>
                    <Toast.Body>{roomMsg}</Toast.Body>
                </Toast>
            </ToastContainer>
        )
    }

    function WaitCountDown() { //react component
        return (
            <>
                <Row>
                    <Col>
                        wait for question times up
                    </Col>
                    <Col>
                        <h1>
                            {timerStatus && (`Time remain: ${times}s`)}
                        </h1>
                    </Col>
                </Row>

            </>
        )
    }

    const QuestionComponent = () => {  //react component
        return (
            <>
                <Row>
                    <Col>
                        <h1>
                            {questionNum >= 0 && (
                                `Q${questionNum + 1}: ${questionSet[questionNum]?.question}`)}
                        </h1>
                    </Col>
                    <Col>
                        <h1>
                            {timerStatus && (`Time remain: ${times}s`)}
                        </h1>
                    </Col>
                </Row>
                <Row>
                    <Col>point: {totalPoint}</Col>
                </Row>
                <Row>
                    <Col>
                        {questionSet[questionNum]?.answers.map((q, index) =>
                            <>
                                <label id={q}>{q}</label>
                                <input type="radio" key={index} id={q} name="question" value={index}
                                       onChange={() => setSelectedAnsIndex(index)}
                                       checked={selectedAnsIndex == index}/>
                                <br/>
                            </>
                        )}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <input type='button' value='submit' onClick={submit_ans}/>
                        <RoomBroadcastToast/>
                    </Col>
                </Row>
            </>
        )
    }

    const joinRoomMsg = () => {
        return (
            <h4>joined quiz room {roomId}</h4>
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
        ws.on('timerStatus', (msg: { status: boolean, time: number }) => {
            setTimerStatus(msg.status)
            msg.status? setTimes(msg.time / 1000) : setTimes(0)
        })
        ws.on('next-question', (msg) => {
            setQuestionNum(msg)
            setShowRank(false)
        })
        ws.on('point', (msg) => {
            setTotalPoint((p) => p+msg)
        })
        ws.on('show-rank', (msg) => {
            setShowRank(msg.status)
            setRankInfo(msg.info)
        })
    }

    const startQuiz = () => {
        ws.emit('quiz-start', {roomId: roomId, quizId: quizId});
    }

    const nextQuestion = () => {
        ws?.emit('next-question', {roomId: roomId, questionNum: questionNum + 1, quizId: quizId});
    }

    const submit_ans = () => {
        if (!timerStatus) {
            let point = totalPoint
            console.log(selectedAnsIndex+"sel")
            if (selectedAnsIndex == questionSet[questionNum]?.correct) {
                point = totalPoint + questionSet[questionNum]?.point
                console.log("correct"+point)
                setTotalPoint(point)
            }
            console.log(point)
            ws?.emit('point_submit', {roomId: roomId, totalPoint: point})
        } else {
            setWaitMsg(true);
        }
    }

    function Rank(){
        return (
            <>
                <Row>
                    {rankInfo.map((e) => (
                        <ul>
                            {e.socketId} {e.totalPoint}
                        </ul>
                    ))}
                </Row>
            </>
        )
    }

    const mouseLeave = () => {
        setRoomMsg("mouse Leave!!")
        setShowRoomMsg(true)
        console.log("mouse Leave!!")
    }

    const mouseEnter = () => {
        setRoomMsg("mouse Enter!!")
        setShowRoomMsg(true)
        console.log("mouse Enter!!")
    }


    return (
        <div className="playQuiz" onMouseLeave={() => mouseLeave()} onMouseEnter={() => mouseEnter()} tabIndex={0}
             style={{height: "100vh", margin: "3vh"}}>
            <Container>
                <Row>
                    {joinedRoom && joinRoomMsg()}
                </Row>
                <Row>
                    <Col>
                        <input type='button' value='connectWebSocket' onClick={connectWebSocket}/>
                    </Col>
                    <Col>
                        <input type='button' value='quiz start' onClick={startQuiz}/>
                    </Col>
                    <Col>
                        <select name='QuizId' value={quizId} onChange={(v) => setQuizId(v.target.value)}>
                            <option value=""></option>
                            <option value="5671">390test1</option>
                            <option value="0786">333test3</option>
                            <option value="2347">390test2</option>
                            <option value="4590">390test3</option>
                        </select>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {questionNum + 1 < questionSet?.length ?
                            <input type='button' value='next question' onClick={nextQuestion}/> : " "}
                    </Col>
                </Row>
                <Row>
                    {waitMsg ? <WaitCountDown/> : showRank? <Rank/> : <QuestionComponent/>}
                </Row>
            </Container>
        </div>
    )
}

export default PlayQuiz