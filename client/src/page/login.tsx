import React, { useState, useEffect } from 'react';
import { useNavigate  } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
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

function Login() {
    const [user, setUser] = useState(null);
    const {classes} = useStyles();
    const navigate = useNavigate();
    const handleLogin = async () => {
        try {
          const response = await msalInstance.loginPopup({
            scopes: ['openid', 'profile', 'email'],
          });
          const user = await msalInstance.getAccount();
          setUser(user);
          //navigate(`/`);
          console.log(response);
        } catch (error) {
          console.log(error);
        }
      };
    
      const handleLogout = () => {
        msalInstance.logout();
        setUser(null);
      };
  return (
    <div className={classes.root}>
      {user ? (
        <div className={classes.root}>
          <p>Welcome {user.name}!</p>
          <Button variant="contained" color="primary" onClick={handleLogout}>Logout</Button>
        </div>
      ) : (
        <Button variant="contained" color="primary" onClick={handleLogin}>Login</Button>
      )}
    </div>
  );
}

export default Login;