import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { villageContext } from '../Context/LoginV_Context';
import 'bootstrap/dist/css/bootstrap.min.css';

const Accepted = ({ villageId }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const { currentVillage } = useContext(villageContext);

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
      const res = await axios.put(
        `http://localhost:9125/village-api/${currentVillage}/problem/${problemId}/village-accept`
      );

      const villageResponse = await axios.get(
        `http://localhost:9125/village-api/village/${currentVillage}`
      );

      const villageData = villageResponse.data.payload;
      const villageId = villageData._id;

      const problem = problems.find((p) => p._id === problemId);
      const trustId = problem.accepted_trust?._id || problem.accepted_trust;

      if (!trustId) {
        setStatusMessage('❌ No accepted trust found for this problem');
        return;
      }

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
        error.response?.data?.message || error.message || 'Failed to assign problem to trust'
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
        <div
          className={`alert ${
            statusMessage.includes('No accepted problems')
              ? 'alert-info'
              : statusMessage.includes('✅')
              ? 'alert-success'
              : statusMessage.includes('❌')
              ? 'alert-danger'
              : 'alert-warning'
          } text-center`}
        >
          {statusMessage}
        </div>
      )}

      {problems.length > 0 ? (
        <div className="row g-4">
          {problems.map((problem) => {
            const trustId = problem.accepted_trust?._id || problem.accepted_trust;
            return (
              <div className="container my-5">
              <div className="card shadow-sm rounded-4 mx-auto" style={{ maxWidth: '600px' }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold">Broken Street Lights</h5>
                  <p className="card-text text-muted">
                    None of street lights in the village are working. It is very difficult for the villagers to travel at night.
                  </p>
                  <p className="text-secondary small">Estimated: ₹500000</p>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="badge bg-warning text-dark px-3 py-2">Pending</span>
                    <button className="btn btn-success px-4">Accept</button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        !statusMessage && <p className="text-center">No accepted problems found</p>
      )}
    </div>
  );
};

export default Accepted;
