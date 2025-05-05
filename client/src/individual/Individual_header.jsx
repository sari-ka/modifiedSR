import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Individual_header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('individualUser');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('individualUser');
    setUser(null);
    navigate('/individual/login');
  };

  return (
    <div className="bg-white shadow-sm py-3 px-4 sticky-top">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <h3 className="mb-0 fw-semibold text-primary">SupportRoots</h3>
        <ul className="nav gap-3 align-items-center mb-0">
          <li className="nav-item">
            <Link className="nav-link text-dark fs-6 fw-medium" to="villages">Villages</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-dark fs-6 fw-medium" to="trusts">Trusts</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-dark fs-6 fw-medium" to="add-receipt">Add Receipt</Link>
          </li>
          {user ? (
            <>
              <li className="nav-item">
                <Link className="nav-link text-dark fs-6 fw-medium" to={`profile/${user.username}`}>Profile</Link>
              </li>
              <li className="nav-item">
              <button className="btn btn-outline-danger px-3 py-2 fw-semibold" onClick={handleLogout}>
                Logout
              </button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link className="nav-link text-dark fs-6 fw-medium" to="login">Login</Link>
            </li>
          )}
        </ul>
      </div>
      <Outlet />
    </div>
  );
}

export default Individual_header;
