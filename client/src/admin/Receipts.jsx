import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const fetchReceipts = async () => {
    try {
      const res = await axios.get('http://localhost:9125/admin-api/admins/pending-receipts');
      setReceipts(res.data.payload || []);
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
    }
  };

  const updateStatus = async (individualEmail, receiptId, status) => {
    try {
      const res = await axios.patch(
        `http://localhost:9125/admin-api/admin/receipt/${individualEmail}/${receiptId}`,
        { status }
      );
      setMessage(res.data.message);
      setSelectedReceipt(null);
      setIsZoomed(false);

      window.location.reload(); // refresh to see updated list
    } catch (err) {
      console.error('Error updating status:', err);
      setMessage('Failed to update status');
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Pending Receipts</h2>

      {message && <div className="alert alert-info">{message}</div>}

      {receipts.length === 0 ? (
        <p>No pending receipts.</p>
      ) : (
        <div className="row">
          {receipts.map((item, index) => (
            <div className="col-md-6" key={index}>
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{item.ref_name}</h5>
                  <p><strong>Type:</strong> {item.type}</p>
                  <p><strong>Amount:</strong> ₹{item.amount}</p>
                  <p><strong>Submitted By:</strong> {item.individualName} ({item.individualEmail})</p>
                  <button
                    className="btn btn-primary mt-2 px-2 py-1"
                    onClick={() => {
                      setSelectedReceipt(item);
                      setIsZoomed(false);
                    }}
                  >
                    See Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReceipt && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          onClick={() => {
            setSelectedReceipt(null);
            setIsZoomed(false);
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Receipt Details</h5>
                <button
                  type="button"
                  className="btn-close btn px-2 py-1"
                  onClick={() => {
                    setSelectedReceipt(null);
                    setIsZoomed(false);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Type:</strong> {selectedReceipt.type}</p>
                <p><strong>Reference (Trust/Village Name):</strong> {selectedReceipt.ref_name}</p>
                <p><strong>Amount:</strong> ₹{selectedReceipt.amount}</p>
                <p><strong>UPI ID:</strong> {selectedReceipt.upi_id}</p>
                <p><strong>Submitted By:</strong> {selectedReceipt.individualName} ({selectedReceipt.individualEmail})</p>
                <p><strong>Submitted On:</strong> {new Date(selectedReceipt.submitted_on).toLocaleString()}</p>

                <img
                  src={`http://localhost:9125${selectedReceipt.receipt_img}`}
                  alt="Receipt"
                  className="img-fluid rounded shadow-sm mt-3"
                  style={{
                    cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                    transition: 'transform 0.3s ease',
                    transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
                    maxHeight: isZoomed ? '90vh' : '400px',
                    display: 'block',
                    margin: '0 auto'
                  }}
                  onClick={() => setIsZoomed(prev => !prev)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success px-2 py-1"
                  onClick={() =>
                    updateStatus(
                      selectedReceipt.individualEmail,
                      selectedReceipt.receiptId,
                      'approved'
                    )
                  }
                >
                  Approve
                </button>
                <button
                  className="btn btn-danger px-2 py-1"
                  onClick={() =>
                    updateStatus(
                      selectedReceipt.individualEmail,
                      selectedReceipt.receiptId,
                      'rejected'
                    )
                  }
                >
                  Reject
                </button>
                <button
                  className="btn btn-secondary px-2 py-1"
                  onClick={() => {
                    setSelectedReceipt(null);
                    setIsZoomed(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Receipts;
