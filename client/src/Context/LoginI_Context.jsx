import { createContext, useState } from "react";
import axios from "axios";

export const IndividualContext = createContext();

function LoginI_Context({ children }) {
  const [currentIndividual, setCurrentIndividual] = useState("");
  const [error, setError] = useState("");
  const [loginStatus, setLoginStatus] = useState(false);

  async function handleIndividualVerify({ email, password }) {
    setError("");

    try {
      const res = await axios.get(`http://localhost:9125/individual-api/individual/${email}`);
      const IndividualDetails = Array.isArray(res.data.payload) ? res.data.payload[0] : res.data.payload;

      if (!IndividualDetails) {
        setError(res.data.message || "Individual not found");
        return;
      }

      if (IndividualDetails.password !== password) {
        setError("Invalid Password");
        return;
      }

      // Success
      setCurrentIndividual(IndividualDetails.name);
      localStorage.setItem("currentIndividual", IndividualDetails.name);
      setLoginStatus(true);
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    }
  }

  function userLogout() {
    setCurrentIndividual("");
    setLoginStatus(false);
    setError("");
    localStorage.removeItem("currentIndividual");
  }

  return (
    <IndividualContext.Provider
      value={{
        currentIndividual,
        error,
        setCurrentIndividual,
        handleIndividualVerify,
        userLogout,
        loginStatus,
      }}
    >
      {children}
    </IndividualContext.Provider>
  );
}

export default LoginI_Context;
