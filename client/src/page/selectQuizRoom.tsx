import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { useNavigate  } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
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

    const handleSubmit = e => {
        e.preventDefault();
        navigate(`/play/quiz/${roomId}`);
    };

    return (
        <>
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