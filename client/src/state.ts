
export type quiz = {
    title: string
    quiz_id: string,
    created_by: string,
    course: string,
    start_date: string,
    end_date: string,
    time: number,
    random: boolean,
    question_set: question[]
}

export type question = {
    point: number,
    question: string,
    type:
        "Mc"
        | "TrueOrFalse"
        | "FillInTheBlank"
        | "Sorting"
        | "Picture"
        | "Drawing",
    img?: string,
    answers: string[],
    correct: number
}

export type profile = {
    socketId:string,
    totalPoint: number
}

export type userProfile = {
    displayName: string
}