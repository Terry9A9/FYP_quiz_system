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
import ReplayIcon from '@mui/icons-material/Replay';

import axios from "axios";

import React, { useEffect, useRef, useState } from "react";

const questionsa = [
    {
        "question": "What is the main purpose of normalization?",
        "options": [
            "A) To increase data redundancy",
            "B) To decrease data redundancy",
            "C) To increase data consistency",
            "D) To decrease data consistency"
        ],
        "answer": "B",
        "explanation": "The main purpose of normalization is to decrease data redundancy and eliminate undesirable characteristics like update anomalies."
    },
    {
        "question": "What is functional dependency?",
        "options": [
            "A) A relationship between data and user",
            "B) A relationship between tables in database",
            "C) A relationship between attributes in a table",
            "D) A relationship between fields in a form"
        ],
        "answer": "C",
        "explanation": "Functional dependency is a relationship between attributes in a table, which describes the dependence of one attribute on another."
    },
    {
        "question": "What is the lossless-join property?",
        "options": [
            "A) It enables us to find any instance of the original relation from corresponding instances in the smaller relations.",
            "B) It enables us to enforce a constraint on the original relation by enforcing some constraints on each of the smaller relations.",
            "C) It ensures that there is no loss of data or information when tables are joined.",
            "D) It avoids the problem of data redundancy in a database."
        ],
        "answer": "C",
        "explanation": "The lossless-join property ensures that there is no loss of data or information when two or more tables are joined together."
    },
    {
        "question": "What is a transitive dependency?",
        "options": [
            "A) A condition where one attribute depends on another, which in turn depends on a third attribute",
            "B) A condition where one attribute depends on itself",
            "C) A condition where two attributes depend on each other",
            "D) A condition where one attribute depends on another"
        ],
        "answer": "A",
        "explanation": "A transitive dependency is a condition where one attribute depends on another, which in turn depends on a third attribute. This can potentially cause update anomalies in a relation."
    }
];

function GptQuiz() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [saveChoice, setSaveChoice] = useState([] as string[]);
    const [expanded, setExpanded] = React.useState<string | false>(false);
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([] as any);
    const dataFetchedRef = useRef(false);


    useEffect(() => {
        if (dataFetchedRef.current) return;
        dataFetchedRef.current = true;
        if (questions.length === 0) {
            setLoading(true);
            let lectureQuiz = axios.get('http://localhost:3004/api/gptQuiz/1')
            lectureQuiz.then((res) => {
                console.log(res.data);
                setLoading(false);
                setQuestions(res.data)
            })
        }
    }, []);
    // let lectureQuiz = axios.get('http://localhost:3004/api/gptQuiz/1')
    // lectureQuiz.then((res) => {console.log(res.data)})
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleOptionGet = (event) => {
        setLoading(true);
        // let lectureQuiz = axios.get('http://localhost:3004/api/gptQuiz/1')
        // lectureQuiz.then((res) => { 
        //     console.log(res.data);
        //     setLoading(false);
        //     setQuestions(res.data)
        // })
    };

    const handleNextQuestion = () => {
        if (selectedOption[0] === questions[currentQuestion].answer) {
            setScore(score + 1);
        }
        setSaveChoice([...saveChoice, selectedOption]);

        if (currentQuestion === questions.length - 1) {
            setShowScore(true);
        } else {
            setCurrentQuestion(currentQuestion + 1);
        }

        setSelectedOption('');
    };

    const handleRestartQuiz = () => {
        setCurrentQuestion(0);
        setSelectedOption('');
        setScore(0);
        setShowScore(false);
        setSaveChoice([]);
    };

    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false);
        };

    return (
        <Container maxWidth="md">
            {questions.length == 0 ? <Skeleton height={100} width={300}/> : <Typography variant="h4" sx={{ mb: 2 }}>
                {showScore ? `You scored ${score} out of ${questions.length}` : `Question ${currentQuestion + 1}`}
            </Typography>}

            {showScore ? (
                <div>
                    {questions && questions.map((question, qIndex) => (
                        <div key={qIndex}  >
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {questions && question.question}
                            </Typography>
                            <FormControl component="fieldset" sx={{ mb: 2 }}>
                                <Accordion
                                    expanded={expanded === `panel${qIndex}`}
                                    onChange={handleChange(`panel${qIndex}`)}
                                    style={{ maxWidth: "700px" }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                    >
                                        <Typography sx={{ width: '33%', flexShrink: 0 }}>
                                            Explanation
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography>
                                            {question.explanation}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                                <RadioGroup value={saveChoice[qIndex]}>
                                    {question.options.map((option, index) => (
                                        <div style={{ display: "inline-block" }}>
                                            <FormControlLabel key={index} value={option} control={<Radio />} label={option} disabled style={{ maxWidth: "500px" }}></FormControlLabel>
                                            {option[0] === question.answer ? <DoneIcon style={{ color: "green" }} /> : saveChoice[qIndex] === option && <CloseIcon style={{ color: "red" }} />}
                                        </div>
                                    ))}
                                </RadioGroup>
                                <br />
                            </FormControl>
                        </div>
                    ))}
                    <Fab color="primary" aria-label="Restart Quiz" onClick={handleRestartQuiz} style={{
                        position: 'sticky',
                        bottom: 16,
                        float: "right",
                    }}>
                        <ReplayIcon />
                    </Fab>
                </div>
            ) : (
                <div>
                    {questions.length == 0 ? <Skeleton height={70} width={500}/> : <Typography variant="h6" sx={{ mb: 2 }}>
                        {questions[currentQuestion].question}
                    </Typography>}
                    {questions.length == 0 ? <Skeleton variant="rectangular" height={500} /> : 
                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <FormLabel component="legend">Select an option:</FormLabel>
                        <RadioGroup value={selectedOption} onChange={handleOptionChange}>
                            {questions[currentQuestion].options.map((option, index) => (
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
                            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </FormControl>
                    }
                </div>
            )}
            {/* <Button onClick={handleOptionGet}>test</Button> */}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                 <Typography variant="h6" sx={{alignContent:"center"}}>
                    {"Waiting OpenAI API to response..."}
                </Typography>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Container>
    );
}

export default GptQuiz;