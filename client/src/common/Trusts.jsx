import {useState,useEffect} from 'react'
import axios from 'axios'

function Trusts() {
  let [trusts,settrusts]=useState([])
    let [error,seterror]=useState([])
    async function handleTrusts() {
        let res= await axios.get('http://localhost:9125/trust-api/trust')
        if(res.data.message==='trust'){
          settrusts( res.data.payload)
          seterror('')
        }
        else
          seterror(res.data.message)
      }
    
      
      useEffect(()=>{
        handleTrusts()
      },[])

      console.log(trusts)

  return (
    <div>
      {
        trusts.map((i)=>(
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

export default Trusts
