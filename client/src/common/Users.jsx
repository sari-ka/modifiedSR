import {useState,useEffect} from 'react'
import axios from 'axios'
function Users() {
  let [users,setusers]=useState([])
    let [error,seterror]=useState([])
    async function handleusers() {
        let res= await axios.get('http://localhost:9125/individual-api/individual')
        if(res.data.message==='Individuals'){
          setusers( res.data.payload)
          seterror('')
        }
        else
          seterror(res.data.message)
      }
    
      
      useEffect(()=>{
        handleusers()
      },[])

  return (
    <div>
      {
        users.map((i)=>(
          <div className='card' key={i.email}>
            <div className="card-body">
              <p>{i.name}</p>
              <p>{i.email}</p>
          </div>
      </div>
        ))
      }
    </div>
  )
}

export default Users
