import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import { handleLogin, handleLogout, msalInstance, getUserData} from '../../../server/controllers/loginFunction';


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

const LoginLogoutButton: React.FC = () => {
  const [user, setUser] = useState(null);
  const { classes } = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if(!user) {
      getUserData().then((user) => {
      setUser(user);
      setIsLoading(false);
      navigate('/login');
    });
    }else {
      setIsLoading(false);
    }
  }, [user]);

  async function login() {
    // Set the user profile state
      const userData = handleLogin();
      console.log("Running handleLogin");
      setIsLoading(true);
      setUser(await userData);
      console.log("running setUser")
      navigate('/login');
      console.log("running navigate")
    }
    
  function logout() {
      handleLogout();
      setUser(null);
      navigate('/login');
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className={classes.root}>
      <Button variant='contained' color='primary' onClick={login}>Login with Microsoft</Button>
      </div>
    );
  }else{
    return (
    <div className={classes.root}>
      <h2>{user.displayName}</h2>
      <p>{user.mail}</p>
      <p>{user.role}</p>
      <Button variant='contained' color='primary' onClick={logout}>Logout</Button>
      <p>{JSON.stringify(user)}</p>
    </div>
    );
  }
};

export default LoginLogoutButton;
