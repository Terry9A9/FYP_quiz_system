
export type quiz = {
    title: string
    quiz_id: string,
    created_by: string,
    course: string,
    start_date: string,
    end_date: string,
    time: number,
    mc: boolean,
    random: boolean,
    questionSet: question[]
}

export type question = {
    point: number,
    question: string,
    img: string,
    answers: [],
    correct: number
}

export type profile = {
    socketId:string,
    totalPoint: number
}