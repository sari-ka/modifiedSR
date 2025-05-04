import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { villageContext } from "../Context/LoginV_Context";
import 'bootstrap/dist/css/bootstrap.min.css';

function Ongoing_v() {
  const { currentVillage } = useContext(villageContext);
  const [ongoingProblems, setOngoingProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOngoing();
  }, [currentVillage]);

  const fetchOngoing = async () => {
    try {
      const res = await axios.get(`http://localhost:9125/village-api/${currentVillage}/ongoing`);
      setOngoingProblems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (problemId) => {
    setSelectedProblemId(problemId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setRating('');
    setMessage('');
    setSelectedProblemId(null);
  };

  const handleSubmitRating = async () => {
    if (!rating) return alert("Please provide a rating.");

    try {
      const villageRes = await axios.get(`http://localhost:9125/village-api/village/${currentVillage}`);
      const villageId = villageRes.data.payload._id;

      await axios.put(
        `http://localhost:9125/village-api/village/${villageId}/${selectedProblemId}/done`,
        { rating: Number(rating), message }
      );

      await fetchOngoing();
      closeModal();
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Ongoing Problems</h2>

      <div className="row">
        {Array.isArray(ongoingProblems) && ongoingProblems.length > 0 ? (
          ongoingProblems.map((problem) => (
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

                  <button className="btn btn-primary w-25 mt-auto p-2" onClick={() => openModal(problem._id)}>
                    Done
                  </button>

                  {problem.done_by_trust === "started" && problem.done_by_village === "accepted" && (
                    <p className="text-danger mt-2">Trust said done</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <p>No ongoing problems available.</p>
          </div>
        )}
      </div>

      {/* Plain Bootstrap Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Rate the Trust</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Rating (1 to 5)</label>
                  <select
                    className="form-select"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="">Select a rating</option>
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Feedback (optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmitRating}>Submit</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ongoing_v;
