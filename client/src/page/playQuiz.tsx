import * as React from 'react';
import {useState, useEffect, useMemo } from 'react'
import webSocket from 'socket.io-client'
import {useNavigate, useParams} from "react-router-dom";
import GroupsIcon from '@mui/icons-material/Groups';
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
    useMediaQuery, DialogTitle, DialogContent, DialogActions, Badge, Typography, Card, CardMedia, CircularProgress,
} from '@mui/material';


import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
import {quiz, profile, userProfile, answered_question, room} from "../state";
import _ from 'lodash';
import { getUserData } from '../../../server/controllers/loginFunction';
import { orange } from '@mui/material/colors';

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
    const [enter,setEnter]= useState(true as boolean)

    const [out,setOut]= useState(false as boolean)
    const [timeone,setTimeone]=useState(false as boolean)
    const [user, setUser] = useState({} as userProfile);
    
    const navigate = useNavigate();

    
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

    useEffect(() => {
        if(_.isEmpty(user)) {
            getUserData().then((user) => {
                setUser(user);
            });
          }
    }, [])


    useEffect(()=>{
        if(timerStatus){
            if(enter){
                let temp = Math.floor((Date.now()-Time0)/1000)
                setTime((Time)=>(Time+temp))
                console.log(temp+"="+Date.now()+"-"+Time0)
            }else{
                console.log("mouse left!!")
                setTime0(Date.now)
                setOutCount(OutCount+1)
            }
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

 
    interface Props {
        time: number;
      }

    const CountDown = React.memo(({time}: Props) => { //react component

        return (
            <>
                {timerStatus &&
                    <Typography variant="h3">
                        Time remain: {times}s
                    </Typography>   
                }
            </>
        )
    })

    function WaitCountDown(){
        return (
            <>
            <Row className={classes.bg} style={{height: "70vh", borderRadius:"2vh", alignItems:"center", justifyContent:"center", flexDirection: "column"}}>
                <Col md={2}>
                    
                    <div style={{display:"flex", alignItems:"center", justifyContent:"center", flexDirection: "column"}}>
                        Wait for times up
                    </div>
                </Col>
            </Row>
        </>
        )
    }


    function WaitingRoomComponent() {
        return (
            <>
                <div
                    className={classes.waiting}
                >
                    <div
                        style={{height:"70vh", width:"100%", borderRadius:30}}
                        className={classes.bg}
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
                    </div>
                </div>
            </>
        )
    }

    function QuestionComponent() {  //react component
        return (
            <div style={{height:"75vh", width:"100%", borderRadius:30, display:"flex", flexDirection:"column", justifyContent:"space-between", padding:'30px'}}
            className={classes.bg}>
                <Row>
                    <Col md={9}>
                        <Typography variant='h4'>
                            {questionNum >= 0 && (
                                `Q${questionNum + 1}: ${questionSet[questionNum]?.question}`)}
                        </Typography>
                    </Col>
                    <Col style={{display: "flex", justifyContent: "center"}}>
                        <Typography variant='h4'>
                            Point: {totalPoint}
                        </Typography>
                    </Col>
                </Row>
                <Row style={{justifyContent: "center"}}>
                    {questionSet[questionNum]?.img && 
                    <Card variant="outlined" sx={{ maxHeight: "40vh", width: 600, height:"400" }}>
                        <CardMedia
                            component="img"
                    
                            src= {`data:image/jpg;base64, ${questionSet[questionNum]?.img}`}
                            alt="Paella dish"
                        />
                    </Card>}   
                </Row>
                <Row style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", height:"25vh"}}>
                        {questionSet[questionNum]?.answers.map((question, index) =>
                            <>
                                <Col md={6} style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
                                    <Button onClick={() => { setSelectedAns(question); setWaitMsg(true) }}
                                        variant="contained" color="primary" size="large" fullWidth
                                        style={{
                                            width: "100%",
                                            backgroundColor: "lightblue",
                                          }}
                                        >
                                            <Typography variant='h6' color={"black"}>{question}</Typography>
                                    </Button>
                                </Col>
                            </>
                        )}
                </Row>
            </div>
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
        let color = [
            'rgb(255, 99, 132)',
            'rgb(54, 200, 235)',
            'rgb(65, 97, 235)',
            'rgb(255 , 223, 186)'
        ]
        console.log(rankInfo.map((e)=>e.answered_question[questionNum]))
        let answered = rankInfo.map((e)=>e.answered_question[questionNum]?.ans).flatMap(str => str)
        answered = answered.filter(str => str != "" || str != undefined)

        let datae = questionSet[questionNum].answers.map((e,index)=>answered.filter(str => str == e))
        let data = datae.map((e)=>Number((e.length/answered.length).toFixed(2))*100)
        //data = [50,50]
        
        let backgroundColor = questionSet[questionNum].answers.map((e,index)=> e == questionSet[questionNum].correct ? "rgb(92,184,92)": color[index])
        
        let questionStat = {    
            labels: questionSet[questionNum].answers,
            datasets: [{
                label: `Question ${questionNum + 1}`,
                data: data,
                backgroundColor: backgroundColor,
                hoverOffset: 4
            }]
        }
        console.log(questionStat)
        setTimeout(() => {console.log("point-submit")}, 1000)
        return (
            <>
                <Row className={classes.bg} style={{height: "70vh", borderRadius:"2vh"}}>
                <Col style={{display: 'flex', alignItems:"center", justifyContent:"center", flexDirection: "column"}}>
                    <Row>
                        <Typography variant="h5">Q{questionNum+1}. {questionSet[questionNum].question}</Typography>
                    </Row>
                    <Row>
                        <div> <Doughnut data={questionStat} redraw={true} /></div>  
                    </Row>
                   
                </Col>
                <Col sx={12}>
                    <Grid container alignItems="center" justifyContent="center" spacing={1} style={{height: "100%"}}>
                            {rankInfo.map((e,index) => (
                                <>
                                    <Grid item sm={2} lg={1}>
                                        <Item>
                                            {index+1}
                                        </Item>
                                    </Grid>
                                    <Grid item sm={7} lg={8}>
                                        <Item >
                                            {e.userName}
                                        </Item>
                                    </Grid>
                                    <Grid item sm={3} lg={3}>
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
                    <div
                        className={`${classes.sButton}`}
                        onClick={startQuiz}
                        style={{backgroundColor: "#eeaeca"}}
                    >
                        Quiz Start
                    </div>
                </div>
            )
    }

    let endTimer = () => {
        ws.emit('end-timer', {roomId: roomId});
    }

    function NextButton() {
        return (
            <div className={classes.center} style={{float:"right"}}>
                <div
                    className={classes.sButton}
                    onClick={!showRank ? endTimer : nextQuestion}
                    style={{backgroundColor: "#94bbe9"}}
                >
                    Next Question
                </div>
            </div>
        )
    }

    function FinishButton() {
        return (
            <div className={classes.center} style={{float:"right"}}>
                <div
                    className={classes.sButton}
                    onClick={() => {handleFinish}}
                    style={{backgroundColor: "#94bbe9"}}
                >
                    Finish
                </div>
            </div>
        )
    }


    const joinRoomMsg = () => {
        if(showRank && isStart){
            if(selectedAnsIndex == questionSet[questionNum]?.correct){
                return <Typography variant="h4">You Are Correct!</Typography>
            }else{
                return (
                    <>
                    <Typography variant="h4">You Are Wrong!</Typography>
                    <Typography variant="h4">The Correct Answer is: {questionSet[questionNum]?.correct}</Typography>
                    </>
                )
            }
        }else if(isStart){
            return <CountDown time={times}/>
        }
        return (
            <>
                <Typography variant="h4">Title: {roomInfo && roomInfo.room_name}</Typography>
                <Typography variant="h4">
                    <GroupsIcon fontSize={'large'}/> {roomInfo && roomInfo.leaderboard?.length}
                </Typography>
            </>
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
            setSelectedAns("")
            setOutCount(0)
            setTime(0)
            setTime0(0)
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
        setOutCount(0)
        setTime(0)
        setTime0(0)
    }

    function submit_ans () {
        if (!timerStatus) {
            console.log("OutCount"+OutCount)
            console.log("OutTime"+Time)
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
                ans: [String(selectedAnsIndex)],//mc index
                mouseleaveCount: OutCount, 
                mouseleaveTime: Time
            }
            tempMyInfo['answered_question'].push(answered)
            tempMyInfo.totalPoint = point
            setTotalPoint(point)
            setMyInfo(tempMyInfo)
            ws.emit('point-submit', {roomId: roomId, totalPoint: myInfo.totalPoint, myInfo: myInfo, });
            console.log(myInfo)
            setOutCount(0)
            setTime(0)
            setTime0(0)
        } else {
            setWaitMsg(true);
        } 
    }

    const handleMouseLeave = () => {
        if (timerStatus && !showRank){
            setEnter(false)
            document.querySelector("#show");
            infoModal.showModal()
            console.log("mouse Leave!!")
        }

    }

    const handleFinish = () => {
        ws.emit('quiz-finish', {roomInfo: roomInfo});
        navigate("/")
    }

    const handleMouseEnter = () => {
        setEnter(true)
        infoModal.close()

    }

    return (
        <div
        onMouseLeave={() => handleMouseLeave()}
        onMouseEnter={() => handleMouseEnter()}
        tabIndex={0}
        style={{height: "100vh"}}
        >
            <div className={classes.root}>
                <br/>
                <br/>
                <Container>
                    <Row>
                        <Col style={{height:"12vh", backgroundColor:"lightblue", marginBottom:"1vh", borderRadius: 30,}}>
                            <div style={{height:"12vh",display:'flex', flexWrap: "wrap",alignContent: "center",justifyContent: "space-around"}}>
                                {joinedRoom && joinRoomMsg()}
                            </div>
                            {/* {console.log(roomInfo)} */}
                        </Col>
                    </Row>
                    <Row style={{justifyContent: "center"}}>
                        {waitMsg ? <WaitCountDown/> : showRank && isStart? <Rank/> : isStart? <QuestionComponent/>: <WaitingRoomComponent/>}
                    </Row>
                    <Row>
                        <Col>
                            {!isStart && user?.id && user?.id == roomInfo.create_by && <StartButton/>}
                            {user?.id == roomInfo.create_by && showRank && isStart && questionNum + 1 < questionSet?.length ?
                                <NextButton/> : ""}
                                {
                                    ! (questionNum + 1 < questionSet?.length)  && isStart && <FinishButton/>
                                }
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