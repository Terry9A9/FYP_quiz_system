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
import {quiz, profile, userProfile, answered_question, room} from "../state";
import _ from 'lodash';
import { getUserData } from '../../../server/controllers/loginFunction';
import e from 'cors';

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

    const [isStart, setIsStart] = useState(false as boolean) //quiz started

    const [quiz, setQuiz] = useState({} as quiz)
    const [questionSet, setQuestionSet] = useState([] as quiz["question_set"])

    const [questionNum, setQuestionNum] = useState(-1 as number) // current question number
    const [selectedAnsIndex, setSelectedAns] = useState("" as string) // selected answer
    const [totalPoint, setTotalPoint] = useState(0 as number)
    const [showRank, setShowRank] = useState(false as boolean) //show rank page
    const [waitMsg, setWaitMsg] = useState(false as boolean) //msg for wait for timer to end

    //sync timer
    const [times, setTimes] = useState(-1 as number) //set seconds for timer
    const [timerStatus, setTimerStatus] = useState(false as boolean)

    //websocket room & Msg
    const [roomInfo, setRoomInfo] = useState({} as room) // current room info
    const [rankInfo, setRankInfo] = useState([] as profile[]) 
    const [isHost, setIsHost] = useState(true as boolean) // indicate if user is host
    const [myInfo, setMyInfo] = useState({} as profile) // user profile
    const [joinedRoom, setJoinedRoom] = useState(false as boolean) // indicate if user joined room

    //anti cheating
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
        } 
        else if (times == 0){
            if (isHost) {
                ws.emit('end-timer', {roomId: roomId});
            }
            submit_ans()
            setWaitMsg(false)
        }
    }, [timerStatus, times])

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
                            {roomInfo.leaderboard && roomInfo?.leaderboard.map((e) =>
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
                        {questionSet[questionNum]?.answers.map((question, index) =>
                            <>
                                <Button onClick={() => {setSelectedAns(question);setWaitMsg(true)}}
                                       variant="contained" color="primary">
                                       {question}{index}
                                </Button>
                                <br/>
                                <br/>
                            </>
                        )}
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

    function Rank(){  //Rank component 
        console.log(rankInfo.map((e)=>e.answered_question[questionNum]))
        let answered = rankInfo.map((e)=>e.answered_question[questionNum]?.ans).flatMap(str => str)
        answered = answered.filter(str => str != "" || str != undefined)

        let datae = questionSet[questionNum].answers.map((e,index)=>answered.filter(str => str == e))
        let data = datae.map((e)=>Number((e.length/answered.length).toFixed(2))*100)
        //data = [50,50]
        console.log(datae+"data")
        let questionStat = {    
            labels: questionSet[questionNum].answers,
            datasets: [{
                label: `Question ${questionNum}`,
                data: data,
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 200, 235)',
                    'rgb(63, 53, 23)',
                    'rgb(65, 97, 235)',
                ],
                hoverOffset: 4
            }]
        }
        setTimeout(() => {console.log("point-submit")}, 1000)
        return (
            <>
                <Row className={classes.bg} style={{height: "80vh", borderRadius:"2vh"}}>
                <Col style={{display: 'flex', alignItems:"center", justifyContent:"center"}}>
                   <div> <Doughnut data={questionStat} redraw={true} /></div>
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
                const loginData = JSON.parse(localStorage.getItem("loginData") || '{}'); //get login data from local storage if exist (loginData is null if not login)
                if(loginData){
                    const stdId = loginData?.account?.name || "Guest";
                    ws.emit('join-room', roomId,stdId);
                    console.log('join-room',stdId)
                    setJoinedRoom(true)
                }
            } else {
                ws.emit('create-room');
                console.log('create-room')
            }
        });
        ws.on('join-room-message', (msg) => {
            setMyInfo(msg);
            console.log("MyInfo"+JSON.stringify(msg));
        });
        ws.on('room-info',(msg) => {
            setRoomInfo(msg)
            console.log(JSON.stringify(msg.leaderboard))
        });
        ws.on('room-brocast', (msg) => {
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
            setRankInfo(msg.info)
            setRoomInfo(msg.roomInfo)
            setShowRank(msg.status)
        })
    }

    const startQuiz = () => {
        ws.emit('quiz-start', {roomId: roomId, quizId: roomInfo.quiz_id});
    }

    const nextQuestion = () => {
        ws.emit('next-question', {roomId: roomId, questionNum: questionNum + 1, time: quiz.time});
    }

    function submit_ans () {
        if (!timerStatus) {
            let tempMyInfo = myInfo
            console.log(myInfo.userName+"tempMyInfo")
            let point = tempMyInfo.totalPoint
            console.log(selectedAnsIndex+"sel")
            let correct: boolean = selectedAnsIndex == questionSet[questionNum]?.correct
            if (correct) {
                point = totalPoint + questionSet[questionNum]?.point
                console.log("correct"+point)
            }
            let answered = {
                type:"mc",
                correct: correct,
                ans: [String(selectedAnsIndex)]//mc index
            }
            tempMyInfo['answered_question'].push(answered)
            tempMyInfo.totalPoint = point
            setTotalPoint(point)
            setMyInfo(tempMyInfo)
            ws.emit('point-submit', {roomId: roomId, totalPoint: myInfo.totalPoint, myInfo: myInfo});
            console.log(myInfo)
            setSelectedAns("")
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
                            {console.log(roomInfo)}
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