import { createContext, useState } from "react";
import axios from "axios";

export const TrustContext = createContext();

function LoginT_Context({ children }) {
  const [currentTrust, setCurrentTrust] = useState("");
  const [error, setError] = useState("");
  const [loginStatus, setLoginStatus] = useState(false);

  async function handleTrustVerify({ trustname, password }) {
    setError("");

    try {
      const res = await axios.get(`http://localhost:9125/trust-api/trust/${trustname}`);
      const TrustDetails = Array.isArray(res.data.payload) ? res.data.payload[0] : res.data.payload;

      if (!TrustDetails) {
        setError(res.data.message || "Trust not found");
        return;
      }

      if (!TrustDetails.approved) {
        setError("Trust not approved by admin yet.");
        return;
      }

      if (TrustDetails.password !== password) {
        setError("Invalid Password");
        return;
      }

      // Success
      setCurrentTrust(TrustDetails.name);
      localStorage.setItem("currentTrust", TrustDetails.name);
      setLoginStatus(true);
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    }
  }

  function userLogout() {
    setCurrentTrust("");
    setLoginStatus(false);
    setError("");
    localStorage.removeItem("currentTrust");
  }

  return (
    <TrustContext.Provider
      value={{
        currentTrust,
        error,
        setCurrentTrust,
        handleTrustVerify,
        userLogout,
        loginStatus,
      }}
    >
      {children}
    </TrustContext.Provider>
  );
}

export default LoginT_Context;
