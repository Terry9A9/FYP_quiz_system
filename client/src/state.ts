
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
    correct: string
}

export type userProfile = {
    displayName: string
}

export type room = {
    room_id: string,
    room_name: string,
    status: boolean,
    public: boolean,
    password:string,
    quiz_id:string,
    allow_emoji_popup:boolean,
    question_num: number,
    create_time: string,
    finish_time: string,
    leaderboard: profile[],
}

export type profile = {
    playerId:string,
    userName:string,
    totalPoint:number,
    mouseleaveTime:number,
    mouseleaveCount:number,
    answered_question:answered_question[]
}

export type answered_question = {
    type:string,
    correct:boolean,
    ans:string[],
}