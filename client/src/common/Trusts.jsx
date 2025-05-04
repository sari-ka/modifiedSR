import { useState, useEffect } from 'react';
import axios from 'axios';
import './Trust.css';

function Trusts() {
  const [trusts, setTrusts] = useState([]);
  const [error, setError] = useState('');
  const [selectedTrust, setSelectedTrust] = useState(null);

  async function handleTrusts() {
    setError('');
    // console.log(error.length);
    try {
      // console.log("helooooo")
      const res = await axios.get('http://localhost:9125/trust-api/trust');
      // console.log(res)
      if (res.data.message === 'trust') {
        const trustList = res.data.payload;
        // console.log(res.data.payload)
        const trustListWithSpent = await Promise.all(
          trustList.map(async (trust) => {
            const totalSpent = await getTotalSpentByTrust(trust.name);
            return { ...trust, totalSpent };
          })
        );
        // console.log("hiiiiiiiii")
        // console.log(trustListWithSpent);
        setTrusts(trustListWithSpent);
        setError('');
        console.log(trustListWithSpent);
      } else {
        setError(res.data.message || 'Unexpected response');
      }
    } catch (err) {
      setError('Error fetching trusts');
      console.error(err);
    }
  }

  useEffect(() => {
    setError('');
    // console.log(error.length);
    handleTrusts();
  }, []);

  const openGoogleMaps = (trust) => {
    const trustName = trust.name || 'Sample Trust';
    const address = trust.address || 'Hyderabad, Telangana';
    const query = encodeURIComponent(`${trustName}, ${address}`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(mapsUrl, '_blank');
  };

  const getTotalSpentByTrust = async (trustName) => {
    try {
      const response = await axios.get(`http://localhost:9125/trust-api/trust/${trustName}/total-spent`);
      return response.data.totalSpent || 0;
    } catch (err) {
      console.error('Error fetching total spent:', err.response ? err.response.data : err.message);
      return 0;
    }
  };

  const handleTrustClick = (trust) => {
    setSelectedTrust(trust);
  };

  const closeModal = () => {
    setSelectedTrust(null);
  };
  // console.log(trusts)
  return (
    <div className="trust-container">
      {trusts.map((trust) => (
        <div className="trust-card" key={trust.email} onClick={() => handleTrustClick(trust)}>
          <div className="trust-summary">
            <h2>{trust.name || 'Unnamed Trust'}</h2>
            <p><strong>Address:</strong> {trust.address || 'N/A'}</p>
            <p><strong>Contact:</strong> {trust.contact || 'N/A'}</p>
            <p><strong>Rating:</strong> ⭐ {trust.rating ?? 'Not Rated'}</p>
            <p><strong>Total Spent on Villages:</strong> ₹{trust.totalSpent?.toLocaleString() ?? '0'}</p>
            <button className="map-button w-50" onClick={() => openGoogleMaps(trust)}>
              Open in Google Maps
            </button>
          </div>
        </div>
      ))}

      {selectedTrust && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>✖</button>
            <h2>{selectedTrust.name || 'Unnamed Trust'}</h2>
            <p><strong>Email:</strong> {selectedTrust.email || 'N/A'}</p>
            <p><strong>Address:</strong> {selectedTrust.address || 'N/A'}</p>
            <p><strong>Contact:</strong> {selectedTrust.contact || 'N/A'}</p>
            <p><strong>Rating:</strong> ⭐ {selectedTrust.rating ?? 'Not Rated'}</p>
            <p><strong>Total Received:</strong> ₹{selectedTrust.funding?.total_received?.toLocaleString() ?? '0'}</p>
            <p><strong>Total Disbursed:</strong> ₹{selectedTrust.funding?.total_disbursed?.toLocaleString() ?? '0'}</p>
            <p><strong>Total Spent on Villages:</strong> ₹{selectedTrust.totalSpent?.toLocaleString() ?? '0'}</p>
            <button className="map-button w-50" onClick={() => openGoogleMaps(selectedTrust)}>
              Open in Google Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Trusts;
