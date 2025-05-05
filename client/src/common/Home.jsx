import React from "react";
import ind from "../individual/individual.webp";
import tru from "../trust/trust.webp";
import vil from "../village/village.webp";
import admin from "../admin/images.jpeg"
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";

function Home() {
  return (
    <div className="container py-5">
      {/* Heading */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">Welcome to SupportRoots</h1>
        <p className="lead text-secondary">Select your role</p>
      </div>

      {/* Background Card */}
      <div className="p-4 bg-white rounded-4 shadow-lg" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="row g-4 justify-content-center">
          {/* Village */}
          <div className="col-md-6 col-lg-6 text-center">
            <Link to="/village" className="text-decoration-none">
              <div className="card bg-light border-0 shadow-sm hover-card">
                <div className="card-body">
                  <img
                    src={vil}
                    className="rounded-circle img-fluid mb-3"
                    alt="Village"
                    style={{ maxWidth: "150px" }}
                  />
                  <h5 className="text-dark">Village</h5>
                </div>
              </div>
            </Link>
          </div>

          {/* Trust */}
          <div className="col-md-6 col-lg-6 text-center">
            <Link to="/trust" className="text-decoration-none">
              <div className="card bg-light border-0 shadow-sm hover-card">
                <div className="card-body">
                  <img
                    src={tru}
                    className="rounded-circle img-fluid mb-3"
                    alt="Trust"
                    style={{ maxWidth: "150px" }}
                  />
                  <h5 className="text-dark">Trust</h5>
                </div>
              </div>
            </Link>
          </div>

          {/* Individual */}
          <div className="col-md-6 col-lg-6 text-center">
            <Link to="/individual" className="text-decoration-none">
              <div className="card bg-light border-0 shadow-sm hover-card">
                <div className="card-body">
                  <img
                    src={admin}
                    className="rounded-circle img-fluid mb-3"
                    alt="Individual"
                    style={{ maxWidth: "150px" }}
                  />
                  <h5 className="text-dark">Individual</h5>
                </div>
              </div>
            </Link>
          </div>

          {/* Admin */}
          <div className="col-md-6 col-lg-6 text-center">
            <Link to="/admin" className="text-decoration-none">
              <div className="card bg-light border-0 shadow-sm hover-card">
                <div className="card-body">
                  <img
                    src={ind}
                    className="rounded-circle img-fluid mb-3"
                    alt="Admin"
                    style={{ maxWidth: "150px", maxHeight: "150px" }}
                  />
                  <h5 className="text-dark">Admin</h5>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
