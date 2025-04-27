import React from 'react'
import { Outlet } from 'react-router-dom'
function RootTrust() {
  return (
    <div style={{minHeight:'100vh'}}>
      <Outlet></Outlet>
    </div>
  )
}

export default RootTrust
