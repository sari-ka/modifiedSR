import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { villageContext } from '../Context/LoginV_Context';
import 'bootstrap/dist/css/bootstrap.min.css';

const Accepted = ({ villageId }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [trustNames, setTrustNames] = useState({});
  const { currentVillage } = useContext(villageContext);

  // Fetch accepted problems
  useEffect(() => {
    const fetchAcceptedProblems = async () => {
      if (!currentVillage) {
        setError('Village ID is not provided');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:9125/village-api/${currentVillage}/problems/accepted`
        );

        console.log('API Response:', response);
        setProblems(response.data.payload);

        if (response.data.payload.length === 0) {
          setStatusMessage('No accepted problems found');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setStatusMessage('No accepted problems found');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedProblems();
  }, [currentVillage]);


  const handleAcceptProblem = async (problemId) => {
    try {
      setStatusMessage('Processing...');
  
      // STEP 1: Get Village ID using Village Name (currentVillage)
      const villageResponse = await axios.get(
        `http://localhost:9125/village-api/village/${currentVillage}`
      );
  
      const villageData = villageResponse.data.payload;
      const villageId = villageData._id;
  
      // STEP 2: Find the accepted trust ID for this problem
      const problem = problems.find((p) => p._id === problemId);
      const trustId = problem.accepted_trust?._id || problem.accepted_trust;
  
      if (!trustId) {
        setStatusMessage('❌ No accepted trust found for this problem');
        return;
      }
  
      // STEP 3: Assign the problem to trust
      const assignResponse = await axios.post(
        `http://localhost:9125/trust-api/trust/assign-problem`,
        { trustId, villageId, problemId }
      );
  
      if (assignResponse.data.success) {
        setStatusMessage('✅ Problem assigned successfully to trust!');
      } else {
        setStatusMessage(assignResponse.data.message || 'Failed to assign problem to trust');
      }
  
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Error assigning problem to trust:', error);
      setStatusMessage(
        error.response?.data?.message ||
        error.message ||
        'Failed to assign problem to trust'
      );
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };
  

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center mt-4">
        Error loading problems: {error}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Accepted Problems</h1>

      {statusMessage && (
        <div className={`alert ${statusMessage.includes('No accepted problems') ? 'alert-info' : 'alert-warning'}`}>
          {statusMessage}
        </div>
      )}

      {problems.length > 0 ? (
        <div className="list-group">
          {problems.map((problem) => {
            const trustId = problem.accepted_trust?._id || problem.accepted_trust;
            return (
              <div key={problem._id} className="list-group-item mb-3 d-flex justify-content-between">
                <div>
                  <h5>{problem.title}</h5>
                  <p>{problem.description}</p>
                  <small className="text-muted">Estimated: ₹{problem.estimatedamt}</small>
                </div>
                <div>
                  <span
                    className={`badge ${problem.status === 'pending' ? 'bg-warning' : problem.status === 'upcoming' ? 'bg-info' : 'bg-success'}`}
                  >
                    {problem.status}
                  </span>
                </div>
                <button
                  className="btn btn-success w-25 h-25"
                  onClick={() => handleAcceptProblem(problem._id)}
                >
                  Accept
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        !statusMessage && <p>No accepted problems found</p>
      )}
    </div>
  );
};

export default Accepted;