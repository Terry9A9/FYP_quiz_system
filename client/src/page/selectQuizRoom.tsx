import React, { useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import { handleLogin, handleLogout, getUserData } from '../../../server/controllers/loginFunction';
import {userProfile} from "../state";
import _ from 'lodash'

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
    const { classes } = useStyles();
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [user, setUser] = useState({} as userProfile);
    const handleSubmit = e => {
        e.preventDefault();
        navigate(`/play/quiz/${roomId}`);
    };

    // Call the getUserData function when the component loads
    useEffect(() => {
        if (_.isEmpty(user)) {
            getUserData().then(data => {
                setUser(data);
            });
        }
    }, []);

    async function login() {
        // Set the user profile state
        const user = handleLogin();
        setUser(await user);
    }

    function logout() {
        handleLogout();
        setUser({} as userProfile);
    }

    return (
        <>
            <div className={classes.root}>
                {user ? (
                    <>
                        <p>Welcome, {user.displayName}.</p>
                        <Button variant='contained' color='primary' onClick={logout}>Logout here</Button>
                    </>
                ) : (
                    <Button variant='contained' color='primary' onClick={login}>Login with Microsoft Here</Button>
                )
                }
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