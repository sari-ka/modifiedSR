import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Unver_tr() {
  const [trusts, setTrusts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUnverifiedTrusts = async () => {
      try {
        const res = await axios.get('http://localhost:9125/admin-api/admins/unverified-trusts');
        setTrusts(res.data.payload);
      } catch (err) {
        setError("Error loading unverified trusts.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnverifiedTrusts();
  }, []);

  const handleApproveTrust = async (trustId) => {
    try {
      const res = await axios.patch(`http://localhost:9125/admin-api/admin/approve-trust/${trustId}`);
      alert(res.data.message);
      setTrusts(trusts.map(trust => 
        trust._id === trustId ? { ...trust, approved: true } : trust
      ));
    } catch (err) {
      alert("Failed to approve trust.");
    }
  };

  return (
    <div className="container mt-4">
      <div
        className="p-3 mb-4 rounded text-white"
        style={{ backgroundColor: '#28a745' }}
      >
        <h2 className="m-0">🤝 Unverified Trusts</h2>
      </div>

      {loading && <p className="text-info">Loading trusts...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        trusts.length === 0 ? (
          <p className="text-warning">No unverified trusts found.</p>
        ) : (
          <div className="table-responsive shadow-sm">
            <table className="table table-bordered table-hover">
              <thead style={{ backgroundColor: '#f0f8ff' }}>
                <tr>
                  <th style={{ backgroundColor: '#dff0d8' }}>Name</th>
                  <th style={{ backgroundColor: '#d9edf7' }}>Email</th>
                  <th style={{ backgroundColor: '#fcf8e3' }}>Phone</th>
                  <th style={{ backgroundColor: '#f2dede' }}>Address</th>
                  <th style={{ backgroundColor: '#e2e3e5' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {trusts.map((trust) => (
                  <tr key={trust._id}>
                    <td>{trust.name}</td>
                    <td>{trust.email}</td>
                    <td>{trust.contact}</td>
                    <td>{trust.address}</td>
                    <td>
                      {!trust.approved ? (
                        <button 
                          className="btn btn-success btn-sm px-2 py-1"
                          onClick={() => handleApproveTrust(trust._id)}
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

export default Unver_tr;
