import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null); // for modal

  const fetchReceipts = async () => {
    try {
      const res = await axios.get('http://localhost:9125/admin-api/admins/pending-receipts');
      setReceipts(res.data.payload || []);
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
    }
  };

  const updateStatus = async (email, receiptId, status) => {
    try {
      const res = await axios.patch(`http://localhost:9125/admin-api/admin/receipt/${email}/${receiptId}`, {
        status,
      });
      setMessage(res.data.message);
      setSelectedReceipt(null); // close modal
      fetchReceipts(); // Refresh list
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
          {receipts.map((item, index) => {
            const receipt = item.receipt;
            return (
              <div className="col-md-6" key={index}>
                <div className="card mb-4 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{receipt.ref_name}</h5>
                    <p><strong>Type:</strong> {receipt.type}</p>
                    <p><strong>Amount:</strong> ₹{receipt.amount}</p>
                    <p><strong>Submitted By:</strong> {item.individual_name} ({item.individual_email})</p>
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => setSelectedReceipt({ ...item, receiptId: receipt._id })}
                    >
                      See Receipt
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedReceipt && (
        <div className="modal show fade d-block" tabIndex="-1" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Receipt Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedReceipt(null)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Type:</strong> {selectedReceipt.receipt.type}</p>
                <p><strong>Reference:</strong> {selectedReceipt.receipt.ref_name}</p>
                <p><strong>Amount:</strong> ₹{selectedReceipt.receipt.amount}</p>
                <p><strong>UPI ID:</strong> {selectedReceipt.receipt.upi_id}</p>
                <p><strong>Submitted By:</strong> {selectedReceipt.individual_name} ({selectedReceipt.individual_email})</p>
                <p><strong>Submitted On:</strong> {new Date(selectedReceipt.receipt.submitted_on).toLocaleString()}</p>
                <img
                  src={`http://localhost:9125${selectedReceipt.receipt.receipt_img}`}
                  alt="Receipt"
                  className="img-fluid rounded shadow-sm mt-3"
                  style={{ maxHeight: '400px' }}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() =>
                    updateStatus(selectedReceipt.individual_email, selectedReceipt.receipt._id, 'approved')
                  }
                >
                  Approve
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    updateStatus(selectedReceipt.individual_email, selectedReceipt.receipt._id, 'rejected')
                  }
                >
                  Reject
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedReceipt(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Receipts;
