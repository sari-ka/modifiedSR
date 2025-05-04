import React from 'react'
import { Outlet } from 'react-router-dom'
function RootAdmin() {
  return (
        <div style={{minHeight:'100vh'}}>
          <Outlet></Outlet>
        </div>
  )
}

export default RootAdmin
