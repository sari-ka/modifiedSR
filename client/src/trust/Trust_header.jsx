import { Outlet,Link,useNavigate } from 'react-router-dom'
import { TrustContext } from "../Context/LoginT_Context";
import { useContext,useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../village/vill_header.css'; // Your custom styles
function Trust_header() {
  const { currentTrust } = useContext(TrustContext);
  const {userLogout}=useContext(TrustContext)
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => {
    userLogout();
    navigate("/trust/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  return (
    <div className={`layout-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Top Bar */}
      <div className="topbar d-flex align-items-center justify-content-between px-3 py-2">
        <div className="d-flex align-items-center">
          <button className="open-btn me-3" onClick={toggleSidebar}>☰</button>
          <h1 className="logo m-0">SupportRoots</h1>
        </div>
        <div className="topbar-links d-flex align-items-center gap-4">
          <Link to="villages" className="topbar-link">Villages</Link>
          <Link to="users" className="topbar-link">User</Link>
          <Link to={`profile/${currentTrust}`} className="topbar-link">Profile</Link>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h4>Menu</h4>
          <button className="close-btn" onClick={closeSidebar}>✖</button>
        </div>
        <ul className="nav flex-column mt-4">
          {/* <li className="nav-item">
            <Link className="nav-link" to="upcoming" onClick={closeSidebar}>
              Upcoming
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="accepted" onClick={closeSidebar}>
              Accepted Problems
            </Link>
          </li> */}
          <li className="nav-item">
            <Link className="nav-link" to="upcoming" onClick={closeSidebar}>
              Upcoming projects
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="ongoing" onClick={closeSidebar}>
              Ongoing projects
            </Link>
          </li>
          <li className="nav-item mt-4">
            <button onClick={handleLogout} className="btn btn-danger w-100 p-2">
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  )
}

export default Trust_header


{/* <div>
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
    </div> */}