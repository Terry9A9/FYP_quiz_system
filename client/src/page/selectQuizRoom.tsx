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



const useStyles = makeStyles()((theme) => {
    return {
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