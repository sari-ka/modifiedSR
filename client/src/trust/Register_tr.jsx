import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate,Link } from 'react-router-dom';
// import './Registerr.css'; 
import axios from 'axios'
function Register_tr() {
  const{register,handleSubmit,formState:{errors}}=useForm()
  let[registerDetails,setRegisterDetails] = useState({})
  let[error,seterror]=useState('')
  const navigate =useNavigate()
  async function handleRegister(obj) {
    setRegisterDetails(obj);

    try {
        let res = await axios.post('http://localhost:9125/trust-api/trust', obj);
        console.log(res);

        if (res.status === 201) {
            navigate('/trust');
            seterror('')
        } else {
            seterror(res.data.message); // This is fine, but won't work if there's no `res`
        }
    } catch (error) {
        if (error.response) {
            seterror(error.response.data.message || "Something went wrong!");
        } else {
            seterror("Server not responding. Please try again later.");
        }
    }
}

  // console.log(registerDetails)
  return (
    <div className='min-vh-100 d-flex align-items-center justify-content-center' style={{backgroundColor:"#E8F5E9"}}>
      
      <form action="" className='w-50 d-block mx-auto border border-light-subtle p-3 px-4 rounded-4 bg-white' onSubmit={handleSubmit(handleRegister)}>
      <h2 className='text-center mb-4'></h2>
        <p className='lead text-center fw-bold fs-1'>Welcome!</p>
        <p className='text-center lead fs-6'>Sign Up to Support Roots continue </p>
        {error?.length!==0 && <p className="text-danger">{error}</p> }
        <div className='row'>
        <div className="col-md-6">
        <div className='mb-3'>
          <label htmlFor="" className='form-label '>Username</label>
          <input type="text" {...register("username",{required:true})} className='form-control '/>
         {errors.username?.type==='required' && <p className='fs-6 text-danger'>*Username is required</p>}
        </div>

        <div className='mb-3'>
          <label htmlFor="" className='form-label '>Phone Number</label>
          <input type="text" {...register("contact",{required:true,minLength:10,maxLength:10,pattern:{value:/^[0-9]{10}$/,message:'Enter valid phone number'}})} className='form-control '/>
          {errors.phonenumber?.type==='required' && <p className='fs-6 text-danger'>*Phone number is required</p>}
          {errors.phonenumber?.type==='minLength' && <p className='fs-6 text-danger'>&Phone number must have 10 digits</p>}
          {errors.phonenumber?.type==='maxLength' && <p className='fs-6 text-danger'>&Phone number must have 10 digits</p>}
          {errors.phonenumber && <p>*{errors.phonenumber.message}</p>}
        </div>

        <div className='mb-3'>
          <label htmlFor="" className='form-label '>Address</label>
          <input type="text" {...register("address",{required:true})} className='form-control '/>
          {errors.address?.type==='required' && <p className='fs-6 text-danger'>*Address is required</p>}
        </div>
        </div>
        <div className="col-md-6">
      
        <div className='mb-3'>
          <label htmlFor="" className='form-label '>Email</label>
          <input type="text" {...register("email",{required:true,pattern:{
             value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
             message: "Enter a valid email address"
          }})}className='form-control '/>
          {errors.email?.type==='required' && <p className='fs-6 text-danger'>*Email is required</p>}
          {errors.email && <p className='fs-6 text-danger'>*{errors.email.message}</p>}
        </div>
        <div className='mb-3'>
          <label htmlFor="" className='form-label '>Trust Name</label>
          <input type="text" {...register("name",{required:true})} className='form-control '/>
          {errors.trustname?.type==='required' && <p className='fs-6 text-danger'>*Trust name is required</p>}
        </div>
        <div className='mb-3'>
          <label htmlFor="" className='form-label '>Password</label>
          <input type="password" {...register("password",{required:true,pattern:{
            value:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$%&!])[A-Za-z\d@$%&!]{8,16}$/,
            message: "Password must include uppercase, lowercase, number, and special character"
          }})} className='form-control '/>
          {errors.password?.type==='required' && <p className='fs-6 text-danger'>*Password is required</p>}
          {errors.password?.type==='minLength' && <p className='fs-6 text-danger'>*Password must be at least 8 characters</p>}
          {errors.password?.type==='maxLength' && <p className='fs-6 text-danger'>*Password must not exceed 16 characters</p>}
          {errors.password && <p className='fs-6 text-danger'>*{errors.password.message}</p>}
        </div>
        </div>
        </div>
        <div className='d-flex justify-content-center'>
        <button className="btn btn-primary mt-3 p-2" style={{backgroundColor:"#00897B",border:"none"}}>Register Here</button>
        </div>
        <div className="text-center mt-3">
  <Link to="/trust" className="text-decoration-none">Already have an account? Log in</Link>
</div>

      </form>
    </div>
  )
}

export default Register_tr