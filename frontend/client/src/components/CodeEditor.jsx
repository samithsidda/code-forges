import { useState } from "react";
import Editor from "@monaco-editor/react";
import "../styles/CodeEditor.css";
import languages from "../utils/languages";

function CodeEditor() {

    const [language, setLanguage] = useState("java");

    const [theme, setTheme] = useState("vs-dark");

    const [fontSize, setFontSize] = useState(16);

    const [code, setCode] = useState(
        languages.java.boilerplate
    );

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

            setCode(languages[selectedLanguage].boilerplate);

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

                        <option value="java">Java</option>

                        <option value="python">Python</option>

                        <option value="cpp">C++</option>

                        <option value="javascript">JavaScript</option>

                    </select>

                    {/* Theme */}

                    <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                    >

                        <option value="vs-dark">Dark</option>

                        <option value="light">Light</option>

                    </select>

                    {/* Font Size */}

                    <select
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                    >

                        <option value={14}>14</option>

                        <option value={16}>16</option>

                        <option value={18}>18</option>

                        <option value={20}>20</option>

                    </select>

                </div>

            </div>

            <div className="editor">

                <Editor

                    height="100%"

                    language={languages[language].monaco}

                    theme={theme}

                    value={code}

                    onChange={(value) => setCode(value)}

                    options={{

                        fontSize,

                        minimap: {
                            enabled: false,
                        },

                        automaticLayout: true,

                    }}

                />

            </div>

            <div className="editor-buttons">

                <button className="run-btn">

                    Run Code

                </button>

                <button className="submit-btn">

                    Submit Solution

                </button>

            </div>

        </div>

    );

}

export default CodeEditor;