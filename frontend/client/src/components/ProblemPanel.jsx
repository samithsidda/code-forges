function ProblemPanel({ problem }) {

    if(!problem){

        return(

            <div className="panel-card">

                <h2>Problem</h2>

                <p>No problem assigned.</p>

            </div>

        );
    }

    return (

        <div className="panel-card">

            <h2>Problem</h2>

            <div className="problem-title">

                {problem.title}

            </div>

            <div className="problem-difficulty">

                {problem.difficulty}

            </div>

            <button className="problem-btn">

                View Full Problem

            </button>

        </div>

    );
}

export default ProblemPanel;