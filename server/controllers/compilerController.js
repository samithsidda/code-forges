const axios = require("axios");

const languageMap = {
    java: 62,
    python: 71,
    cpp: 54,
    javascript: 63,
};

const runCode = async (req, res) => {
    try {
        const { code, language, input } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                message: "Code and language are required",
            });
        }

        const languageId = languageMap[language];

        if (!languageId) {
            return res.status(400).json({
                message: "Unsupported language",
            });
        }

        const judge0Response = await axios.post(
            "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
            {
                source_code: code,
                language_id: languageId,
                stdin: input || "",
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
                    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                },
            }
        );

        const result = judge0Response.data;

        return res.status(200).json({
            stdout: result.stdout,
            stderr: result.stderr,
            compile_output: result.compile_output,
            message: result.message,
            status: result.status,
            time: result.time,
            memory: result.memory,
        });

    } catch (err) {
        console.error(
            "Judge0 Error:",
            err.response?.data || err.message
        );

        return res.status(500).json({
            message: "Error executing code",
            error:
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message,
        });
    }
};

module.exports = {
    runCode,
};