import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Verified_tr() {
  const [trusts, setTrusts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerifiedTrusts = async () => {
      try {
        const res = await axios.get('http://localhost:9125/admin-api/admins/verified-trusts');
        if (Array.isArray(res.data.payload)) {
          setTrusts(res.data.payload);
        } else {
          setTrusts([]);
        }
      } catch (err) {
        console.error("Error fetching verified trusts:", err);
        setError("Failed to load trusts.");
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedTrusts();
  }, []);

  return (
    <div className="container mt-4">
      <div
        className="p-3 mb-4 rounded text-white"
        style={{ backgroundColor: '#28a745' }}
      >
        <h2 className="m-0">🏢 Verified Trusts</h2>
      </div>

      {loading && <p className="text-info">Loading trusts...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        trusts.length === 0 ? (
          <p className="text-warning">No verified trusts found.</p>
        ) : (
          <div className="table-responsive shadow-sm">
            <table className="table table-bordered table-hover">
              <thead style={{ backgroundColor: '#e6ffed' }}>
                <tr>
                  <th style={{ backgroundColor: '#d4edda' }}>Name</th>
                  <th style={{ backgroundColor: '#cce5ff' }}>Email</th>
                  <th style={{ backgroundColor: '#fff3cd' }}>Phone</th>
                  <th style={{ backgroundColor: '#f8d7da' }}>Address</th>
                  <th style={{ backgroundColor: '#f1f1f1' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {trusts.map((trust) => (
                  <tr key={trust._id}>
                    <td>{trust.name}</td>
                    <td>{trust.email}</td>
                    <td>{trust.contact}</td>
                    <td>{trust.address}</td>
                    <td>{trust.rating ?? 0}</td>
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

export default Verified_tr;
