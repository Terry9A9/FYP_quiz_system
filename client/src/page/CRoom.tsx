import React, { useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import {Room} from "../state";
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

function CreateRoomForm() {
  const [roomName, setRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [password, setPassword] = useState('');
  const [allowEmojiPopup, setAllowEmojiPopup] = useState(false);
const [quiz_id, setQuizId] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    // Send form data to backend
    fetch('http://localhost:3004/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        room_name: roomName,
        ispublic: isPublic,
        password: password,
        allow_emoji_popup: allowEmojiPopup,
        create_time: Math.floor(Date.now()/1000)
      })
    })
  };

  const handleRoomNameChange = (event) => {
    setRoomName(event.target.value);
  };

  const handleIspublicChange = (event) => {
    setIsPublic(event.target.checked);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleAllowEmojiPopupChange = (event) => {
    setAllowEmojiPopup(event.target.checked);
  };
  const handleQuizIdChange = (event) => {
    setQuizId(event.target.value);
  }
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Room name:
        <input type="text" value={roomName} onChange={handleRoomNameChange} />
      </label>
      <br />
      quiz_id:
        <input type="text" value={quiz_id} onChange={handleQuizIdChange} />
      <br />
      <label>
        Public:
        <input type="checkbox" checked={isPublic} onChange={handleIspublicChange} />
      </label>
      <br />
      {!isPublic && (
        <label>
          Password:
          <input type="password" value={password} onChange={handlePasswordChange} />
        </label>
      )}
      <br />
      <label>
        Allow emoji popup:
        <input type="checkbox" checked={allowEmojiPopup} onChange={handleAllowEmojiPopupChange} />
      </label>
      <br />
      <button type="submit">Create room</button>
    </form>
  );
}

export default CreateRoomForm;