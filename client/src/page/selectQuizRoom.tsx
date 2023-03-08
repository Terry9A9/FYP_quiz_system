import React, { useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import { useNavigate  } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import { loginFunction } from './loginFunction';
import { msalInstance } from '../state';

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '100px'
        }
    ,
        textField: {
            margin: '20px 0'
        }
    }
});

const EnterRoomId = () => {
    const {classes} = useStyles();
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [user, setUser] = useState(null);
    const getUser = async () => {
          try {
            const response = await msalInstance.acquireTokenSilent({
              scopes: ['https://graph.microsoft.com/user.read'],
            });
            const user = await msalInstance.getAccount();
            setUser(user);
            console.log(response);
          } catch (error) {
            console.log(error);
          }
        };    
        getUser();

    const handleSubmit = e => {
        e.preventDefault();
        navigate(`/play/quiz/${roomId}`);
    };

    return (
        <>
        <h1>Hello, {user.name}</h1>
            <div className={classes.root}>
                <TextField
                    label="Room ID"
                    value={roomId}
                    onChange={e => setRoomId(e.target.value)}
                    className={classes.textField}
                />
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Enter
                </Button>
            </div>
        </>
    );
};

export default EnterRoomId;