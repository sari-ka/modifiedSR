import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IndividualContext } from '../Context/LoginI_Context';
import 'bootstrap/dist/css/bootstrap.min.css';

function Add_receipt() {
  const [type, setType] = useState('trust');
  const [refName, setRefName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [trusts, setTrusts] = useState([]);
  const [villages, setVillages] = useState([]);
  const { currentIndividual } = useContext(IndividualContext);
  const navigate = useNavigate();

  console.log(currentIndividual)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trustRes, villageRes] = await Promise.all([
          axios.get('http://localhost:9125/trust-api/trust'),
          axios.get('http://localhost:9125/village-api/village'),
        ]);
        setTrusts(Array.isArray(trustRes.data.payload) ? trustRes.data.payload : []);
        setVillages(Array.isArray(villageRes.data.payload) ? villageRes.data.payload : []);
      } catch (err) {
        console.error('Error fetching trust/village data:', err);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    setReceipt(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!refName || !upiId || !amount || !receipt) {
      setMessage('Please fill in all fields and upload a receipt.');
      return;
    }

    if (!currentIndividual || !currentIndividual.email) {
      setMessage('User not logged in correctly.');
      console.error('Missing currentIndividual or email');
      return;
    }

    const isValidRef =
      type === 'trust'
        ? trusts.some(trust => trust.name.toLowerCase() === refName.toLowerCase())
        : villages.some(village => village.name.toLowerCase() === refName.toLowerCase());

    if (!isValidRef) {
      setMessage(`Invalid ${type} name. Please enter a valid one.`);
      return;
    }

    const formData = new FormData();
    formData.append('receipt', receipt);
    formData.append('email', currentIndividual.email); // ✅ correct field
    formData.append('type', type);
    formData.append('refName', refName);
    formData.append('upiId', upiId);
    formData.append('amount', amount);

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:9125/individual-api/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data.message || 'Receipt uploaded successfully!');
      setTimeout(() => {
        navigate('/'); // ✅ Redirect to home or dashboard as needed
      }, 2000);
    } catch (err) {
      console.error('Upload failed:', err.response?.data || err.message);
      setMessage(err.response?.data?.error || 'Error uploading receipt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Add Receipt</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="type" className="form-label">Payment Type</label>
          <select
            id="type"
            className="form-control"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setRefName('');
            }}
          >
            <option value="trust">Trust</option>
            <option value="village">Village</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="refName" className="form-label">
            {type === 'trust' ? 'Trust Name' : 'Village Name'}
          </label>
          <input
            type="text"
            id="refName"
            className="form-control"
            value={refName}
            onChange={(e) => setRefName(e.target.value)}
            placeholder={`Enter ${type === 'trust' ? 'Trust' : 'Village'} Name`}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="upiId" className="form-label">UPI ID</label>
          <input
            type="text"
            id="upiId"
            className="form-control"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="amount" className="form-label">Amount</label>
          <input
            type="number"
            id="amount"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="receipt" className="form-label">Receipt Image</label>
          <input
            type="file"
            id="receipt"
            className="form-control"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Uploading...' : 'Submit Receipt'}
        </button>
      </form>
    </div>
  );
}

export default Add_receipt;
