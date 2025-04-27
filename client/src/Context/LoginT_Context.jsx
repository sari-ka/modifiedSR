import { createContext,useState } from "react"
import axios from "axios"
export const TrustContext = createContext()
function LoginT_Context({children}) {
    let [currentTrust,setCurrentTrust]=useState("")
    let [error,setError]=useState('')
    let [loginStatus,setLoginStatus]=useState(false)
    async function handleTrustVerify({trustname,password}){
        setError("")
        let res= await axios.get(`http://localhost:9125/trust-api/trust/${trustname}`)
        if (res.data.payload) {
            let TrustDetails = res.data.payload[0];
            if (TrustDetails.password !== password) {
                setError("Invalid Password");
            } else {
                setError("");
                setCurrentTrust(TrustDetails.name);
                localStorage.setItem("currentTrust", TrustDetails.name); 
                setLoginStatus(true);
            }
        } else {
            setError(res.data.message || "Village not found");
        }
    }
    // console.log(currentVillage)

    function userLogout(){
        setCurrentTrust('');
        setLoginStatus(false);
        setError('')
        localStorage.removeItem(currentTrust);
    }
  
  return (
    <div>
      <TrustContext.Provider value={{currentTrust,error,setCurrentTrust,handleTrustVerify,userLogout,loginStatus}}>
        {children}
      </TrustContext.Provider>
    </div>
  )
}

export default LoginT_Context
