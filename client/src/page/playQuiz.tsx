import * as React from 'react';
import {useState, useEffect} from 'react'
import axios from 'axios'
import webSocket from 'socket.io-client'
import {useParams} from "react-router-dom";
import {quiz, profile} from "../state";
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import {Container, Row, Col} from 'react-bootstrap';
import { makeStyles } from 'tss-react/mui';
import {Button, Snackbar, InputLabel, MenuItem, Select, FormControl, RadioGroup} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }
        ,
        textField: {
            margin: '20px 0'
        }
    }
});

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function PlayQuiz() {
    const [ws, setWs] = useState()

    //store quiz related
    const [quiz, setQuiz] = useState({} as quiz)
    const [course, setCourse] = useState("" as string)
    const [questionSet, setQuestionSet] = useState([] as quiz["questionSet"])
    const [quizId, setQuizId] = useState("" as string)
    const [questionNum, setQuestionNum] = useState(-1 as number)
    const [IsStart, setIsStart] = useState(false as boolean)

    //ans & ranking
    const [selectedAnsIndex, setSelectedAnsIndex] = useState(-1 as number)
    const [totalPoint, setTotalPoint] = useState(0 as number)
    const [showRank, setShowRank] = useState(false as boolean)
    const [rankInfo, setRankInfo] = useState([] as profile[])
    const [waitMsg, setWaitMsg] = useState(false as boolean)

    //sync timer
    const [times, setTimes] = useState(-1 as number)
    const [timerStatus, setTimerStatus] = useState(false as boolean)
   
    //websocket room & Msg
    const [joinedRoom, setJoinedRoom] = useState(false as boolean)
    const [roomMsg, setRoomMsg] = useState("" as string)
    const [showRoomMsg, setShowRoomMsg] = useState(false as boolean)
    
    //anit cheating
    const [mouseMsg, setMouseMsg] = useState("" as string)
    const [OutCount,setOutCount] = useState(0 as number)
    const [OutTime,setOutTime] = useState(0 as number)


    const {classes} = useStyles();
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
            <Snackbar open={showRoomMsg} autoHideDuration={2000} onClose={() => setShowRoomMsg(false)}>
                <Alert onClose={() => setShowRoomMsg(false)} severity="success" color="info" sx={{ width: '100%' }}>
                    {roomMsg}
                </Alert>
            </Snackbar>
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
                        <Button variant="contained" color="primary" onClick={submit_ans}>
                            Submit
                        </Button>
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
            setIsStart(true)

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

    const handleMouseLeave = () => {
        let infoModal=document.querySelector("#infoModal");
        IsStart ? infoModal.showModal():
        setMouseMsg("mouse Leave!!")
        console.log("mouse Leave!!")
    }

    const handleMouseEnter = () => {
        IsStart ? infoModal.close():
        setMouseMsg("mouse Enter!!")
        console.log("mouse Enter!!")
    }


    return (
        <div className={classes.root} onMouseLeave={() => handleMouseLeave()} onMouseEnter={() => handleMouseEnter()} tabIndex={0}
             style={{height: "100vh"}}>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
            <Container>
                <Row>
                    {joinedRoom && joinRoomMsg()}
                </Row>
                <Row>
                    <Col>
                        <Button variant="contained" color="primary" onClick={connectWebSocket}>
                            Connect WebSocket
                        </Button>
                    </Col>
                    <Col>
                        <Button variant="contained" color="primary" onClick={startQuiz}>
                            Quiz Start
                        </Button>
                    </Col>
                    <Col>
                        <FormControl fullWidth>
                            <InputLabel id="QuizId">QuizId</InputLabel>
                            <Select
                                labelId="QuizId"
                                id="QuizId-select"
                                value={quizId}
                                label="Age"
                                onChange={(v) => setQuizId(v.target.value)}
                            >
                                <MenuItem value=""></MenuItem>
                                <MenuItem value="5671">390test1</MenuItem>
                                <MenuItem value="0786">333test3</MenuItem>
                                <MenuItem value="2347">390test2</MenuItem>
                                <MenuItem value="4590">390test3</MenuItem>
                            </Select>
                        </FormControl>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col>
                        {questionNum + 1 < questionSet?.length ?
                            <Button variant="contained" color="primary" onClick={nextQuestion}>next question</Button> : " "}
                    </Col>
                </Row>
                <Row>
                    {waitMsg ? <WaitCountDown/> : showRank? <Rank/> : <QuestionComponent/>}
                </Row>
                {mouseMsg}
                <dialog id="infoModal"style={{height: "100%",width:'100%'}} >
            <p>Your Are Out</p>
            </dialog>
            </Container>
            <RoomBroadcastToast/>
        </div>
    )
}

export default PlayQuiz