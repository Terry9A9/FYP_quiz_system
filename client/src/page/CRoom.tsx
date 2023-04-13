import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Grid, Checkbox, FormControlLabel, Select, MenuItem, Typography, ToggleButtonGroup, ToggleButton, Backdrop, CircularProgress } from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import { room } from "../state";
import _ from 'lodash'
import { getUserData } from '../../../server/controllers/loginFunction';

function CreateRoomForm() {
	const [roomName, setRoomName] = useState('' as string);
	const [isAntiCheat, setAntiCheat] = useState(false);
	const [quiz_id, setQuizId] = useState('');
	const [quizType, setQuizType] = React.useState('Live');
	const [userRole, setUserRole] = useState("");
	const [userOid, setUserOid] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const getLoginData = async () => {
			let loginData = JSON.parse(localStorage.getItem('loginData'))
			setUserOid(loginData?.idTokenClaims?.oid)
			const roleRes = await fetch('http://localhost:3004/api/get-role', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					idTokenClaims: loginData?.idTokenClaims
				})
			})
			const jsonData = await roleRes.json();
			setUserRole(jsonData.role)
		}
		getLoginData()
	}, []);

	const handleSubmit = (event) => {
		event.preventDefault();
		// Send form data to backend
		
			let roomId 
			if(quizType == "Live"){
				roomId = (Math.floor(Math.random() * 99999999)+1).toString()
			}else {
				roomId = "84532"
			}
			fetch('http://localhost:3004/api/rooms', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					room_id: roomId,
					room_name: roomName,
					quiz_id: quiz_id,
					quiz_type: quizType,
					create_time: Math.floor(Date.now() / 1000).toString(),
					create_by: userOid,
				})
			})
			setLoading(true)
			if(quizType == "Live"){
				setTimeout(() => {
					setLoading(false)
					navigate(`/play/quiz/${roomId}`)
				}, 2000)
			}else{
				setTimeout(() => {
					setLoading(false)
					navigate(`/`, { replace: true })
				}, 1000)
			}
	};

	const handleRoomNameChange = (event) => {
		setRoomName(event.target.value);
	};

	const handleQuizIdChange = (event) => {
		setQuizId(event.target.value);
	}
	const handleAntiCheat = (event) => {
		setAntiCheat(event.target.checked);
	}

	const handleChangeType = (event, type) => {
		setQuizType(type);
	};

	return (
		<Box sx={{
			position: 'absolute',
			width: '100vw',
			height: '100vh',
			background: "linear-gradient(204.31deg, rgba(143, 188, 255, 0.63) 14.61%, rgba(255, 143, 177, 0.0819) 115.48%)",
			display: 'flex',
			alignItems: 'center',
			flexDirection: 'column',
			justifyContent: 'center'
		}}>
			<form onSubmit={handleSubmit}>
				<Box
					sx={{
						background: 'rgba(255, 255, 255, 1)',
						border: '1px solid rgba(255, 255, 255, 0.94)',
						boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
						borderRadius: '15px',
						height: '72vh',
						display: 'flex',
						flexDirection: 'column',
					}}>

					<Box sx={{
						marginTop: '38px',
						marginLeft: '45px',
						fontFamily: 'Inter',
						fontStyle: 'normal',
						fontWeight: 700,
						fontSize: '16px',
						lineHeight: '20px',
						display: 'flex',
						alignItems: 'center',
						letterSpacing: '0.15px',
					}}>Room Name:<br /></Box>

					<TextField
						label=""
						value={roomName}
						onChange={handleRoomNameChange}
						sx={{ width: '80%', marginLeft: '45px', marginTop: '1vh', marginBottom: '2vh' }}
					/>

					<Box sx={{
						marginLeft: '45px',
						fontFamily: 'Inter',
						fontStyle: 'normal',
						fontWeight: 700,
						fontSize: '16px',
						lineHeight: '20px',
						display: 'flex',
						alignItems: 'center',
						letterSpacing: '0.15px',
					}}>
						Quiz:<br /></Box>
					<Select
						label="quiz_id"
						value={quiz_id}
						onChange={handleQuizIdChange}
						sx={{ width: '80%', marginLeft: '45px', marginTop: '1vh', marginBottom: '2vh' }}
					>
						<MenuItem value="84532">lecture 1 quiz</MenuItem>
					</Select>

					<ToggleButtonGroup
						value={quizType}
						exclusive
						size="large"
						onChange={handleChangeType}
						aria-label="Platform"
						sx={{ marginLeft: '45px', marginBottom: '10px' }}
						disabled={userRole === "student"}
					>
						<ToggleButton value="Live">Live</ToggleButton>
						<ToggleButton value="Attendant">Attendant</ToggleButton>
					</ToggleButtonGroup>

					<Box sx={{
						marginLeft: '45px',
						fontFamily: 'Inter',
						fontStyle: 'normal',
						fontWeight: 700,
						fontSize: '16px',
						lineHeight: '20px',
						display: 'flex',
						alignItems: 'center',
						letterSpacing: '0.15px',
					}}>
						Anti-Cheat mode:
						<FormControlLabel
							label=""
							control={<Checkbox checked={isAntiCheat} onChange={handleAntiCheat}
								sx={{ marginLeft: '5px' }}
							/>}
						/>
					</Box>
				</Box>
				<br />
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						width: '100%'
					}}
				>
					<Button
						type="submit"
						variant="contained"
						sx={{
							background: '#FFDB5B',
							border: '1px solid rgba(255, 255, 255, 0.94)',
							boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
							borderRadius: '25px',
							marginTop: '1vh',
							height: '8vh',
							width: '70vw',
							maxWidth: '570px'
						}}
					>
						<Typography variant='body2' color={"black"}>
							Create room
						</Typography>
					</Button>
				</Box>
			</form>
			<Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
		</Box>
	);
}

export default CreateRoomForm;