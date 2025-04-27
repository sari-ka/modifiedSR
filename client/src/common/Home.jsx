import React from "react";
import ind from "../individual/individual.webp";
import tru from "../trust/trust.webp";
import vil from "../village/village.webp";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";

function Home() {
  return (
    <div className="container">
      <div className="d-flex justify-content-around align-items-center n">
        {/* Village */}
        <div className="text-center">
          <Link to="/village">
            <button className="btn">
              <img
                src={vil}
                className="rounded-circle img-fluid option-img"
                alt="Village"
              />
            </button>
          </Link>
          <p className="display-6 mt-3">Village</p>
        </div>

        {/* Trust */}
        <div className="text-center mx-4">
          <Link to="/trust">
            <button className="btn">
              <img
                src={tru}
                className="rounded-circle img-fluid option-img"
                alt="Trust"
              />
            </button>
          </Link>
          <p className="display-6 mt-3">Trust</p>
        </div>

        {/* Individual */}
        <div className="text-center">
          <Link to="/individual">
            <button className="btn">
              <img
                src={ind}
                className="rounded-circle img-fluid option-img"
                alt="Individual"
              />
            </button>
          </Link>
          <p className="display-6 mt-3">Individual</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
