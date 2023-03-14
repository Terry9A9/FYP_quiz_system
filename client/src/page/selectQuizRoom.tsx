import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { useNavigate  } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import KeyIcon from '@mui/icons-material/Key';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import MenuIcon from '@mui/icons-material/Menu';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { Row,Col,Container } from 'react-bootstrap';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';

//import Grid from '@mui/material/Grid';
//import Grid2 from '@mui/material/Unstable_Grid2';
import { border, height } from '@mui/system';
import clsx from 'clsx';
import { create } from '@mui/material/styles/createTransitions';
import { ClassNames } from '@emotion/react';
import PropTypes from 'prop-types';



const useStyles = makeStyles()((theme) => {
    return {
        body: {
            backgroundImage:'url("data:image/png;base64,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")'
        },
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '100px',
        }
    ,
        textField: {
            margin: '20px 0'
        },

        menuBtn:{
            display:'inline-block'
        },

        profileBox:{
            display:'inline-block',
            width: '40px',
            borderRadius:'50%',
            marginTop:'1%',
            position:'absolute',
            right:'2.5%'
        },


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

    const showMenu = e =>{
        
    }


    return (
        <>
                <Button startIcon ={<MenuIcon
                    className={classes.menuBtn}
                    style={{fontSize:35}}
                />}
                        onClick={showMenu}
                        sx={{height:'4%',width:'4%',aspectRatio:'1/1',padding:2}}
                >
                </Button>
                <Box className={classes.profileBox}>
                        <img
                        style={{maxWidth:'60px',maxHeight:'60px',borderRadius:'50%'}} 
                        src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAS1BMVEX////n5+f8/PzQ0NDJycmUqan2+PiZrKx9l5fk5OTS0tLExMTs6+u5ubm2tra/v7+MoKB+mZl8kZFtiYl1kJBggoJUenrt8PBJc3OH+DA6AAADlklEQVR4nO2dcW+iQBBHUURQbEVa6H3/T3pnUpdpgsdvmkuuO/vmr8n6mMwLLJB1W6upTdEt6bg6OgwpbSYHbIdnD2wqT40DNqNT1VYpzkt6WB29XFK6bx2wHb55YFO53TtgM9oaw329StdL6d0upcfGAdvKnQc2lZujAzaVMXzaB4YYajCGGFalGO4/41in9A+d0vqY0tNpgRsPbCp3HthUbjywqdxW3bl+xEtKz69L+pI+P/d9Gj6MDthWfvPApvJ4cMCmcud6a7OXx/pVug5vv7U9ge1VunpJ89aG4V/6wBBDDcYQw6o0w6hP/PGQ4nUrvV5T2m8eZ2AzXL/VOmzTsXfA9rgCzmFJ8xBDDLWmMcRQgjFUms7SMOoTv4S1tujrpSXNQwwx1JrGEEMJxlBpOktD11vbE8PtF7HOA28aKm9tw2X3Gad+l+K6pP0ppedzSk/LcQK8VL68X3TYVL4MDthUvgwFGMa/Sku602CIodY0hhhKMIZK0982vHngf2LY7I+POKR03y/pIX1+PJ1S+tE4YFu588CmcvPhgJfK+6aa2uYRY7ORDsOSbx5n4WW4nVePW4ftcZMD/nIcf2/BnUaCMcTwHhhiqNEY/nTDqN8Bs3Mv/3NY0jzEEEOtaQwxlGAMlaazNIz6xGfnHjv3FPinzEMMMdSaxhBDCcZQaTpLw6h7ouLva4tvGP8qLelOgyGGWtMYYijBGCpNZ2UYfSWqhNXEFEFXhEuYhzqNIYb3wBBDCcZQaTpLQ/ucrFdHn+zV34S/vVffVN7eq7/eRlvNt+4Rbym92TR93r2/p9Fu1uEvlX95YJPO3U2Hl8q3uYBzWNI8xBBDrWkMMZRgDJWmszSMuk5Twlpb9PXSkuYhhhhqTWOIoQRjqDSdpWHUPVHx97XFN4x/lZZ0p8EQQ61pDDGUYAyVprMyjL4SVcJqYoqgK8IlzEOdxhDDe2CIoQRjqDSdpWHUJz7/cy//c1jSPMQQQ61pDDGUYAyVprM0jPrbCPF/3yL+b5TE/52Zku40GGKoNY0hhhJcrGHUPVHx97XFN4x/lZZ0p8EQQ61pDDGUYAyVprMyZOceO/f4Dvj/z0OdxhDDe2CIoQRjqDSdpWHUJz479/I/hyXNQwwx1JrGEEMJxlBpOkvDqE/8Etbaoq+XljQPMcRQaxpDDCUYQ6XpLA3j/r1Fim5Jx9XRYUhpMzlgOzx7YFN5ahywGZ1+A5m83p1d7xK2AAAAAElFTkSuQmCC'></img>
                </Box>
            <div className={classes.root}>
                <List
                sx={{
                    width: '65%',
                    maxWidth:1070,
                    bgcolor: 'background.paper',
                    overflow: 'auto',
                    maxHeight: 460,
                    border:1,
                    marginBottom:"2.5%",
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
                            <ListItemText primary={`Item ${item}`} />
                        </ListItem>
                        ))}
                    </ul>
                    </li>
                ))}
                </List>

                <Container style={{width:"80%"}}>
                    <Row>
                        <Col sm={{offset:1}}>
                            <Button variant="contained"
                            color="primary"
                            sx={{height:90,padding:8,width:4/5,maxWidth:360}}
                            startIcon ={<MeetingRoomIcon/>}>
                                Create Room
                            </Button>
                        </Col>
                        
                        <Col sm={{offset:1}}>
                            
                            <TextField
                                label="Room ID"
                                fullWidth={true}
                                sx={{width:4/5,maxWidth:360}}
                                value={roomId}
                                onChange={e => setRoomId(e.target.value)}
                                className={classes.textField}
                            />
                            
                                <ButtonGroup variant="contained" 
                                style={{width:"80%",maxWidth:360}}
                                fullWidth={true}
                                color="primary">
                                <Button 
                                startIcon ={<KeyIcon/>} 
                                onClick={handleSubmit}>
                                    Enter
                                </Button>
                                <Button
                                onClick={e => setRoomId("")}>
                                    clear
                                </Button>
                                </ButtonGroup>
                            
                        </Col>
                        
                    </Row>
                </Container>
            </div>
        </>
    );
};


export default EnterRoomId;