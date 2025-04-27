import { Outlet,Link } from 'react-router-dom'
import { TrustContext } from "../Context/LoginT_Context";
import { useContext } from 'react';
function Trust_header() {
  const { currentTrust } = useContext(TrustContext);
  return (
    <div>
        <ul className="nav d-flex justify-content-between bg-secondary mb-5">
            <p className="display-6">SupportRoots</p>
            <div className='d-flex'>
            <li className="nav-item">
                <Link className="nav-link fs-4" to="villages">Villages</Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link fs-4" to="users">Users</Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link fs-4" to={`profile/${currentTrust}`}>Profile</Link>
            </li>
            </div>
        </ul >
      <Outlet></Outlet>
    </div>
  )
}

export default Trust_header
