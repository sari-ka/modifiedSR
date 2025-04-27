import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useContext } from "react";
import { villageContext } from "../Context/LoginV_Context";
import { useForm } from "react-hook-form";
import axios from "axios";

function Add_prob() {
  const { currentVillage} = useContext(villageContext);
  const { register, handleSubmit, reset } = useForm();

  const handleSubmitProblem = async (data) => {
    const { title, description, estimatedamt } = data;
    
    try {
      const payload = {
        title,
        description,
        estimatedamt: Number(estimatedamt) // Ensure it's a number
      };

      const res = await axios.put(
        `http://localhost:9125/village-api/${currentVillage}/add-problem`, payload
      );
      
      console.log("Problem added successfully:", res.data);
      reset(); // Reset form after successful submission
    } catch (err) {
      console.error("Failed to add problem:", err);
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="text-primary mb-4">Village Problem Reporting Form</h3>
      <form onSubmit={handleSubmit(handleSubmitProblem)} className="shadow p-4 rounded bg-light">
        <div className="mb-3">
          <label className="form-label">Short Title</label>
          <input
            type="text"
            {...register("title", { required: true })}
            placeholder="e.g. Broken Road"
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Detailed Description</label>
          <textarea
            className="form-control"
            {...register("description", { required: true })}
            rows="3"
            placeholder="Describe the problem in detail..."
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Estimated Amount (₹)</label>
          <input
            type="number"
            {...register("estimatedamt", { required: true })}
            className="form-control"
            placeholder="e.g. 5000"
          />
        </div>

        <button type="submit" className="btn btn-success mt-3">
          Submit Problem
        </button>
      </form>
    </div>
  );
}

export default Add_prob;