import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import './Village_i.css'; // Assuming you will add styles in this file

function Village_i() {
  const [villages, setVillages] = useState([]);
  const [error, setError] = useState('');
  const [selectedVillage, setSelectedVillage] = useState(null);

  // Fetch villages from the backend
  async function handleVillages() {
    setError('');
    try {
      const res = await axios.get('http://localhost:9125/village-api/village');
      console.log(res)
      if (res.data.message === 'Villages') {
        setVillages(res.data.payload);
        setError('');
      } else {
        setError(res.data.message || 'Unexpected response');
      }
    } catch (err) {
      setError('Error fetching villages');
      console.error(err);
    }
  }

  useEffect(() => {
    handleVillages();
  }, []);

  // Handle QR code generation for UPI payment
  const generateUPIQRCode = (village) => {
    const upiLink = `upi://pay?pa=${village.upiId}&pn=${village.name}&mc=${village.merchantCode}&tid=${village.transactionId}&tr=${village.transactionReference}&am=${village.amount}&cu=INR`;
    return upiLink;
  };

  // Modal for viewing detailed village information
  const handleVillageClick = (village) => {
    setSelectedVillage(village);
  };

  const closeModal = () => {
    setSelectedVillage(null);
  };

  return (
    <div className="village-container">
      {villages.map((village) => (
        <div className="village-card" key={village._id} onClick={() => handleVillageClick(village)}>
          <div className="village-summary">
            <h3 className="village-name">{village.name}</h3>
            <p><strong>State:</strong> {village.state || 'N/A'}</p>
            <p><strong>Contact:</strong> {village.contact || 'N/A'}</p>
            <p><strong>Email:</strong> {village.email || 'N/A'}</p>
            {/* <div className="upi-container">
              <QRCodeCanvas value={generateUPIQRCode(village)} size={100} />
              <p>Scan for UPI Payment</p>
            </div> */}
          </div>
        </div>
      ))}

      {selectedVillage && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>✖</button>
            <h2>{selectedVillage.name}</h2>
            <p><strong>State:</strong> {selectedVillage.state || 'N/A'}</p>
            <p><strong>Contact:</strong> {selectedVillage.contact || 'N/A'}</p>
            <p><strong>Email:</strong> {selectedVillage.email || 'N/A'}</p>
            <div className="upi-container">
              <QRCodeCanvas value={generateUPIQRCode(selectedVillage)} size={120} />
              <p>Scan for UPI Payment</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Village_i;
