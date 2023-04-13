export type quiz = {
    title: string
    quiz_id: string,
    created_by: string,
    course: string,
    start_date: string,
    end_date: string,
    time: number,
    random: boolean,
    creator_id: string,
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
    correct: string
}

export type userProfile = {
    displayName: string,
    email: string,
    role: string,
    oid: string,
    courses: string[],
}

export type room = {
    room_id: string,
    room_name: string,
    status: boolean,
    quiz_type: string,
    quiz_id:string,
    question_num?: number,
    create_time: string,
    finish_time: string,
    create_by: string,
    leaderboard: profile[],
}

export type profile = {
    playerId:string,
    userName:string,
    totalPoint:number,
    answered_question:answered_question[]
}

export type answered_question = {
    type:string,
    correct:boolean,
    ans:string[],
    mouseleaveTime:number,
    mouseleaveCount:number,
}

export type mcQuiz = {
    title: string,
    quiz_id: string,
    question_set: mcQuestion[],
    enable_anti_cheat: boolean,
}

export type mcQuestion = {
    question: string,
    options: string[],       
    answer: string,
    explanation?: string,
}

export type course = {
    course_id: string,
    course_name: string,
    notes: note[],
}

export type note = {
    title: string,
    content: BinaryType,
}