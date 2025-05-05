import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './admin_header.css';

function AdminHeader() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    navigate("/admin/login");
  };

  return (
    <div className={`layout-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Top Bar */}
      <div className="topbar">
        <button className="open-btn me-3" onClick={toggleSidebar}>☰</button>
        <h1 className="logo">Admin Panel</h1>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header d-flex justify-content-between align-items-center">
          <h4>Menu</h4>
          <button className="close-btn" onClick={closeSidebar}>✖</button>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link" to="unverified-villages" onClick={closeSidebar}>Unverified Villages</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="unverified-trusts" onClick={closeSidebar}>Unverified Trusts</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="verified-villages" onClick={closeSidebar}>Verified Villages</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="verified-trusts" onClick={closeSidebar}>Verified Trusts</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="receipts" onClick={closeSidebar}>Receipts</Link>
          </li>
          <li className="nav-item mt-4">
            <button onClick={handleLogout} className="btn btn-danger w-100 p-2">Logout</button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminHeader;
