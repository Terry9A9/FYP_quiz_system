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
    const [OutTime,setOutTime] = useState(0 as number)
    const confirmBtn = document.getElementById("close_dialog");
    const asd = setInterval(function() {setOutTime(OutTime+1)}, 1000)
    return () => clearInterval(asd);
    const handleMouseLeave = () => {
    document.querySelector("#show");
    let infoModal=document.querySelector("#infoModal");
        infoModal.showModal();
        setOutCount(OutCount+1)
        setMouseMsg("mouse Leave!!")
        console.log("mouse Leave!!")
    }
 
    const handleMouseEnter = () => {
        infoModal.close();
        setMouseMsg("mouse Enter!!")
        console.log("mouse Enter!!")
    }
return (
    <div className={classes.root} onMouseLeave={() => handleMouseLeave()} onMouseEnter={() => handleMouseEnter()} tabIndex={0}
         style={{height: "100vh"}}>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <Container>
            {mouseMsg}{OutCount}{OutTime}
            <br/>
            <dialog id="infoModal"style={{height: "100%",width:'100%'}} >
            <p>屌你</p>
            </dialog>
        </Container>
    </div>
    
)
                    }
export default cheat