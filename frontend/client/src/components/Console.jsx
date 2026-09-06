import { useEffect, useState } from "react";
import "../styles/Console.css";


function Console({
    output,
    error,
    isRunning,
}) {

    /*
        Console starts minimized.

        When code is run, it automatically
        opens so the user can immediately
        see the result.
    */

    const [isExpanded, setIsExpanded] =
        useState(false);


    /*
        Automatically open the Console
        whenever code is being executed
        or a new result/error arrives.
    */

    useEffect(() => {

        if (
            isRunning ||
            output ||
            error
        ) {

            setIsExpanded(true);

        }

    }, [isRunning, output, error]);


    /*
        Toggle Console size.
    */

    const toggleConsole = () => {

        setIsExpanded(
            (previous) => !previous
        );

    };


    /*
        Determine output text.
    */

    const getOutput = () => {

        if (!output) {

            return "";

        }


        // Compilation error
        if (output.compile_output) {

            return output.compile_output;

        }


        // Runtime error
        if (output.stderr) {

            return output.stderr;

        }


        // Successful output
        if (
            output.stdout !== null &&
            output.stdout !== undefined
        ) {

            return output.stdout;

        }


        // No output
        return (
            output.status?.description ||
            "No output"
        );

    };


    /*
        =====================================
        CONSOLE
        =====================================
    */

    return (

        <div
            className={`console-container ${
                isExpanded
                    ? "console-expanded"
                    : "console-minimized"
            }`}
        >

            {/* ================================
                HEADER
            ================================= */}

            <div
                className="console-header"
            >

                <div
                    className="console-title"
                >

                    <h2>
                        Console
                    </h2>


                    {output?.status && (

                        <span
                            className="console-status"
                        >

                            {
                                output.status.description
                            }

                        </span>

                    )}

                </div>


                <button

                    className="console-toggle-btn"

                    onClick={
                        toggleConsole
                    }

                    title={
                        isExpanded
                            ? "Minimize Console"
                            : "Expand Console"
                    }

                >

                    {isExpanded
                        ? "▼"
                        : "▲"
                    }

                </button>

            </div>


            {/* ================================
                CONSOLE CONTENT
            ================================= */}

            {isExpanded && (

                <div
                    className="console-content"
                >

                    {isRunning ? (

                        <p
                            className="console-message"
                        >

                            Running your code...

                        </p>

                    ) : error ? (

                        <pre
                            className="console-output"
                        >

                            Error: {error}

                        </pre>

                    ) : !output ? (

                        <div
                            className="console-empty"
                        >

                            <p>
                                Console is hidden until the user runs the code.
                            </p>

                            <p>
                                Program output, compilation errors,
                                runtime errors, execution time and
                                memory usage will be displayed here.
                            </p>

                        </div>

                    ) : (

                        <pre
                            className="console-output"
                        >

                            {getOutput()}

                        </pre>

                    )}


                    {/* ============================
                        EXECUTION INFO
                    ============================= */}

                    {output && (

                        <div
                            className="execution-info"
                        >

                            {output.time && (

                                <span>

                                    Time:{" "}
                                    {output.time}s

                                </span>

                            )}


                            {output.memory && (

                                <span>

                                    Memory:{" "}
                                    {output.memory} KB

                                </span>

                            )}

                        </div>

                    )}

                </div>

            )}

        </div>

    );

}


export default Console;