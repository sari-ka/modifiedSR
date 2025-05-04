import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Unver_v() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUnverifiedVillages = async () => {
      try {
        const res = await axios.get('http://localhost:9125/admin-api/admins/unverified-villages');
        setVillages(res.data.payload);
      } catch (err) {
        setError("Error loading unverified villages.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnverifiedVillages();
  }, []);

  const handleApproveVillage = async (villageId) => {
    try {
      const res = await axios.patch(`http://localhost:9125/admin-api/admin/approve-village/${villageId}`);
      alert(res.data.message);
      setVillages(villages.map(village => 
        village._id === villageId ? { ...village, approved: true } : village
      ));
    } catch (err) {
      alert("Failed to approve village.");
    }
  };

  return (
    <div className="container mt-4">
      <div
        className="p-3 mb-4 rounded text-white"
        style={{ backgroundColor: '#007bff' }}
      >
        <h2 className="m-0">🌾 Unverified Villages</h2>
      </div>

      {loading && <p className="text-info">Loading villages...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        villages.length === 0 ? (
          <p className="text-warning">No unverified villages found.</p>
        ) : (
          <div className="table-responsive shadow-sm">
            <table className="table table-bordered table-hover">
              <thead style={{ backgroundColor: '#f0f8ff' }}>
                <tr>
                  <th style={{ backgroundColor: '#dff0d8' }}>Name</th>
                  <th style={{ backgroundColor: '#d9edf7' }}>Contact</th>
                  <th style={{ backgroundColor: '#fcf8e3' }}>State</th>
                  <th style={{ backgroundColor: '#f2dede' }}>Pincode</th>
                  <th style={{ backgroundColor: '#e2e3e5' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {villages.map((village) => (
                  <tr key={village._id}>
                    <td>{village.name}</td>
                    <td>{village.contact}</td>
                    <td>{village.state}</td>
                    <td>{village.pincode}</td>
                    <td>
                      {!village.approved ? (
                        <button 
                          className="btn btn-success btn-sm px-2 py-1"
                          onClick={() => handleApproveVillage(village._id)}
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-success">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

export default Unver_v;
