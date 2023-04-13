import {
    Button,
    Container,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Typography,
    Grid,
    Icon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Fab,
    Backdrop,
    CircularProgress,
    Skeleton
} from "@mui/material";

import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';

import axios from "axios";

import React, { useEffect, useRef, useState } from "react";
import { mcQuiz, quiz } from "../state";
import { useNavigate, useParams } from "react-router-dom";
import { lightGreen } from "@mui/material/colors";


function AttQuiz() {
    const [currentQuestion, setCurrentQuestion] = useState(0 as number);
    const [selectedOption, setSelectedOption] = useState('' as string);
    const [score, setScore] = useState(0 as number);
    const [showScore, setShowScore] = useState(false as boolean);
    const [saveChoice, setSaveChoice] = useState([] as string[]);
    const [expanded, setExpanded] = React.useState<string | false>(false);
    const [loading, setLoading] = useState(false as boolean);
    const [questions, setQuestions] = useState({} as quiz);
    const dataFetchedRef = useRef(false as boolean);
    const [enter, setEnter] = useState(false as boolean);

    const navigate = useNavigate();
    let { quizID } = useParams();
    useEffect(() => {
        if (!questions.question_set) {
            let lectureQuiz = axios.get(`http://localhost:3004/api/attendanceQuiz/${quizID}`)
            lectureQuiz.then((res) => {
                console.log(res.data);
                setQuestions(res.data)
            })
        }

    }, [questions]);
    // useEffect(() => {
    //     if (dataFetchedRef.current) return;
    //     dataFetchedRef.current = true;
    //     if (questions.length === 0) {
    //         setLoading(true);
    //         let lectureQuiz = axios.get('http://localhost:3004/api/gptQuiz/Lect01_1')
    //         lectureQuiz.then((res) => {
    //             console.log(res.data);
    //             setLoading(false);
    //             setQuestions(res.data)
    //         })
    //     }
    // }, []);
    // let lectureQuiz = axios.get('http://localhost:3004/api/gptQuiz/1')
    // lectureQuiz.then((res) => {console.log(res.data)})
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleNextQuestion = () => {
        if (selectedOption === questions.question_set[currentQuestion].correct) {
            setScore(score + 1);
        }
        setSaveChoice([...saveChoice, selectedOption]);

        if (currentQuestion === questions.question_set.length - 1) {
            setShowScore(true);
        } else {
            setCurrentQuestion(currentQuestion + 1);
        }

        setSelectedOption('');
    };

    const handleRestartQuiz = () => {
        navigate(`/`, { replace: true });
        // setCurrentQuestion(0);
        // setSelectedOption('');
        // setScore(0);
        // setShowScore(false);
        // setSaveChoice([]);
    };

    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false);
        };

    const handleMouseLeave = () => {
        if (!showScore) {
            setEnter(false)
            document.querySelector("#show");
            infoModal.showModal()
            console.log("mouse Leave!!")
        }

    }

    const handleMouseEnter = () => {
        setEnter(true)
        infoModal.close()

    }

    return (
        <div
            onMouseLeave={() => handleMouseLeave()}
            onMouseEnter={() => handleMouseEnter()}
            tabIndex={0}
            style={{height: "100vh", width: "100vw"}}
        >
            <Container maxWidth="md">
            <br/>
                <br/>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                {questions.question_set && questions.question_set.length == 0 ? <Skeleton height={100} width={300} /> : <Typography variant="h4" sx={{ mb: 2 }}>
                    {showScore ? `You scored ${score} out of ${questions.question_set.length}` : `Question ${currentQuestion + 1}`}
                </Typography>}

                {showScore &&
                    <Typography variant="h4" color={"lightGreen"}>
                        Attendance Marked
                    </Typography>
                }
            </div>


            {showScore ? (
                <div>
                    {questions.question_set && questions.question_set.map((question, qIndex) => (
                        <div key={qIndex}  >
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {questions && question.question}
                            </Typography>
                            <FormControl component="fieldset" sx={{ mb: 2 }}>
                                <RadioGroup value={saveChoice[qIndex]}>
                                    {question.answers.map((option, index) => (
                                        <div style={{ display: "inline-block" }}>
                                            <FormControlLabel key={index} value={option} control={<Radio />} label={option} disabled style={{ maxWidth: "500px" }}></FormControlLabel>
                                            {option === question.correct ? <DoneIcon style={{ color: "green" }} /> : saveChoice[qIndex] === option && <CloseIcon style={{ color: "red" }} />}
                                        </div>
                                    ))}
                                </RadioGroup>
                                <br />
                            </FormControl>
                        </div>
                    ))}
                    <Fab color="primary" aria-label="Back Home Page" onClick={handleRestartQuiz} style={{
                        position: 'sticky',
                        bottom: 16,
                        float: "right",
                    }}>
                        <HomeIcon />
                    </Fab>
                </div>
            ) : (
                <div>
                    {questions.question_set && questions.question_set.length == 0 ? <Skeleton height={70} width={500} /> : <Typography variant="h6" sx={{ mb: 2 }}>
                        {questions.question_set && questions.question_set[currentQuestion].question}
                    </Typography>}
                    {questions.question_set && questions.question_set.length == 0 ? <Skeleton variant="rectangular" height={500} /> :
                        <FormControl component="fieldset" sx={{ mb: 2 }}>
                            {questions?.question_set && questions?.question_set[currentQuestion]?.img && <img src={`data:image/jpg;base64, ${questions.question_set[currentQuestion].img}`} />}
                            <FormLabel component="legend">Select an option:</FormLabel>
                            <RadioGroup value={selectedOption} onChange={handleOptionChange}>
                                {questions.question_set && questions.question_set[currentQuestion].answers.map((option, index) => (
                                    <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
                                ))}
                            </RadioGroup>
                            <br />
                            <Button
                                variant="contained"
                                disabled={!selectedOption}
                                onClick={handleNextQuestion}
                                style={{ maxWidth: "100px" }}
                            >
                                {questions.question_set && currentQuestion === questions.question_set.length - 1 ? 'Finish' : 'Next'}
                            </Button>
                        </FormControl>
                    }
                </div>
            )}
            <dialog id="infoModal" style={{ height: "100%", width: '100%' }} >
                <div style={{ display: 'flex', alignItems: "center", justifyContent: "center", marginTop: "40vh", flexDirection: "column" }}>
                    <Typography variant='h3'>Please move your mouse back to the quiz! </Typography>
                </div>
            </dialog>
        </Container>
        </div>
        
    );
}

export default AttQuiz;