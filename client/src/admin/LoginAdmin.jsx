import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom'; // to navigate
import axios from 'axios';

function LoginAdmin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // GET admin details by email
      const response = await axios.get(`http://localhost:9125/admin-api/admin/${data.email}`); // adjust backend URL if needed
      const admin = response.data.payload;
      if (admin.password === data.password) {
        console.log('Login successful!');
        navigate('../unverified-trusts'); 
      } else {
        alert('Invalid password');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert('Admin not found');
      } else {
        alert('Error logging in');
      }
      console.error(error);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: 'rgba(144, 238, 144, 0.2)' }}
    >
      <div className="p-4 rounded shadow" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white' }}>
        <h2 className="text-center mb-4">Admin Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label>Email:</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="form-control"
            />
            {errors.email && <small className="text-danger">{errors.email.message}</small>}
          </div>

          <div className="mb-3">
            <label>Password:</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="form-control"
            />
            {errors.password && <small className="text-danger">{errors.password.message}</small>}
          </div>

          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginAdmin;
