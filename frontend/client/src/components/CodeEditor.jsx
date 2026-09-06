import { useState } from "react";
import Editor from "@monaco-editor/react";
import "../styles/CodeEditor.css";
import languages from "../utils/languages";

function CodeEditor({code,
    onCodeChange,
    onRunCode,
    isRunning,}) {

    const [language, setLanguage] = useState("java");

    const [theme, setTheme] = useState("vs-dark");

    const [fontSize, setFontSize] = useState(16);


    // STDIN state
    const [input, setInput] = useState("");


    const handleLanguageChange = (e) => {

        const selectedLanguage = e.target.value;

        if (
            code.trim() !== languages[language].boilerplate.trim()
        ) {

            const confirmChange = window.confirm(
                "Changing the language will replace your current code. Do you want to continue?"
            );

            if (!confirmChange) {
                return;
            }

        }

        setLanguage(selectedLanguage);

        onCodeChange(
            languages[selectedLanguage].boilerplate
        );

    };


    const handleRunCode = () => {

        console.log("RUN BUTTON CLICKED");

        onRunCode({
            code,
            language,
            version: languages[language].version,
            input,
        });

    };


    return (

        <div className="editor-container">

            <div className="editor-toolbar">

                <div className="editor-controls">

                    {/* Language */}

                    <select
                        value={language}
                        onChange={handleLanguageChange}
                    >

                        <option value="java">
                            Java
                        </option>

                        <option value="python">
                            Python
                        </option>

                        <option value="cpp">
                            C++
                        </option>

                        <option value="javascript">
                            JavaScript
                        </option>

                    </select>


                    {/* Theme */}

                    <select
                        value={theme}
                        onChange={(e) =>
                            setTheme(e.target.value)
                        }
                    >

                        <option value="vs-dark">
                            Dark
                        </option>

                        <option value="light">
                            Light
                        </option>

                    </select>


                    {/* Font Size */}

                    <select
                        value={fontSize}
                        onChange={(e) =>
                            setFontSize(
                                Number(e.target.value)
                            )
                        }
                    >

                        <option value={14}>14</option>

                        <option value={16}>16</option>

                        <option value={18}>18</option>

                        <option value={20}>20</option>

                    </select>

                </div>

            </div>


            {/* Monaco Editor */}

            <div className="editor">

                <Editor

                    height="100%"

                    language={languages[language].monaco}

                    theme={theme}

                    value={code}

                    onChange={(value) =>
                        onCodeChange(value || "")
                    }

                    options={{

                        fontSize,

                        minimap: {
                            enabled: false,
                        },

                        automaticLayout: true,

                    }}

                />

            </div>


            {/* STDIN */}

            <div className="stdin-container">

                <label htmlFor="stdin">
                    Standard Input
                </label>

                <textarea
                    id="stdin"
                    className="stdin-input"
                    value={input}
                    onChange={(e) =>
                        setInput(e.target.value)
                    }
                    placeholder="Enter program input here..."
                    spellCheck="false"
                />

            </div>


            {/* Buttons */}

            <div className="editor-buttons">

                <button
                    className="run-btn"
                    onClick={handleRunCode}
                    disabled={isRunning}
                >
                    {isRunning ? "Running..." : "Run Code"}
                </button>


                <button className="submit-btn">

                    Submit Solution

                </button>

            </div>

        </div>

    );

}

export default CodeEditor;