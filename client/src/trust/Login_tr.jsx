import {useEffect, useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate,Link } from 'react-router-dom'
import { TrustContext } from '../Context/LoginT_Context'
function Login_tr() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const {currentTrust,error,setCurrentTrust,handleTrustVerify,userLogout,loginStatus} =useContext(TrustContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (loginStatus === true && currentTrust.length!==0) {
      navigate(`../profile/${currentTrust}`);
    }
  }, [loginStatus, currentTrust, navigate]);

  return (
    <div className='min-vh-100 d-flex align-items-center justify-content-center' style={{ backgroundColor: "#E8F5E9" }}>
      <form className='col-6 col-md-5 col-lg-3 d-block mx-auto border border-light-subtle p-4 rounded-4 bg-white' onSubmit={handleSubmit(handleTrustVerify)}>
        <h2 className='text-center mb-4'></h2>
        {error?.length!==0 && <p className="text-danger">{error}</p> }
        <p className='lead text-center fw-bold'>Welcome!</p>
        <p className='text-center lead fs-6'>Log in Support Roots to continue </p>

        <div className='mb-3'>
          <label className='form-label'>Trust Name</label>
          <input type="text" {...register("trustname", { required: true })} className='form-control' />
          {errors.trustname && <p className='fs-6 text-danger'>*Trust name is required</p>}
        </div>

        <div className='mb-3'>
          <label className='form-label'>Password</label>
          <input type="password" {...register("password", {
            required: true
          })} className='form-control' />
          {errors.password?.type === 'required' && <p className='fs-6 text-danger'>*Password is required</p>}
          {errors.password?.message && <p className='fs-6 text-danger'>{errors.password.message}</p>}
        </div>

        <div className='d-flex justify-content-center'>
          <button type="submit" className="btn btn-primary my-3 p-2" style={{ backgroundColor: "#00897B", border: "none" }}>
            Login
          </button>
        </div>
        <Link to="/trust/register" className="text-decoration-none ">Don't have an account? Register</Link>
      </form>
    </div>
  )
}

export default Login_tr