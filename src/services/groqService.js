import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


const MODEL = "llama-3.3-70b-versatile";


export async function generateContent(prompt){

    try{

        const response = await groq.chat.completions.create({

            model: MODEL,

            messages:[
                {
                    role:"user",
                    content:prompt
                }
            ],

            temperature:0.7

        });


        return response.choices[0].message.content;


    }
    catch(error){

        throw new Error(
            `Groq generation failed: ${error.message}`
        );

    }

}