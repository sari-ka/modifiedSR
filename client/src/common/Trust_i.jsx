import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import './Trust.css';

function Trust_i() {
  const [trusts, setTrusts] = useState([]);
  const [error, setError] = useState('');
  const [selectedTrust, setSelectedTrust] = useState(null);

  async function handleTrusts() {
    setError('');
    try {
      const res = await axios.get('http://localhost:9125/trust-api/trust');
      if (res.data.message === 'trust') {
        const trustList = res.data.payload;
        const trustListWithSpent = await Promise.all(
          trustList.map(async (trust) => {
            const totalSpent = await getTotalSpentByTrust(trust.name);
            return { ...trust, totalSpent };
          })
        );
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
    handleTrusts();
  }, []);

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

  const generateUPIQRCode = (trust) => {
    if (!trust.upi_id || !trust.acc_name) return '';
    return `upi://pay?pa=${trust.upi_id}&pn=${encodeURIComponent(trust.acc_name)}&cu=INR`;
  };
  

  return (
    <div className="trust-container">
      {trusts.map((trust) => {
        const trustName = trust.name || 'Sample Trust';
        const upiID = trust.upiID || 'sampleupi@upi'; // Replace with actual UPI ID if available

        // UPI payment URL format (this is just an example, replace `sampleupi@upi` with actual UPI ID)
        const upiPaymentUrl = `upi://pay?pa=${upiID}&pn=${trustName}&mc=0000&tid=0000000000&tr=000000&tn=Donation&am=${trust.totalSpent || 0}&cu=INR`;

        return (
          <div className="trust-card" key={trust.email} onClick={() => handleTrustClick(trust)}>
            <div className="trust-summary">
              <h2>{trustName}</h2>
              <p><strong>Address:</strong> {trust.address || 'N/A'}</p>
              <p><strong>Contact:</strong> {trust.contact || 'N/A'}</p>
              <p><strong>Rating:</strong> ⭐ {trust.rating ?? 'Not Rated'}</p>
              <p><strong>Total Spent on Villages:</strong> ₹{trust.totalSpent?.toLocaleString() ?? '0'}</p>
              <button className="map-button w-50">
                Make a Donation
              </button>
            </div>
          </div>
        );
      })}

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

            <div style={{ margin: '10px 0' }}>
            {selectedTrust.upi_id && selectedTrust.acc_name ? (
              <div style={{ margin: '10px 0' }}>
                <QRCodeCanvas value={generateUPIQRCode(selectedTrust)} size={150} />
                <p style={{ fontSize: '0.8rem' }}>Scan for UPI Payment</p>
              </div>
            ) : (
              <p style={{ color: 'gray' }}>UPI payment details not available</p>
            )}
              <p style={{ fontSize: '0.8rem' }}>Scan for UPI Payment</p>
            </div>

            <button className="map-button w-50">
              Make a Donation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Trust_i;
