import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css'; // Custom CSS for styling

function Users() {
  const [users, setUsers] = useState([]);
  const [totalFundedAmounts, setTotalFundedAmounts] = useState({});
  const [error, setError] = useState('');

  // Fetch list of individuals
  async function handleUsers() {
    try {
      const res = await axios.get('http://localhost:9125/individual-api/individual');
      if (res.data.message === 'Individuals') {
        setUsers(res.data.payload);
        setError('');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch individuals');
    }
  }

  // Fetch total funded amount for each individual
  async function handleTotalFundedAmounts() {
    try {
      const res = await axios.get('http://localhost:9125/individual-api/individual-total-funding');
      if (res.data.message === 'Total funded amounts for individuals') {
        const amounts = res.data.payload.reduce((acc, curr) => {
          acc[curr.email] = curr.totalFundedAmount;
          return acc;
        }, {});
        setTotalFundedAmounts(amounts);
        setError('');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error('Error fetching total funded amounts:', err);
      setError('Failed to fetch total funded amounts');
    }
  }

  useEffect(() => {
    handleUsers();
    handleTotalFundedAmounts();
  }, []);

  return (
    <div className="users-container">
      {error && <div className="alert alert-danger">{error}</div>}
      {users.length === 0 ? (
        <div className="alert alert-info">No individuals found.</div>
      ) : (
        <div className="row">
          {users.map((user) => (
            <div className="col-md-4 col-lg-3 mb-4" key={user.email}>
              <div className="card user-card">
                <div className="card-body">
                  <h5 className="card-title text-center">{user.name}</h5>
                  <p className="card-text text-muted text-center">{user.email}</p>
                  <div className="funded-amount">
                    <strong>Total Funded Amount:</strong>
                    <p className="amount">
                      ₹{totalFundedAmounts[user.email] || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Users;
