const fs = require('fs');
const pdf = require('pdf-parse');
const { Configuration, OpenAIApi } = require("openai");

let dataBuffer = fs.readFileSync('./server/controllers/test.pdf');

export async function GptQuizAPI (lectureNoteNum) {
    async function chatGPT(pdf){
        const configuration = new Configuration({
            apiKey: "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",
        });
        const openAi = new OpenAIApi(configuration);
    
        console.log("start")
        const res = await openAi.createChatCompletion({
            model:"gpt-3.5-turbo",
            messages:[
                {"role": "system", "content": "You are a university teacher, so Answer as precisely and concisely as possible. You will create some question and ans based on lecture note and your knowledge to help student revision."},
                {"role": "user", "content": `Here is the lecture note pdf ${pdf}`},
                {"role": "user", "content": `Generate 4 multiple choice question with answer and explain based on the note and your knowledge, the choices should be unique.`},
                {"role": "system", "content": 
                `plz response in this json format:
                [
                    {
                    "question": {Question},
                    "options":[
                        "A) ","B) ","C) ","D) "
                    ],       
                    answer: "A/B/C/D",
                    explanation: "",
                    },
                ]
                `},
            ]
        })
        return res.data.choices[0].message.content
        // fs.writeFile('Output.txt', res.data.choices[0].message.content, (err) => {
        //     if (err) throw err;
        // })
    }

    return pdf(dataBuffer).then(function(data) {
        return chatGPT(data.text).then(r => {return r})
    });

}

// GptQuizAPI("asd").then(r => {console.log(r)})




// `plz response in this format:
//             Question 1. {Question}
//             A) 
//             B) 
//             C) 
//             D) 
            
//             Answer: {A/B/C/D}
            
//             Explanation:
//             `