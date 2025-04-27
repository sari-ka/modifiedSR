import React, { useState,useContext,useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { villageContext } from '../Context/LoginV_Context'

function Login_vi() {
  const{register,handleSubmit,formState:{errors}}=useForm()
  const navigate = useNavigate()
  const {currentVillage,error,handleVillageVerify,loginStatus}=useContext(villageContext)

  //navigate to userProfile upon successful login
  useEffect(() => {
    if (loginStatus === true && currentVillage.length!==0) {
      navigate(`../profile/${currentVillage}`);
    }
  }, [loginStatus, currentVillage, navigate]);

  return (
    <div className='min-vh-100 d-flex align-items-center justify-content-center' style={{backgroundColor:"#E8F5E9"}}>
      
      <form className='col-6 col-md-5 col-lg-3 d-block mx-auto border border-light-subtle p-4 rounded-4 bg-white'  onSubmit={handleSubmit((data) => handleVillageVerify({ name: data.villagename, password: data.password }))}>
        {error?.length!==0 && <p className="text-danger">{error}</p> }
        <h2 className='text-center mb-4'></h2>
        <p className='lead text-center fw-bold'>Welcome!</p>
        <p className='text-center lead fs-6'>Log in  Support Roots to continue </p>
        
        <div className='mb-3'>
          <label htmlFor="" className='form-label '>Village Name</label>
          <input type="text" {...register("villagename",{required:true})} className='form-control '/>
         {errors.villagename?.type==='required' && <p className='fs-6 text-danger'>*Village Name is required</p>}
        </div>

  
        
        <div className='mb-3'>
          <label htmlFor="" className='form-label '>Password</label>
          <input type="password" {...register("password",{required:true})} className='form-control '/>
          {errors.password?.type==='required' && <p className='fs-6 text-danger'>*Password is required</p>}
          {errors.password?.type==='minLength' && <p className='fs-6 text-danger'>*Password must be at least 8 characters</p>}
          {errors.password?.type==='maxLength' && <p className='fs-6 text-danger'>*Password must not exceed 16 characters</p>}
          {errors.password && <p className='fs-6 text-danger'>{errors.password.message}</p>}
        </div>
        
        
        <div className='d-flex justify-content-center'>
        <button className="btn btn-primary my-3 p-2" type='submit' style={{backgroundColor:"#00897B",border:"none"}}>Login</button>
        </div>
        <Link to="/village/register" className="text-decoration-none ">Don't have an account? Register</Link>

      </form>
    </div>
  )
}


export default Login_vi