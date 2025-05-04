import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { TrustContext } from "../Context/LoginT_Context";
import 'bootstrap/dist/css/bootstrap.min.css';

const TrustProfile = () => {
  const { currentTrust } = useContext(TrustContext);
  const [trustDetails, setTrustDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState("https://media.istockphoto.com/id/1316331605/vector/modern-city-building-exterior-office-center-or-business-house.jpg?s=612x612&w=0&k=20&c=VTJvkEXvS1xS53IxM6p7aJYj2RCZqeYVA57i5WfXkI8=");
  const [mapLoading, setMapLoading] = useState(false);
  const [projects, setProjects] = useState({
    past: [],
    ongoing: [],
    upcoming: [],
    pending: []
  });
  const [showModal, setShowModal] = useState(false);
  const [modalProjects, setModalProjects] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [topVillages, setTopVillages] = useState([]);
  const [villagesLoading, setVillagesLoading] = useState(false);
  const [villagesError, setVillagesError] = useState(null);
  const [villages, setVillages] = useState([]);
  const MAPS_API_KEY = "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ12345678";

  const projectCounts = {
    past: projects.past.length,
    ongoing: projects.ongoing.length,
    upcoming: projects.upcoming.length,
    pending: projects.pending.length
  };

  const handleProjectClick = (projectType) => {
    const titleMap = {
      past: "Past Village Support",
      ongoing: "Ongoing Village Support",
      upcoming: "Future Village Support",
      pending: "Pending Village Support"
    };
    setModalTitle(titleMap[projectType] || "Village Support");
    setModalProjects(projects[projectType]);
    setShowModal(true);
  };

  // Get trust ID with localStorage fallback
  const trustname = currentTrust || localStorage.getItem("trustname");

  // Function to get village details by ID
  const getVillageDetails = (villageId) => {
    if (!villages.length) return { village_name: "Unknown Village", name: "Unknown Village" };

    // Ensure both are strings for comparison
    const village = villages.find(v => String(v._id) === String(villageId));

    if (!village) {
      console.warn(`No matching village found for id: ${villageId}`);
      return { village_name: "Unknown Village", name: "Unknown Village" };
    }

    return village;
  };

  // Fetch trust details and projects
  const getTrust = async () => {
    if (!trustname) {
      setError("No trust selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch trust details
      const trustRes = await axios.get(`http://localhost:9125/trust-api/trust/${trustname}`);
      if (trustRes.data.payload && trustRes.data.payload.length > 0) {
        const trustData = trustRes.data.payload[0];
        setTrustDetails(trustData);
        
        // Organize projects by status
        const organizedProjects = {
          past: [],
          ongoing: [],
          upcoming: [],
          pending: []
        };
        
        if (trustData.assigned_problems) {
          trustData.assigned_problems.forEach(project => {
            if (project.status && organizedProjects[project.status]) {
              organizedProjects[project.status].push(project);
            }
          });
        }
        
        setProjects(organizedProjects);
        localStorage.setItem("trustData", JSON.stringify(trustData));
      } else {
        throw new Error("No trust data found");
      }
    } catch (err) {
      console.error("Error fetching trust:", err);
      setError(err.message);
      
      // Try to load from cache
      const cachedData = localStorage.getItem("trustData");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setTrustDetails(parsedData);
        
        // Organize cached projects
        const organizedProjects = {
          past: [],
          ongoing: [],
          upcoming: [],
          pending: []
        };
        
        if (parsedData.assigned_problems) {
          parsedData.assigned_problems.forEach(project => {
            if (project.status && organizedProjects[project.status]) {
              organizedProjects[project.status].push(project);
            }
          });
        }
        
        setProjects(organizedProjects);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all villages data
  const fetchAllVillages = async () => {
    try {
      const response = await axios.get('http://localhost:9125/village-api/village');
      setVillages(response.data.payload || []);
    } catch (err) {
      console.error("Error fetching all villages:", err);
    }
  };

  // Fetch top villages helped by this trust
  const fetchTopVillages = async () => {
    if (!trustname) {
      setTopVillages([]);
      return;
    }
  
    try {
      setVillagesLoading(true);
      setVillagesError(null);
  
      // Call the backend route for top villages by money
      const response = await axios.get(
        `http://localhost:9125/trust-api/trust/${trustname}/top-villages`
      );
      // console.log(response)
      const data = response.data.topVillages || [];
      // console.log(data)
      // Map and structure the data for UI
      const top3 = data.slice(0, 3).map((village, index) => ({
        id: village.villageId,
        name: village.villageName || "Anonymous Village",
        helpAmount: village.totalMoney || 0,
        rank: index + 1,
      }));
  
      setTopVillages(top3);
      console.log("top3 : "+top3)
      localStorage.setItem("topVillages", JSON.stringify(top3));
    } catch (err) {
      console.error("Error fetching top villages:", err);
      setVillagesError("Failed to load top villages");
  
      const cachedVillages = localStorage.getItem("topVillages");
      if (cachedVillages) {
        setTopVillages(JSON.parse(cachedVillages));
      } else {
        setTopVillages([]);
      }
    } finally {
      setVillagesLoading(false);
    }
  };

  // Get trust location map image
  const getTrustImage = async () => {
    if (!trustDetails) return;

    setMapLoading(true);
    const trustName = trustDetails.name || "Sample Trust";
    const address = trustDetails.address || "Hyderabad, Telangana";

    try {
      // Try to get coordinates first
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          `${trustName}, ${address}, India`
        )}&key=${MAPS_API_KEY}`
      );

      if (geocodeResponse.data.results?.length > 0) {
        const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=600x400&maptype=roadmap&markers=color:blue%7C${lat},${lng}&key=${MAPS_API_KEY}`;
        setImageUrl(staticMapUrl);
        localStorage.setItem("trustMap", staticMapUrl);
      } else {
        throw new Error("Geocoding failed");
      }
    } catch (error) {
      console.error("Map error:", error);
      // Fallback to cached map or SVG
      const cachedMap = localStorage.getItem("trustMap");
      if (cachedMap) {
        setImageUrl(cachedMap);
      } else {
        setImageUrl(
          `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23f0f0f0' width='600' height='400'/%3E%3Ctext fill='%23000' font-family='Arial' font-size='24' font-weight='bold' text-anchor='middle' x='300' y='200'%3E${encodeURIComponent(
            trustName
          )}%3C/text%3E%3Ctext fill='%23666' font-family='Arial' font-size='18' text-anchor='middle' x='300' y='230'%3E${encodeURIComponent(
            address
          )}%3C/text%3E%3C/svg%3E`
        );
      }
    } finally {
      setMapLoading(false);
    }
  };

  // Open Google Maps
  const openGoogleMaps = () => {
    if (!trustDetails) return;
    
    const trustName = trustDetails.name || "Sample Trust";
    const address = trustDetails.address || "Hyderabad, Telangana";
    
    const coordMatch = imageUrl.match(/center=([\d.-]+),([\d.-]+)/);
    if (coordMatch) {
      window.open(`https://www.google.com/maps/@${coordMatch[1]},${coordMatch[2]},14z`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${trustName}, ${address}`)}`, '_blank');
    }
  };

  // Initial data load
  useEffect(() => {
    if (trustname) {
      getTrust();
      fetchAllVillages();
    }
  }, [trustname]);

  // Fetch villages and map when trust details change
  useEffect(() => {
    if (trustname) {
      fetchTopVillages();
      console.log("topVillages : "+topVillages)
      getTrustImage();
    }
  }, [trustname]);

  // Loading and error states
  if (!trustname) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger">
          No trust selected. Please select a trust first.
        </div>
      </div>
    );
  }

  if (loading && !trustDetails) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading trust data...</p>
      </div>
    );
  }

  return (
    <div className="container trust-profile-container">
      {mapLoading && (
        <div className="alert alert-info loading-state">
          <div className="spinner-border me-2" role="status"></div>
          Loading map...
        </div>
      )}

      {error && (
        <div className="alert alert-danger error-state">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {trustDetails && (
        <div>
          {/* Row 1 */}
          <div className="row mb-4">
            {/* Trust Info Card */}
            <div className="col-md-5">
              <div className="card profile-card shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="me-4">
                      <img
                        src={imageUrl}
                        alt={`${trustDetails.name} location`}
                        className="img-fluid rounded-circle profile-image"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                      />
                    </div>
                    <div>
                      <h2 className="trust-name">{trustDetails.name}</h2>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <span className="badge bg-primary me-2">
                            <i className="bi bi-envelope text-white"></i>
                          </span>
                          {trustDetails.email || "Not provided"}
                        </li>
                        <li className="mb-2">
                          <span className="badge bg-primary me-2">
                            <i className="bi bi-geo-alt text-white"></i>
                          </span>
                          {trustDetails.address || "Not provided"}
                        </li>
                        <li>
                          <span className="badge bg-primary me-2">
                            <i className="bi bi-telephone text-white"></i>
                          </span>
                          {trustDetails.contact || "Not provided"}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary mt-3 w-100 py-2"
                    onClick={openGoogleMaps}
                  >
                    <i className="bi bi-map me-2"></i> Open in Google Maps
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="col-md-7">
              <div className="card stats-card shadow">
                <div className="card-header bg-primary text-white">
                  <h3 className="mb-0">
                    <i className="bi bi-bar-chart-line me-2"></i>
                    Trust Statistics
                  </h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="stat-item mb-3">
                        <h5>Total Funding Received</h5>
                        <p className="stat-value text-success">
                          ₹{trustDetails.funding?.total_received?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="stat-item mb-3">
                        <h5>Total Disbursed</h5>
                        <p className="stat-value text-primary">
                          ₹{trustDetails.funding?.total_disbursed?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="stat-item mb-3">
                        <h5>Trust Rating</h5>
                        <p className="stat-value text-warning">
                          {trustDetails.rating || 0}/5
                          <i className="bi bi-star-fill ms-2"></i>
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="stat-item mb-3">
                        <h5>Approval Status</h5>
                        <p className="stat-value">
                          {trustDetails.approved ? (
                            <span className="text-success">Approved</span>
                          ) : (
                            <span className="text-danger">Pending</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="row">
            {/* Villages Section */}
            <div className="col-md-5">
              <div className="card villages-card shadow">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">
                    <i className="bi bi-people-fill me-2"></i>
                    Top Helped Villages
                  </h4>
                </div>
                <div className="card-body">
                  {villagesLoading ? (
                    <div className="text-center py-3">
                      <div className="spinner-border text-primary" role="status"></div>
                    </div>
                  ) : villagesError ? (
                    <div className="alert alert-warning">{villagesError}</div>
                  ) : topVillages.length > 0 ? (
                    <div className="list-group">
                      {topVillages.map((village, idx) => (
                        <div key={village.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span className="badge bg-primary me-2">#{village.rank}</span>
                              <strong>Village: {village.name}</strong>
                            </div>
                            <div className="text-end">
                              <div className="text-success fw-bold">
                                ₹ {village.helpAmount.toLocaleString()}
                              </div>
                              <small className="text-muted">Total Contributed</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-info">No village data available</div>
                  )}
                </div>
              </div>
            </div>
            {/* Projects Section */}
            <div className="col-md-7">
              <div className="row g-3">
                <div className="col-md-6">
                  <div 
                    className="card h-100 shadow-sm clickable-card" 
                    onClick={() => handleProjectClick('past')}
                    style={{ cursor: 'pointer', borderLeft: '4px solid #dc3545' }}
                  >
                    <div className="card-body text-center">
                      <h5 className="card-title text-danger">
                        <i className="bi bi-check-circle me-2"></i>
                        Past Support
                      </h5>
                      <p className="project-count display-4 text-danger">{projectCounts.past}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div 
                    className="card h-100 shadow-sm clickable-card" 
                    onClick={() => handleProjectClick('ongoing')}
                    style={{ cursor: 'pointer', borderLeft: '4px solid #28a745' }}
                  >
                    <div className="card-body text-center">
                      <h5 className="card-title text-success">
                        <i className="bi bi-arrow-repeat me-2"></i>
                        Ongoing Support
                      </h5>
                      <p className="project-count display-4 text-success">{projectCounts.ongoing}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div 
                    className="card h-100 shadow-sm clickable-card" 
                    onClick={() => handleProjectClick('upcoming')}
                    style={{ cursor: 'pointer', borderLeft: '4px solid #007bff' }}
                  >
                    <div className="card-body text-center">
                      <h5 className="card-title text-primary">
                        <i className="bi bi-calendar-plus me-2"></i>
                        Future Support
                      </h5>
                      <p className="project-count display-4 text-primary">{projectCounts.upcoming}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div 
                    className="card h-100 shadow-sm clickable-card" 
                    onClick={() => handleProjectClick('pending')}
                    style={{ cursor: 'pointer', borderLeft: '4px solid #ffc107' }}
                  >
                    <div className="card-body text-center">
                      <h5 className="card-title text-warning">
                        <i className="bi bi-hourglass-split me-2"></i>
                        Pending Support
                      </h5>
                      <p className="project-count display-4 text-warning">{projectCounts.pending}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalTitle}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {modalProjects.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Village</th>
                          <th>Problem</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Posted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalProjects.map((project, index) => {
                          const village = getVillageDetails(project.village_id);
                          return (
                            <tr key={index}>
                              <td>{village.village_name || village.name || "Unknown Village"}</td>
                              <td>{project.problem_id || "N/A"}</td>
                              <td>₹{project.money_trust?.toLocaleString() || 0}</td>
                              <td>
                                <span className={`badge ${
                                  project.status === 'past' ? 'bg-success' :
                                  project.status === 'ongoing' ? 'bg-warning' :
                                  project.status === 'upcoming' ? 'bg-primary' :
                                  'bg-secondary'
                                }`}>
                                  {project.status}
                                </span>
                              </td>
                              <td>
                                {project.posted_time ? new Date(project.posted_time).toLocaleString() : "N/A"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">No projects found in this category</div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustProfile;