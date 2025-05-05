import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { IndividualContext } from '../Context/LoginI_Context';

function Individual_profile() {
  const { currentIndividual } = useContext(IndividualContext);
  const [individual, setIndividual] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('pending');

  useEffect(() => {
    const fetchIndividual = async () => {
      try {
        const res = await axios.get(`http://localhost:9125/individual-api/individual/${currentIndividual.email}`);
        setIndividual(res.data.payload[0]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchIndividual();
  }, [currentIndividual.email]);

  if (!individual) return <div className="text-center mt-5">Loading profile...</div>;

  const filteredReceipts = individual.receipts.filter(
    receipt => receipt.status === selectedStatus
  );

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 mb-4 border-0" style={{ backgroundColor: '#f4f6f9' }}>
        <h3 className="text-center text-secondary mb-3">Individual Profile</h3>
        <div className="card-body">
          <p><strong>Name:</strong> {individual.name}</p>
          <p><strong>Username:</strong> {individual.username}</p>
          <p><strong>Email:</strong> {individual.email}</p>
          <p><strong>Contact:</strong> {individual.contact}</p>
          <p><strong>Address:</strong> {individual.address}</p>
        </div>
      </div>

      <div className="text-center mb-4">
        <div className="btn-group">
          {['pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`btn btn-${selectedStatus === status ? 'secondary' : 'outline-secondary'} m-3 px-2 py-1`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} Receipts
            </button>
          ))}
        </div>
      </div>

      {filteredReceipts.length > 0 ? (
        <div className="row">
          {filteredReceipts.map((receipt, idx) => (
            <div className="col-md-6 mb-4" key={idx}>
              <div className="card h-100 shadow-sm border-light">
                <div className="card-body">
                  <p><strong>Type:</strong> {receipt.type}</p>
                  <p><strong>Ref Name:</strong> {receipt.ref_name}</p>
                  <p><strong>Amount:</strong> ₹{receipt.amount}</p>
                  <p><strong>Submitted On:</strong> {new Date(receipt.submitted_on).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">No {selectedStatus} receipts found.</p>
      )}
    </div>
  );
}

export default Individual_profile;
