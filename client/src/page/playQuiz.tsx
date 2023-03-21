import * as React from 'react';
import {useState, useEffect} from 'react'
import webSocket from 'socket.io-client'
import {useParams} from "react-router-dom";

import StarsIcon from '@mui/icons-material/Stars';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import SpeedIcon from '@mui/icons-material/Speed';
import {Container, Row, Col} from 'react-bootstrap';
import { makeStyles } from 'tss-react/mui';
import {styled, useTheme} from '@mui/material/styles';
import {
    Button,
    Grid,
    Paper,
    Box,
    TextField,
    Dialog,
    useMediaQuery, DialogTitle, DialogContent, DialogActions, Badge,
} from '@mui/material';

import {useIsPresent, motion} from "framer-motion"

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
import {quiz, profile, userProfile} from "../state";
import _ from 'lodash'
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { getUserData } from './loginFunction';

const useStyles = makeStyles()((theme) => {
    return {
        center:{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        root: {
            height: "100vh",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        textField: {
            margin: '20px 0'
        },
        waiting:{
            height: "70%",
            display: 'flex',
            justifyContent: "center",
            alignItems: "center"
        },
        sButton:{
            display: 'flex',
            width: "150px",
            height: "40px",
            borderRadius: "50px",
            cursor: "pointer",
            marginTop: "1vh",
            justifyContent: "center",
            alignItems: "center",
        },
        bg:{
            background: "linear-gradient(90deg, rgba(238,174,202,1) 0%, rgba(90,226,201,1) 100%)"
        }
    }
});

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
}));



function PlayQuiz() {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [ws, setWs] = useState(webSocket('ws://localhost:3004'))

    const [myInfo, setMyInfo] = useState({})

    const [course, setCourse] = useState("" as string)
    const [quiz, setQuiz] = useState("" as string)
    const [questionSet, setQuestionSet] = useState([] as quiz["question_set"])
    const [quizId, setQuizId] = useState("" as string)
    const [questionNum, setQuestionNum] = useState(-1 as number)
    const [selectedAnsIndex, setSelectedAnsIndex] = useState(-1 as number)
    const [totalPoint, setTotalPoint] = useState(0 as number)
    const [showRank, setShowRank] = useState(false as boolean)
    const [rankInfo, setRankInfo] = useState([] as profile[])
    const [waitMsg, setWaitMsg] = useState(false as boolean)
    const [nickName, setNickName] = useState("" as string)
    const [isStart, setIsStart] = useState(false as boolean)
    const [nickNameDialog, setNickNameDialog] = useState(true as boolean)
    //sync timer
    const [times, setTimes] = useState(-1 as number)
    const [timerStatus, setTimerStatus] = useState(false as boolean)
    //websocket room & Msg
    const [joinedRoom, setJoinedRoom] = useState(false as boolean)
    const [roomMsg, setRoomMsg] = useState("" as string)
    const [roomInfo, setRoomInfo] = useState({})
    const [showRoomMsg, setShowRoomMsg] = useState(false as boolean)
    const [isHost, setIsHost] = useState(true as boolean)
    //anit cheating
    const [mouseMsg, setMouseMsg] = useState("" as string)
    const [OutCount,setOutCount] = useState(0 as number)
    const [Time0,setTime0] = useState(0 as number)
    const [Time,setTime] = useState(0 as number)
    const [enter,setEnter]= useState(false as boolean)

    const [out,setOut]= useState(false as boolean)
    const [timeone,setTimeone]=useState(false as boolean)
    const [user, setUser] = useState({} as userProfile);
    
    useEffect(() => {
        if(_.isEmpty(user)) {
            getUserData().then((user) => {
            setUser(user);
          });
          }
    }, [])


    const isPresent = useIsPresent();

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
            if (isHost) {
                ws.emit('end-timer', {roomId: roomId});
            }
            submit_ans()
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



    function WaitingRoomComponent() {
        return (
            <>
                <div
                    className={classes.waiting}
                >
                    <motion.div
                        style={{height:"70vh", width:"50vh"}}
                        className={`${classes.bg}`}
                        initial={{ height: "5vh", width: "5vh", borderRadius: 100 }}
                        animate={{ height: "70vh", width: "100%", borderRadius: 30}}
                        exit={{opacity:0}}
                    >
                        <Box
                            sx={{
                                p: 5,
                                display: 'grid',
                                gridTemplateColumns: { md: '1fr 1fr 1fr  1fr' },
                                gap: 2,
                            }}
                        >
                            {roomInfo.players && roomInfo?.players.map((e) =>
                                ( <Item elevation={1} style={{textAlign: "center", width:"100%"}}>
                                    {e.userName}
                                </Item>)
                            )}
                            <Item elevation={1} style={{textAlign: "center"}}>
                                <MilitaryTechIcon sx={{color:"#FFD700"}}/>{`law`}
                            </Item>
                            <Item elevation={1} style={{textAlign: "center"}}>
                                <SpeedIcon/>{`timmy`}
                            </Item>
                        </Box>
                    </motion.div>
                </div>
            </>
        )
    }

    function QuestionComponent() {  //react component
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

    let data = {
        labels: [
            'Red',
            'Blue',
            'Yellow'
        ],
        datasets: [{
            label: 'My First Dataset',
            data: [300, 50, 100],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ],
            hoverOffset: 4
        }]
    }

    function Rank(){
        return (
            <>
                <Row className={classes.bg} style={{height: "80vh", borderRadius:"2vh"}}>
                <Col style={{display: 'flex', alignItems:"center", justifyContent:"center"}}>
                   <div> <Doughnut data={data} /></div>
                </Col>
                <Col>
                    <Grid container alignItems="center" justifyContent="center" spacing={1} style={{height: "100%"}}>
                            {rankInfo.map((e,index) => (
                                <>
                                    <Grid item lg={1}>
                                        <Item >
                                            {index+1}
                                        </Item>
                                    </Grid>
                                    <Grid item lg={8}>
                                        <Item >
                                            {e.userName}
                                        </Item>
                                    </Grid>
                                    <Grid item lg={3}>
                                        <Item >
                                            {e.totalPoint}
                                        </Item>
                                    </Grid>
                                </>
                            ))}
                    </Grid>
                </Col>
                </Row>
            </>
        )
    }

    function StartButton() {
        return (
                <div className={classes.center}>
                    <motion.div
                        className={`${classes.sButton}`}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        onClick={startQuiz}
                        style={{backgroundColor: "#eeaeca"}}
                    >
                        Quiz Start
                    </motion.div>
                </div>
            )
    }

    let endTimer = () => {
        ws.emit('end-timer', {roomId: roomId});
    }

    function NextButton() {
        return (
            <div className={classes.center} style={{float:"right"}}>
                <motion.div
                    className={classes.sButton}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onClick={!showRank ? endTimer : nextQuestion}
                    style={{backgroundColor: "#94bbe9"}}
                >
                    Next Question
                </motion.div>
            </div>
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
            setMyInfo(msg);
            console.log(msg);
        });
        ws.on('room-info',(msg) => {
            setRoomInfo(msg)
            console.log(JSON.stringify(msg.players))
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
            ws.emit('point-submit', {roomId: roomId, totalPoint: point})
        } else {
            setWaitMsg(true);
        }
    }

    const handleMouseLeave = () => {
        setEnter(false)
        if (isStart){
            document.querySelector("#show");
            infoModal.showModal()
            setOutCount(OutCount+1)
            setMouseMsg("mouse Leave!!")
            console.log("mouse Leave!!")
        }

    }

    const handleMouseEnter = () => {
        if (isStart){
            infoModal.close()
            setEnter(true)
            setMouseMsg("mouse Enter!!")
            console.log("mouse Enter!!")
        }

    }

    return (
        <div
        // onMouseLeave={() => handleMouseLeave()}
        // onMouseEnter={() => handleMouseEnter()}
        tabIndex={0}
        style={{height: "100vh"}}
        >
            <div className={classes.root}>
                <br/>
                <br/>
                <Container>
                    <Row>
                        <Col>
                            <div style={{height:"12vh", backgroundColor:"red", marginBottom:"1vh"}}>
                                {joinedRoom && joinRoomMsg()}
                            </div>

                        </Col>
                    </Row>
                    <Row>
                        {waitMsg ? <WaitCountDown/> : showRank && isStart? <Rank/> : isStart? <QuestionComponent/>: <WaitingRoomComponent/>}
                    </Row>
                    <Row>
                        <Col>
                            {!isStart && <StartButton/>}
                            {questionNum + 1 < questionSet?.length ?
                                <NextButton/> : " "}
                        </Col>
                    </Row>
                    <br/>
                    <dialog id="infoModal"style={{height: "100%",width:'100%'}} >
                        <p>plz</p>
                    </dialog>
                </Container>
            </div>
        </div>
    )
}

export default PlayQuiz