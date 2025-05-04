import { createContext,useState } from "react"
import axios from "axios"
export const villageContext = createContext()
function LoginV_Context({children}) {
    let [currentVillage,setCurrentVillage]=useState("")
    let [error,setError]=useState('')
    let [loginStatus,setLoginStatus]=useState(false)
    async function handleVillageVerify({name,password}){
        setError("")
        let res= await axios.get(`http://localhost:9125/village-api/village/${name}`)
        if (res.data.payload) {
            let VillageDetails = res.data.payload;
            console.log(res.data)
            if (!VillageDetails.approved) {
              setError("Village not approved by admin yet.");
              return;
            }
            if (VillageDetails?.password !== password) {
                setError("Invalid Password");
            } else {
                setError("");
                setCurrentVillage(VillageDetails.name);
                localStorage.setItem("currentVillage", VillageDetails.name); 
                setLoginStatus(true);
            }
        } else {
            setError(res.data.message || "Village not found");
        }
    }
    // console.log(currentVillage)

    function userLogout(){
        setCurrentVillage('');
        setLoginStatus(false);
        setError('')
        localStorage.removeItem(currentVillage);
    }
  
  return (
    <div>
      <villageContext.Provider value={{currentVillage,error,setCurrentVillage,handleVillageVerify,userLogout,loginStatus}}>
        {children}
      </villageContext.Provider>
    </div>
  )
}

export default LoginV_Context
