import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Grid, colors } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import KeyIcon from '@mui/icons-material/Key';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import MenuIcon from '@mui/icons-material/Menu';
import { Row, Col, Container } from 'react-bootstrap';

import { SwipeableDrawer, Drawer } from '@mui/material';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';

import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from "@mui/material/Typography";
import { handleLogin, handleLogout, getUserData } from '../../../server/controllers/loginFunction';
import { userProfile } from "../state";
import _ from 'lodash'
import { color } from 'framer-motion';
import { json } from 'stream/consumers';


const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '5%',
        }
        ,
        textField: {
            marginBottom: '10px'
        },

        menuBtn: {
            display: 'inline-block'
        },

        profileBox: {
            width: '55px',
            height: '55px',
            borderRadius: '50%',
            position: 'absolute',
            right: '1.5%'
        },
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
    }
});

const EnterRoomId = () => {
    const { classes } = useStyles();
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [user, setUser] = useState({} as userProfile);
    const [showQuiz, setShowQuiz] = useState(false);
    const handleSubmit = e => {
        e.preventDefault();
        navigate(`/play/quiz/${roomId}`);
    };

    const handleSubmitGpt = (lectureNoteNum) => {
        navigate(`/gptQuiz/${lectureNoteNum}`);
    };

    const goRoom = (room_id) => {
        navigate(`/play/quiz/${room_id}`);
    };

    const [MenuOpen, setMenuOpen] = useState(false);
    const [anchor, setAnchor] = useState('left');

    const showMenu = () => {
        setMenuOpen(true);
    }
    const closedMenu = () => {
        setMenuOpen(false);
    }

    const [Roomlist, setRoomlist] = useState([]);


    // Call the getUserData function when the component loads
    useEffect(() => {
        
        if (_.isEmpty(user)) {
            getUserData().then(data => {
                setUser(data);
            });
        }
       
        const list= async ()=>{ 
            
            const roleRes = await fetch('http://localhost:3004/api/getRooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const jsonData = await roleRes.json();
        setRoomlist(jsonData.data);
    };

    list();

    }, []);
    console.log(Roomlist);
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
            <Box sx={{
                position: 'absolute',
                width: '100vw',
                height: '100vh',
                background: 'linear-gradient(173.45deg, rgba(52, 154, 227, 0) 81.79%, #5AC4F1 81.79%, #49AEF7 81.79%), linear-gradient(205.79deg, rgba(254, 196, 82, 0.973958) 15.18%, #FFCA7B 15.18%, rgba(249, 199, 100, 0.842152) 15.5%, rgba(217, 217, 217, 0) 15.51%)'
            }}>
                <header>
                    <AppBar position="static" sx={{
                        backgroundColor: 'rgba(248,248,255 , 0.85)',
                        height: '7.7vh',
                        boxShadow: ' 0px 4px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                        <Toolbar disableGutters>
                            <Tooltip title="Open menu">
                                <Button startIcon={<MenuIcon
                                    className={classes.menuBtn}
                                    style={{ fontSize: 35 }}
                                />}
                                    onClick={showMenu}
                                    sx={{ Width: '100%', Height: '100%', aspectRatio: '1/1', padding: 2, backgroundColor: 'rgba(248,248,255 , 0.85)' }}
                                >
                                </Button>
                            </Tooltip>
                            {user && <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "black" }}>Welcome, {user.displayName}</Typography>}
                            {user ? (
                                <Button sx={{ color: '#000000', position: "absolute", right: "6%" }} onClick={logout}>Logout</Button>

                            ) : (
                                <Button sx={{ color: '#000000', position: "absolute", right: "7%" }} onClick={login}>Login with Microsoft</Button>
                            )
                            }

                            <Tooltip title="Open settings">
                                <IconButton className={classes.profileBox}>
                                    <Avatar
                                        sx={{ height: '45px', width: '45px', border: 1, borderStyle: 'dashed solid', borderColor: 'LightSlateGray', boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.05)' }}
                                        alt="User Profile Picture"
                                        src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAS1BMVEX////n5+f8/PzQ0NDJycmUqan2+PiZrKx9l5fk5OTS0tLExMTs6+u5ubm2tra/v7+MoKB+mZl8kZFtiYl1kJBggoJUenrt8PBJc3OH+DA6AAADlklEQVR4nO2dcW+iQBBHUURQbEVa6H3/T3pnUpdpgsdvmkuuO/vmr8n6mMwLLJB1W6upTdEt6bg6OgwpbSYHbIdnD2wqT40DNqNT1VYpzkt6WB29XFK6bx2wHb55YFO53TtgM9oaw329StdL6d0upcfGAdvKnQc2lZujAzaVMXzaB4YYajCGGFalGO4/41in9A+d0vqY0tNpgRsPbCp3HthUbjywqdxW3bl+xEtKz69L+pI+P/d9Gj6MDthWfvPApvJ4cMCmcud6a7OXx/pVug5vv7U9ge1VunpJ89aG4V/6wBBDDcYQw6o0w6hP/PGQ4nUrvV5T2m8eZ2AzXL/VOmzTsXfA9rgCzmFJ8xBDDLWmMcRQgjFUms7SMOoTv4S1tujrpSXNQwwx1JrGEEMJxlBpOktD11vbE8PtF7HOA28aKm9tw2X3Gad+l+K6pP0ppedzSk/LcQK8VL68X3TYVL4MDthUvgwFGMa/Sku602CIodY0hhhKMIZK0982vHngf2LY7I+POKR03y/pIX1+PJ1S+tE4YFu588CmcvPhgJfK+6aa2uYRY7ORDsOSbx5n4WW4nVePW4ftcZMD/nIcf2/BnUaCMcTwHhhiqNEY/nTDqN8Bs3Mv/3NY0jzEEEOtaQwxlGAMlaazNIz6xGfnHjv3FPinzEMMMdSaxhBDCcZQaTpLw6h7ouLva4tvGP8qLelOgyGGWtMYYijBGCpNZ2UYfSWqhNXEFEFXhEuYhzqNIYb3wBBDCcZQaTpLQ/ucrFdHn+zV34S/vVffVN7eq7/eRlvNt+4Rbym92TR93r2/p9Fu1uEvlX95YJPO3U2Hl8q3uYBzWNI8xBBDrWkMMZRgDJWmszSMuk5Twlpb9PXSkuYhhhhqTWOIoQRjqDSdpWHUPVHx97XFN4x/lZZ0p8EQQ61pDDGUYAyVprMyjL4SVcJqYoqgK8IlzEOdxhDDe2CIoQRjqDSdpWHUJz7/cy//c1jSPMQQQ61pDDGUYAyVprM0jPrbCPF/3yL+b5TE/52Zku40GGKoNY0hhhJcrGHUPVHx97XFN4x/lZZ0p8EQQ61pDDGUYAyVprMyZOceO/f4Dvj/z0OdxhDDe2CIoQRjqDSdpWHUJz479/I/hyXNQwwx1JrGEEMJxlBpOkvDqE/8Etbaoq+XljQPMcRQaxpDDCUYQ6XpLA3j/r1Fim5Jx9XRYUhpMzlgOzx7YFN5ahywGZ1+A5m83p1d7xK2AAAAAElFTkSuQmCC'>
                                        <AccountCircleIcon />
                                    </Avatar>
                                </IconButton>
                            </Tooltip>

                            <SwipeableDrawer
                                anchor={anchor}
                                open={MenuOpen}

                                onClose={closedMenu}
                                onOpen={showMenu}
                            >
                                <div style={{ width: '200px' }}>
                                    <h2>content</h2>
                                    <p>changeds</p>
                                </div>
                            </SwipeableDrawer>
                        </Toolbar>
                    </AppBar>
                </header>


                <div className={classes.root}>
                    <Row>
                        {/* <Col>
                        {user ? (
                            <>
                                <p>Welcome, {user.displayName}.</p>
                                <Button variant='contained' color='primary' onClick={logout}>Logout here</Button>
                            </>
                        ) : (
                            <Button variant='contained' color='primary' onClick={login}>Login with Microsoft Here</Button>
                        )
                        }
                    </Col> */}
                        <Col md={8} xs={12}>
                            <List
                                sx={{
                                    borderRadius: '5px',
                                    /*'&::-webkit-scrollbar':{}, may not do*/
                                    width: '35vw',
                                    bgcolor: 'rgba(255, 255, 255,0.8)',
                                    overflow: 'auto',
                                    height: '45vh',
                                    maxHeight: 460,
                                    border: 1,
                                    borderColor: 'rgba(117,117,117,0.6)',
                                    marginRight: '7.5%',
                                    marginBottom: "5%",
                                    '& ul': { padding: 2 },
                                }}
                                subheader={<li />}
                            >
                                {[0, 1, 2, 3, 4].map((sectionId) => (
                                    <li key={`section-${sectionId}`}>
                                        <ul>
                                            <ListSubheader>{`I'm sticky ${sectionId}`}</ListSubheader>
                                            {[0, 1, 2].map((item) => (
                                                <ListItem key={`item-${sectionId}-${item}`}>
                                                    <Button onClick={() => handleSubmitGpt("Lect01_1")}>GPT</Button>
                                                </ListItem>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </List>
                            <Grid container
                                xs={12}
                                sx={{
                                    backgroundColor: 'rgba(244, 244, 244, 0.85)',
                                    boxShadow: ' 0px 4px 4px rgba(0, 0, 0, 0.05)',
                                    width: '35vw',
                                    height: '23vh',
                                    borderRadius: 5,
                                    paddingTop: 3,
                                    paddingBottom: 3,
                                    paddingLeft: 3, paddingRight: 3
                                }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Button
                                            variant="contained"
                                            style={{ backgroundColor: 'rgba(255, 164, 27, 0.76)' }}
                                            sx={{ height:"100%", width:"100%" }}
                                            startIcon={<MeetingRoomIcon />}
                                        >
                                            Create Room
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={6} sx={{ display:"flex", justifyContent: "space-between", flexDirection: "column"}}>
                                        <TextField
                                            label="Room ID"
                                            sx={{ width: '100%', height: '45%', backgroundColor: '#FCFCFC', borderRadius: '4px 4px 0 0'}}
                                            fullWidth={true}
                                            value={roomId}
                                            onChange={e => setRoomId(e.target.value)}
                                            className={classes.textField}
                                        />
                                        <Button
                                            variant="contained"
                                            fullWidth={true}
                                            style={{ backgroundColor: 'rgba(52, 154, 227, 0.76)', borderRadius: '0 0 4px 4px' }}
                                            sx={{ width: '100%', height: '45%'}}
                                            startIcon={<KeyIcon />}
                                            onClick={handleSubmit}
                                        >
                                            Enter
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Col>
                        <Col md={3} xs={12}>
                            <Grid container
                                sx={{
                                    borderRadius: '15px ',
                                    border: '1px outset LightSlateGray ',
                                    boxShadow: '0px 0px 10px rgba(183, 183, 183, 0.5)',
                                    width: '20vw',
                                    height: '70vh',
                                    marginLeft: '7.5%',
                                }}>
                                <Grid item xs={12} style={{ borderTopLeftRadius: '15px ', borderTopRightRadius: '15px ', boxShadow: '0px 4px 4px rgba(130, 130, 130, 0.25)', backgroundColor: 'rgba(52, 154, 227, 0.8)', height: '15%' }}>
                                    <Box>
                                        {"active"}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} style={{ height: '85%', backgroundColor: 'rgba(252,252,252,0.85)', borderBottomLeftRadius: '15px ', borderBottomRightRadius: '15px ' }}>
                                    <Box >
                                    <h1>Active Rooms</h1>
                                    <ul>
                {Roomlist.length>0 && Roomlist?.map(room => (
                    <li><Button onClick={() => goRoom(room.room_id)}>{room.room_name}</Button></li>
                ))}
            </ul>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Col>
                    </Row>

                </div>
            </Box>
        </>
    );
};


export default EnterRoomId;