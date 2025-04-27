import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { TrustContext } from "../Context/LoginT_Context";

const TrustProfile = () => {
  const { currentTrust } = useContext(TrustContext);
  const [trustDetails, setTrustDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [mapLoading, setMapLoading] = useState(false);
  const [projects, setProjects] = useState({
    past: [],
    ongoing: [],
    upcoming: []
  });
  const [showModal, setShowModal] = useState(false);
  const [modalProjects, setModalProjects] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [topVillages, setTopVillages] = useState([]);
  const [villagesLoading, setVillagesLoading] = useState(false);
  const [villagesError, setVillagesError] = useState(null);
  const MAPS_API_KEY = "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ12345678"; // Replace with your actual key

  const projectCounts = {
    past: projects.past.length,
    ongoing: projects.ongoing.length,
    upcoming: projects.upcoming.length
  };

  const handleProjectClick = (projectType) => {
    setModalTitle(`${projectType} Projects`);
    setModalProjects(projects[projectType]);
    setShowModal(true);
  };

  // Get trust ID with localStorage fallback
  const trustname = currentTrust || localStorage.getItem("trustname");

  // Fetch trust details
  const getTrust = async () => {
    if (!trustname) {
      setError("No trust selected");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:9125/trust-api/trust/${trustname}`);
      if (res.data.payload && res.data.payload.length > 0) {
        const trustData = res.data.payload[0];
        setTrustDetails(trustData);
        setProjects({
          past: trustData.projects?.past || [],
          ongoing: trustData.projects?.ongoing || [],
          upcoming: trustData.projects?.upcoming || []
        });
        localStorage.setItem("trustData", JSON.stringify(trustData));
      } else {
        throw new Error("No trust data found");
      }
    } catch (err) {
      setError(err.message);
      const cachedData = localStorage.getItem("trustData");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setTrustDetails(parsedData);
        setProjects({
          past: parsedData.projects?.past || [],
          ongoing: parsedData.projects?.ongoing || [],
          upcoming: parsedData.projects?.upcoming || []
        });
      }
    } finally {
      setLoading(false);
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
      
      const response = await axios.get(
        `http://localhost:9125/trust-api/trust/${trustname}/villages`
      );

      const villagesData = response.data.payload || JSON.parse(localStorage.getItem("trustVillages")) || [];
      
      // Sort by total help provided and take top 3
      const sortedVillages = [...villagesData].sort((a, b) => (b.total_help || 0) - (a.total_help || 0));
      const top3 = sortedVillages.slice(0, 3).map((village, index) => ({
        id: village._id || index,
        name: village.village_name || "Anonymous Village",
        helpAmount: village.total_help || 0,
        rank: index + 1,
        projects: village.projects_count || 0
      }));

      setTopVillages(top3);
      localStorage.setItem("topVillages", JSON.stringify(top3));
    } catch (err) {
      console.error("Error fetching villages:", err);
      setVillagesError("Failed to load top villages");
      // Load from cache if available
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
    // Load from cache first for instant display
    const cachedData = localStorage.getItem("trustData");
    const cachedVillages = localStorage.getItem("topVillages");
    const cachedMap = localStorage.getItem("trustMap");

    if (cachedData) setTrustDetails(JSON.parse(cachedData));
    if (cachedVillages) setTopVillages(JSON.parse(cachedVillages));
    if (cachedMap) setImageUrl(cachedMap);

    // Then fetch fresh data
    if (trustname) {
      getTrust();
      fetchTopVillages();
    }
  }, [trustname]);

  // Get map when trust details change
  useEffect(() => {
    if (trustDetails) {
      getTrustImage();
    }
  }, [trustDetails]);

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
      {/* Loading state for map */}
      {mapLoading && (
        <div className="alert loading-state">
          <div className="spinner-border me-2" role="status"></div>
          Loading map...
        </div>
      )}

      {error && (
        <div className="alert error-state">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {trustDetails && (
        <div>
          {/* Row 1 */}
          <div className="row mb-4">
            <div className="col-md-5">
              <div className="card profile-card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="me-4">
                      <img
                        src={imageUrl}
                        alt={`${trustDetails.name} location`}
                        className="img-fluid rounded-circle profile-image"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div>
                      <h2 className="trust-name">{trustDetails.name}</h2>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <span className="badge profile-badge me-2">
                            <i className="bi bi-envelope profile-icon"></i>
                          </span>
                          {trustDetails.email}
                        </li>
                        <li className="mb-2">
                          <span className="badge profile-badge me-2">
                            <i className="bi bi-geo-alt profile-icon"></i>
                          </span>
                          {trustDetails.address}
                        </li>
                        <li>
                          <span className="badge profile-badge me-2">
                            <i className="bi bi-telephone profile-icon"></i>
                          </span>
                          {trustDetails.contact}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <button
                    className="btn map-button mt-3 w-100 py-2"
                    onClick={openGoogleMaps}
                  >
                    <i className="bi bi-map me-2"></i> Open in Google Maps
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="col-md-7">
              <div className="card stats-card">
                <div className="card-header stats-header">
                  <h3 className="mb-0">
                    <i className="bi bi-bar-chart-line me-2"></i>
                    Trust Statistics
                  </h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="stat-item">
                        <h5>Total Funding Received</h5>
                        <p className="stat-value text-success">
                          ₹{trustDetails.funding?.total_received?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="stat-item">
                        <h5>Total Disbursed</h5>
                        <p className="stat-value text-primary">
                          ₹{trustDetails.funding?.total_disbursed?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <div className="stat-item">
                        <h5>Trust Rating</h5>
                        <p className="stat-value text-warning">
                          {trustDetails.rating || 0}/5
                          <i className="bi bi-star-fill ms-2"></i>
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="stat-item">
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
              <div className="card villages-card">
                <div className="card-header villages-header">
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
                      {topVillages.map((village) => (
                        <div key={village.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span className="badge bg-primary me-2">#{village.rank}</span>
                              <strong>{village.name}</strong>
                            </div>
                            <div className="text-end">
                              <div className="text-success">₹{village.helpAmount.toLocaleString()}</div>
                              <small className="text-muted">{village.projects} projects</small>
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
              <div className="row">
                <div className="col-md-4">
                  <div 
                    className="card past-projects h-100" 
                    onClick={() => handleProjectClick('past')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body">
                      <h5 className="card-title text-danger">
                        <i className="bi bi-check-circle me-2"></i>
                        Past Projects
                      </h5>
                      <p className="project-count text-center text-danger">{projectCounts.past}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div 
                    className="card ongoing-projects h-100" 
                    onClick={() => handleProjectClick('ongoing')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body">
                      <h5 className="card-title text-success">
                        <i className="bi bi-arrow-repeat me-2"></i>
                        Ongoing Projects
                      </h5>
                      <p className="project-count text-center text-success">{projectCounts.ongoing}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div 
                    className="card future-projects h-100" 
                    onClick={() => handleProjectClick('upcoming')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body">
                      <h5 className="card-title text-primary">
                        <i className="bi bi-calendar-plus me-2"></i>
                        Future Projects
                      </h5>
                      <p className="project-count text-center text-primary">{projectCounts.upcoming}</p>
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
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
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
                  <ul className="list-group">
                    {modalProjects.map((project, index) => (
                      <li key={index} className="list-group-item">
                        <h6>{project.title || "Untitled Project"}</h6>
                        <p>{project.description || "No description available"}</p>
                        
                        {modalTitle.includes("Past") && project.completionDate && (
                          <p className="mb-1">
                            <small className="text-muted">
                              <strong>Completed:</strong> {new Date(project.completionDate).toLocaleDateString()}
                            </small>
                          </p>
                        )}
                        
                        {modalTitle.includes("Ongoing") && (
                          <>
                            {project.startDate && (
                              <p className="mb-1">
                                <small className="text-muted">
                                  <strong>Started:</strong> {new Date(project.startDate).toLocaleDateString()}
                                </small>
                              </p>
                            )}
                            {project.progressUpdates?.length > 0 && (
                              <p className="mb-1">
                                <small className="text-muted">
                                  <strong>Last update:</strong> {new Date(
                                    project.progressUpdates[project.progressUpdates.length - 1].date
                                  ).toLocaleDateString()}
                                </small>
                              </p>
                            )}
                          </>
                        )}
                        
                        {modalTitle.includes("Upcoming") && project.plannedStartDate && (
                          <p className="mb-1">
                            <small className="text-muted">
                              <strong>Planned start:</strong> {new Date(project.plannedStartDate).toLocaleDateString()}
                            </small>
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No projects found in this category</p>
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