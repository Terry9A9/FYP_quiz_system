const fs = require('fs');
const pdf = require('pdf-parse');
const { Configuration, OpenAIApi } = require("openai");

const MongoClient = require('mongodb').MongoClient;
const mongourl = 'mongodb+srv://FYP:123@cluster0.oxp1vse.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'FYP_DATA';

//const client = new MongoClient(mongourl, {useNewUrlParser: true, useUnifiedTopology: true});



export async function GptQuizAPI (note_id) {
    
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
        console.log(res.data.choices[0].message.content)
        return res.data.choices[0].message.content
        // fs.writeFile('Output.txt', res.data.choices[0].message.content, (err) => {
        //     if (err) throw err;
        // })
    }

    const projection = {
        'notes.$': 1
      };

    const client = await MongoClient.connect(
        'mongodb+srv://FYP:123@cluster0.oxp1vse.mongodb.net/?retryWrites=true&w=majority',
        { useNewUrlParser: true, useUnifiedTopology: true }
      );

    const coll = client.db('FYP_DATA').collection('courses');
    const cursor = coll.find({"notes.note_id":note_id},{projection});
    const result = await cursor.toArray();
    await client.close();
    //console.log(result[0].notes[0].content.buffer)
    return await pdf(result[0].notes[0].content.buffer).then(function(data) {
        return chatGPT(data.text).then(r => { return r})
    })
}

// GptQuizAPI("Lect01_1").then(r => {console.log(r)})

// let dataBuffer = fs.readFileSync('./server/controllers/321F Lect01-ch13_EERD_v1.pdf');

// console.log(dataBuffer)

// const client = new MongoClient(mongourl, {useNewUrlParser: true, useUnifiedTopology: true});

// const uploadNote : course ={
//     course_id: "COMPS321F",
//     course_name: "Advanced Database And Data Warehousing",
//     notes: [
//         {
//             title: "321F Lect01-ch13_EERD_v1",
//             content: dataBuffer
//         }
        
//     ]
// }

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