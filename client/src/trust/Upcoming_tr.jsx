import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { TrustContext } from "../Context/LoginT_Context";
import 'bootstrap/dist/css/bootstrap.min.css';

function Upcoming_tr() {
    const { currentTrust } = useContext(TrustContext);
    const [upcomingProblems, setUpcomingProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [problemVillageMap, setProblemVillageMap] = useState({});  // This stores problem_id -> village_id

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                if (!currentTrust) {
                    console.error("No current trust selected.");
                    setLoading(false);
                    return;
                }

                // Step 1: Get the assigned problems from the trust
                const res = await axios.get(`http://localhost:9125/trust-api/${currentTrust}/upcoming`);
                const assignedProblems = res.data || [];

                // Step 2: Fetch full problem details for each assigned problem
                const problemDetails = await Promise.all(
                    assignedProblems.map(async (assignedProblem) => {
                        try {
                            if (assignedProblem.village_id && assignedProblem.problem_id) {
                                const response = await axios.get(`http://localhost:9125/village-api/${assignedProblem.village_id}/problem/${assignedProblem.problem_id}`);
                                const fullProblem = response.data; // Full problem detail

                                // Step 3: Store village_id -> problem_id mapping
                                setProblemVillageMap(prevState => ({
                                    ...prevState,
                                    [assignedProblem.problem_id]: assignedProblem.village_id
                                }));

                                return fullProblem; // Return full problem data
                            } else {
                                console.error("Invalid assigned problem format:", assignedProblem);
                                return null;
                            }
                        } catch (err) {
                            console.error(`Error fetching problem with id ${assignedProblem.problem_id}`, err);
                            return null;
                        }
                    })
                );

                // Step 4: Set only successfully fetched problems
                setUpcomingProblems(problemDetails.filter(problem => problem !== null));
            } catch (err) {
                console.error("Error fetching upcoming assigned problems", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUpcoming();
    }, [currentTrust]);

    const handleStartProblem = async (problemId) => {
        // Retrieve village_id from the map using problemId
        const villageId = problemVillageMap[problemId];

        if (!villageId) {
            console.error("Village ID not found for problem:", problemId);
            return;
        }

        try {
            // Send the PUT request to start the problem
            const res = await axios.put(
                `http://localhost:9125/trust-api/trust/${villageId}/${problemId}/start`
            );

            if (res.data && res.data.payload) {
                console.log("Problem started:", res.data.payload);

                // Refresh the list of upcoming problems to reflect changes
                const refreshRes = await axios.get(`http://localhost:9125/trust-api/${currentTrust}/upcoming`);
                setUpcomingProblems(refreshRes.data);
            } else {
                console.error("Failed to start problem:", res);
            }
        } catch (err) {
            console.error("Error starting problem:", err);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <h2 className="mb-4">Upcoming Problems</h2>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Upcoming Problems</h2>

            <div className="row">
                {upcomingProblems.length > 0 ? (
                    upcomingProblems.map((problem) => (
                        <div key={problem.problem_id} className="col-md-6 mb-4">
                            <div className="card shadow-sm h-100 border-0">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <h5 className="card-title fw-bold mb-3">{problem.title}</h5>

                                    <div className="mb-2">
                                        <small className="text-muted">Description:</small>
                                        <p className="mb-2">{problem.description}</p>
                                    </div>

                                    <div className="mb-3">
                                        <small className="text-muted">Estimated Amount:</small>
                                        <h6 className="text-success fw-bold">₹{problem.estimatedamt?.toLocaleString() || 'N/A'}</h6>
                                    </div>

                                    <button
                                        className="btn btn-primary w-25 mt-auto p-2"
                                        onClick={() => handleStartProblem(problem._id)} // Only pass problem._id here
                                    >
                                        Start
                                    </button>

                                    {problem.done_by_trust === "accepted" && problem.done_by_village === "started" &&
                                    <p className="started">Trust said started</p>}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <p>No upcoming problems available.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Upcoming_tr;
