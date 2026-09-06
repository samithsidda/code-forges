const Groq = require("groq-sdk");


const groq = new Groq({

    apiKey:
        process.env.GROQ_API_KEY,

});


const chatWithAI = async (req, res) => {

    try {

        const {

            message,
            code,
            language,

        } = req.body;


        if (!message) {

            return res.status(400).json({

                message:
                    "Message is required",

            });

        }


        if (!process.env.GROQ_API_KEY) {

            return res.status(500).json({

                message:
                    "Groq API key is not configured",

            });

        }


        const systemPrompt = `
You are an AI coding practice assistant inside a collaborative coding platform called CodeForge.

Your role is to help users practice programming and problem solving.

You can:

- Generate useful test cases
- Suggest edge cases
- Give hints
- Explain errors
- Debug code
- Review code
- Explain time and space complexity

Do not immediately provide a complete solution unless the user explicitly asks for one.

Encourage the user to think and solve the problem.

Current programming language:
${language || "Not specified"}

Current code:
${code || "No code provided"}
`;


        const completion =
            await groq.chat.completions.create({

                model:
                        "openai/gpt-oss-20b",

                messages: [

                    {

                        role:
                            "system",

                        content:
                            systemPrompt,

                    },

                    {

                        role:
                            "user",

                        content:
                            message,

                    },

                ],

                temperature:
                    0.5,

                max_completion_tokens:
                    1024,

            });


        const aiResponse =
            completion
                .choices[0]
                ?.message
                ?.content;


        res.status(200).json({

            message:
                "AI response generated successfully",

            response:
                aiResponse,

        });


    } catch (err) {

        console.error(
            "Groq AI Error:",
            err
        );


        res.status(500).json({

            message:
                err.message ||
                "Failed to get AI response",

        });

    }

};


module.exports = {

    chatWithAI,

};