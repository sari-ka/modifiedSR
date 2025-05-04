import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { TrustContext } from "../Context/LoginT_Context";
import 'bootstrap/dist/css/bootstrap.min.css';

function Ongoing_tr() {
  const { currentTrust } = useContext(TrustContext);
  const [upcomingProblems, setUpcomingProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [problemVillageMap, setProblemVillageMap] = useState({});
  const [proofImages, setProofImages] = useState({}); // Store selected images

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        if (!currentTrust) {
          console.error("No current trust selected.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`http://localhost:9125/trust-api/${currentTrust}/ongoing`);
        const assignedProblems = res.data || [];

        const problemDetails = await Promise.all(
          assignedProblems.map(async (assignedProblem) => {
            try {
              if (assignedProblem.village_id && assignedProblem.problem_id) {
                const response = await axios.get(`http://localhost:9125/village-api/${assignedProblem.village_id}/problem/${assignedProblem.problem_id}`);
                const fullProblem = response.data;

                setProblemVillageMap(prev => ({
                  ...prev,
                  [assignedProblem.problem_id]: assignedProblem.village_id,
                }));

                return fullProblem;
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

        setUpcomingProblems(problemDetails.filter(p => p !== null));
      } catch (err) {
        console.error("Error fetching upcoming assigned problems", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, [currentTrust]);

  const handleFileChange = (e, problemId) => {
    const file = e.target.files[0];
    setProofImages(prev => ({
      ...prev,
      [problemId]: file,
    }));
  };

  const handleCompleteProblem = async (problemId) => {
    const villageId = problemVillageMap[problemId];
    const proofImage = proofImages[problemId];

    if (!villageId) {
      console.error("Village ID not found for problem:", problemId);
      return;
    }

    if (!proofImage) {
      alert("Please upload a proof image before marking as done.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("proof", proofImage);

      const res = await axios.put(
        `http://localhost:9125/trust-api/trust/${villageId}/${problemId}/done`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (res.data && res.data.payload) {
        console.log("Problem marked as done:", res.data.payload);

        const refreshRes = await axios.get(`http://localhost:9125/trust-api/${currentTrust}/ongoing`);
        const refreshedAssigned = refreshRes.data || [];

        const refreshedProblems = await Promise.all(
          refreshedAssigned.map(async (assignedProblem) => {
            try {
              const response = await axios.get(`http://localhost:9125/village-api/${assignedProblem.village_id}/problem/${assignedProblem.problem_id}`);
              return response.data;
            } catch {
              return null;
            }
          })
        );

        setUpcomingProblems(refreshedProblems.filter(p => p !== null));
        setProofImages(prev => {
          const updated = { ...prev };
          delete updated[problemId];
          return updated;
        });
      } else {
        console.error("Failed to complete problem:", res);
      }
    } catch (err) {
      console.error("Error completing problem:", err);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h2 className="mb-4">Ongoing Problems</h2>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Ongoing Problems</h2>

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

                  <div className="mb-3">
                    <label className="form-label">Upload Proof Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => handleFileChange(e, problem._id)}
                    />
                  </div>

                  <button
                    className="btn btn-primary w-50 mt-auto"
                    onClick={() => handleCompleteProblem(problem._id)}
                    disabled={!proofImages[problem._id]}
                  >
                    Done
                  </button>

                  {problem.done_by_trust === "accepted" && problem.done_by_village === "started" &&
                    <p className="started text-success mt-2">Village said done</p>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <p>No Ongoing problems available.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Ongoing_tr;
