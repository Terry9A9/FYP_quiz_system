import * as React from 'react';
import {useState, useEffect} from 'react'
import axios from 'axios'
import webSocket from 'socket.io-client'
import {useParams} from "react-router-dom";
import {quiz, profile} from "../state";

import {Container, Row, Col} from 'react-bootstrap';
import { makeStyles } from 'tss-react/mui';
import { experimentalStyled as styled } from '@mui/material/styles';
import {Button, Snackbar, Grid, Paper , FormControl, RadioGroup} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }
        ,
        textField: {
            margin: '20px 0'
        }
    }
});

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
}));


const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function PlayQuiz() {

    const [ws, setWs] = useState(webSocket('ws://localhost:3004'))

    const [course, setCourse] = useState("")
    const [quiz, setQuiz] = useState("")
    const [questionSet, setQuestionSet] = useState([] as quiz["question_set"])
    const [quizId, setQuizId] = useState("")
    const [questionNum, setQuestionNum] = useState(-1)
    const [selectedAnsIndex, setSelectedAnsIndex] = useState(-1)
    const [totalPoint, setTotalPoint] = useState(0)
    const [showRank, setShowRank] = useState(false)
    const [rankInfo, setRankInfo] = useState([] as profile[])
    const [waitMsg, setWaitMsg] = useState(false as boolean)

    const [IsStart, setIsStart] = useState(false as boolean)

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
    const [Time0,setTime0] = useState(0 as number)
    const [Time1,setTime1] = useState(0 as number)
    const [Time,setTime] = useState(0 as number)
    const [enter,setEnter]= useState(false as boolean)
    const [out,setOut]= useState(false as boolean)
    const [timeone,setTimeone]=useState(false as boolean)


    useEffect(()=>{
        if(enter){
            let temp = Math.floor((Date.now()-Time0)/1000)
            setTime((Time)=>(Time+temp))
            console.log(temp+"+"+Date.now()+"-"+Time0)
        }else{
            setTime0(Date.now)
            setOutCount(OutCount+1)
        }
    },[enter])


    const {classes} = useStyles();
    let {roomId} = useParams(); //get URL params

    const connectWebSocket = () => {
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
    }

    function WaitCountDown() { //react component
        return (
            <>
                <Grid container>
                    <Grid item md={6}>
                        wait for question times up
                    </Grid>
                    <Grid item md={6}>
                        <h1>
                            {timerStatus && (`Time remain: ${times}s`)}
                        </h1>
                    </Grid>
                </Grid>

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
            console.log(msg)
            setQuestionSet(msg.question_set)
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
        ws.emit('next-question', {roomId: roomId, questionNum: questionNum + 1, quizId: quizId});
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
            ws.emit('point_submit', {roomId: roomId, totalPoint: point})
        } else {
            setWaitMsg(true);
        }
    }

    function Rank(){
        return (
            <>
                <Grid container direction="column" alignItems="center" spacing={5}>
                    <Grid item>
                        {rankInfo.map((e,index) => (
                            <>
                                <Item>
                                    {index+1}. {e.socketId} {e.totalPoint}
                                </Item>
                            </>
                        ))}
                    </Grid>
                </Grid>
            </>
        )
    }

    const handleMouseLeave = () => {
        document.querySelector("#show");
        IsStart ? infoModal.showModal():
        setEnter(false)
        setOutCount(OutCount+1)
        setMouseMsg("mouse Leave!!")
        console.log("mouse Leave!!")
    }

    const handleMouseEnter = () => {
        IsStart ? infoModal.close():
        setEnter(true)
        setMouseMsg("mouse Enter!!")
        console.log("mouse Enter!!")
    }


    return (
        <div onMouseLeave={() => handleMouseLeave()} onMouseEnter={() => handleMouseEnter()} tabIndex={0}
             style={{height: "100vh"}}>
            <div className={classes.root}>
                <Container>
                    <Row>
                        {joinedRoom && joinRoomMsg()}
                    </Row>
                    <Row>
                        <Col>
                            <Button variant="contained" color="primary" onClick={startQuiz}>
                                Quiz Start
                            </Button>
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
                    <br/>
                    {mouseMsg}
                    <dialog id="infoModal"style={{height: "100%",width:'100%'}} >
                        <p>plz</p>
                    </dialog>
                </Container>
            </div>
        </div>
    )
}

export default PlayQuiz