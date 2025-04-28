import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { villageContext } from "../Context/LoginV_Context";
import 'bootstrap/dist/css/bootstrap.min.css';

function Upcoming_v() {
  const { currentVillage } = useContext(villageContext);
  const [upcomingProblems, setUpcomingProblems] = useState([]);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await axios.get(`http://localhost:9125/village-api/${currentVillage}/upcoming`);
        console.log(res.data);
        setUpcomingProblems(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUpcoming();
  }, [currentVillage]);

  const handleStartProblem = async (problemId) => {
    try {
      // Step 1: Fetch villageId using the village name
      const villageRes = await axios.get(`http://localhost:9125/village-api/village/${currentVillage}`);
      const villageId = villageRes.data.payload._id; // Get villageId from response
      
      // Step 2: Use the villageId in the PUT request
      const res = await axios.put(
        `http://localhost:9125/village-api/village/${villageId}/${problemId}/start`
      );
      console.log('Problem started:', res.data);
  
      // Refresh upcoming problems after marking started
      const refresh = await axios.get(`http://localhost:9125/village-api/${currentVillage}/upcoming`);
      setUpcomingProblems(refresh.data);
  
    } catch (err) {
      console.error('Error starting problem:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Upcoming Problems</h2>

      <div className="row">
        {Array.isArray(upcomingProblems) && upcomingProblems.length > 0 ? (
          upcomingProblems.map((problem) => (
            <div key={problem._id} className="col-md-6 mb-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body d-flex flex-column justify-content-between">
                  <h5 className="card-title fw-bold mb-3">{problem.title}</h5>
                  
                  <div className="mb-2">
                    <small className="text-muted">Description:</small>
                    <p className="mb-2">{problem.description}</p>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">Estimated Amount:</small>
                    <h6 className="text-success fw-bold">₹{problem.estimatedamt}</h6>
                  </div>

                  <button className="btn btn-primary w-25 mt-auto" onClick={() => handleStartProblem(problem._id)}>Started</button>
                  {
                    problem.done_by_trust === "started" && problem.done_by_village === "accepted" && <p className="started">Trust said started</p>
                  }
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

export default Upcoming_v;
