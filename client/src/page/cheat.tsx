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
            alignItems: 'center',
          
        }
        ,
        textField: {
            margin: '20px 0'
        }
    }
});

const cheat = () =>{
    const {classes} = useStyles();
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
            // let timeIn = Date.now();
            let temp = Math.floor((Date.now()-Time0)/1000)
            setTime((Time)=>(Time+temp))     
            // let showTime = timeIn-Time0
            console.log(temp+"+"+Date.now()+"-"+Time0)
        }else{
            // timeone?setTime0(Date.now()):setTimeone(true)
            setTime0(Date.now)
            setOutCount(OutCount+1)
        }
    },[enter])

    // useEffect(()=>{
    //     if(enter){
    //         setTime1(Date.now())
    //         // let timeIn = Date.now();
    //         setTime((Time1-Time0))     
    //         // let showTime = timeIn-Time0
    //         console.log(Time+"+"+Time1+"-"+Time0)
    //     }else{
    //         timeone?setTime0(Date.now()):setTimeone(true)
    //         setOutCount(OutCount+1)
    //     }
    // },[Time1])


    const handleMouseLeave = () => {
        // Time0=Date.now()
        document.querySelector("#show");
        infoModal.showModal();
        setEnter(false)
        setOutCount(OutCount+1)
        // setMouseMsg("mouse Leave!!")
        // console.log("mouse Leave!!")
        // console.log("mouse Leave!!"+Time0)
    }
 
    const handleMouseEnter = () => {
        infoModal.close();
        // timeone?setTime1(Date.now()):setTimeone(true)
        setEnter(true)
        // Time1=Date.now()
        // setTime(Time+(timeIn-Time0))
        // let showTime = timeIn-Time0
        // setTime(Time1-Time0)
        // setMouseMsg("mouse Enter!!")
        // // console.log("mouse Enter!!"+showTime)
        //  console.log(Time+"+"+Time1+"-"+Time0)
    }
return (
    <div className={classes.root} onMouseLeave={() => handleMouseLeave()} onMouseEnter={() => handleMouseEnter()} tabIndex={0}
         style={{height: "100vh"}}>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <Container>
            {mouseMsg}{OutCount}_______{Time}
            <br/>
            <dialog id="infoModal"style={{height: "100%",width:'100%'}} >
            <p>屌你</p>
            </dialog>
        </Container>
    </div>
    
)
                    }
export default cheat