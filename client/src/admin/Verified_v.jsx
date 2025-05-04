import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Verified_v() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerifiedVillages = async () => {
      try {
        const res = await axios.get('http://localhost:9125/admin-api/admins/verified-villages');
        console.log(res)
        if (Array.isArray(res.data.payload)) {
          setVillages(res.data.payload);
        } else {
          setVillages([]);
        }
      } catch (err) {
        console.error("Error fetching verified villages:", err);
        setError("Failed to load villages.");
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedVillages();
  }, []);

  return (
    <div className="container mt-4">
      <div
        className="p-3 mb-4 rounded text-white"
        style={{ backgroundColor: '#007bff' }}
      >
        <h2 className="m-0">🌾 Verified Villages</h2>
      </div>

      {loading && <p className="text-info">Loading villages...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        villages.length === 0 ? (
          <p className="text-warning">No verified villages found.</p>
        ) : (
          <div className="table-responsive shadow-sm">
            <table className="table table-bordered table-hover">
              <thead style={{ backgroundColor: '#f0f8ff' }}>
                <tr>
                  <th style={{ backgroundColor: '#dff0d8' }}>Name</th>
                  <th style={{ backgroundColor: '#d9edf7' }}>Email</th>
                  <th style={{ backgroundColor: '#fcf8e3' }}>State</th>
                  <th style={{ backgroundColor: '#f2dede' }}>Pincode</th>
                  <th style={{ backgroundColor: '#e2e3e5' }}>Contact</th>
                </tr>
              </thead>
              <tbody>
                {villages.map((village) => (
                  <tr key={village._id}>
                    <td>{village.name}</td>
                    <td>{village.email}</td>
                    <td>{village.state}</td>
                    <td>{village.pincode}</td>
                    <td>{village.contact}</td>
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

export default Verified_v;
