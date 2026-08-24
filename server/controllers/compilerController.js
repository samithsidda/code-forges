const axios = require("axios");

const runCode = async (req, res) => {

    try {

        const {
            language,
            version,
            code,
            input,
        } = req.body;

        if (!language || !version || !code) {

            return res.status(400).json({
                message: "Language, version and code are required",
            });

        }

        const response = await axios.post(

            "https://emkc.org/api/v2/piston/execute",

            {

                language,

                version,

                files: [

                    {

                        content: code,

                    },

                ],

                stdin: input || "",

            }

        );

        res.status(200).json(response.data);

    }

    catch (err) {

        res.status(500).json({

            message: err.response?.data || err.message,

        });

    }

};

module.exports = {

    runCode,

};