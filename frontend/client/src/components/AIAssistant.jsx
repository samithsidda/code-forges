import {
    useEffect,
    useState,
} from "react";

import api from "../api/axios";

import "../styles/AIAssistant.css";


function AIAssistant({
    code,
    language,
    socket,
    roomCode,
}) {

    const [messages, setMessages] =
        useState([

            {

                role: "assistant",

                content:
                    "Hi! I'm your CodeForge AI Assistant. I can help you generate test cases, find edge cases, give hints, review your code, or explain errors.",

            },

        ]);


    const [input, setInput] =
        useState("");


    const [isLoading, setIsLoading] =
        useState(false);


    // =====================================
    // RECEIVE REAL-TIME AI MESSAGES
    // =====================================

    useEffect(() => {

        if (!socket) {
            return;
        }


        const handleAIUserMessage =
            (message) => {

                setMessages(
                    (previousMessages) => [

                        ...previousMessages,

                        message,

                    ]
                );

            };


        const handleAIResponse =
            (message) => {

                setMessages(
                    (previousMessages) => [

                        ...previousMessages,

                        message,

                    ]
                );

            };


        socket.on(
            "ai-user-message",
            handleAIUserMessage
        );


        socket.on(
            "ai-response",
            handleAIResponse
        );


        return () => {

            socket.off(
                "ai-user-message",
                handleAIUserMessage
            );


            socket.off(
                "ai-response",
                handleAIResponse
            );

        };

    }, [socket]);


    // =====================================
    // SEND MESSAGE
    // =====================================

    const sendMessage =
        async (
            customMessage = null
        ) => {

            const userMessage =
                customMessage ||
                input.trim();


            if (
                !userMessage ||
                isLoading
            ) {
                return;
            }


            const newUserMessage = {

                role: "user",

                content:
                    userMessage,

            };


            // Add message locally

            setMessages(
                (previousMessages) => [

                    ...previousMessages,

                    newUserMessage,

                ]
            );


            // Share with collaborators

            socket?.emit(

                "ai-user-message",

                {

                    roomCode,

                    message:
                        newUserMessage,

                }

            );


            setInput("");

            setIsLoading(
                true
            );


            try {

                const token =
                    localStorage.getItem(
                        "token"
                    );


                const response =
                    await api.post(

                        "/ai/chat",

                        {

                            message:
                                userMessage,

                            code,

                            language,

                        },

                        {

                            headers: {

                                Authorization:
                                    `Bearer ${token}`,

                            },

                        }

                    );


                const aiMessage = {

                    role:
                        "assistant",

                    content:
                        response
                            .data
                            .response,

                };


                // Add locally

                setMessages(
                    (previousMessages) => [

                        ...previousMessages,

                        aiMessage,

                    ]
                );


                // Share AI response

                socket?.emit(

                    "ai-response",

                    {

                        roomCode,

                        message:
                            aiMessage,

                    }

                );


            } catch (err) {

                console.error(

                    err.response?.data ||
                    err.message

                );


                const errorMessage = {

                    role:
                        "assistant",

                    content:

                        err.response
                            ?.data
                            ?.message ||

                        "Sorry, I was unable to process your request. Please try again.",

                };


                setMessages(
                    (previousMessages) => [

                        ...previousMessages,

                        errorMessage,

                    ]
                );


                socket?.emit(

                    "ai-response",

                    {

                        roomCode,

                        message:
                            errorMessage,

                    }

                );


            } finally {

                setIsLoading(
                    false
                );

            }

        };


    const handleSubmit =
        (e) => {

            e.preventDefault();

            sendMessage();

        };


    return (

        <aside
            className="ai-assistant"
        >

            <div
                className="ai-header"
            >

                <div>

                    <h2>
                        AI Assistant
                    </h2>

                    <p>
                        Ask for hints, test cases, or code help
                    </p>

                </div>

            </div>


            {/* QUICK ACTIONS */}

            <div
                className="ai-quick-actions"
            >

                <button
                    onClick={() =>
                        sendMessage(
                            "Generate useful test cases for my current code. Include input and expected output."
                        )
                    }
                    disabled={
                        isLoading
                    }
                >
                    Test Cases
                </button>


                <button
                    onClick={() =>
                        sendMessage(
                            "Analyze my current code and suggest important edge cases I should test."
                        )
                    }
                    disabled={
                        isLoading
                    }
                >
                    Edge Cases
                </button>


                <button
                    onClick={() =>
                        sendMessage(
                            "Give me a helpful hint for improving or solving the problem related to my current code. Do not give the complete solution."
                        )
                    }
                    disabled={
                        isLoading
                    }
                >
                    Hint
                </button>


                <button
                    onClick={() =>
                        sendMessage(
                            "Review my current code. Identify bugs, improvements, and time and space complexity."
                        )
                    }
                    disabled={
                        isLoading
                    }
                >
                    Review
                </button>

            </div>


            {/* CHAT */}

            <div
                className="ai-messages"
            >

                {messages.map(
                    (
                        message,
                        index
                    ) => (

                        <div

                            key={index}

                            className={
                                `ai-message ${message.role}`
                            }

                        >

                            <div
                                className="ai-message-label"
                            >

                                {

                                    message.role ===
                                    "user"

                                        ? "You"

                                        : "AI"

                                }

                            </div>


                            <div
                                className="ai-message-content"
                            >

                                {
                                    message.content
                                }

                            </div>

                        </div>

                    )
                )}


                {isLoading && (

                    <div
                        className="ai-message assistant"
                    >

                        <div
                            className="ai-message-label"
                        >
                            AI
                        </div>

                        <div
                            className="ai-message-content"
                        >
                            Thinking...
                        </div>

                    </div>

                )}

            </div>


            {/* INPUT */}

            <form

                className="ai-input-container"

                onSubmit={
                    handleSubmit
                }

            >

                <textarea

                    value={
                        input
                    }

                    onChange={(e) =>
                        setInput(
                            e.target.value
                        )
                    }

                    placeholder="Ask about your code..."

                    rows="3"

                    disabled={
                        isLoading
                    }

                />


                <button

                    type="submit"

                    disabled={
                        isLoading ||
                        !input.trim()
                    }

                >

                    Send

                </button>

            </form>

        </aside>

    );

}


export default AIAssistant;