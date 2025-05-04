import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { TrustContext } from '../Context/LoginT_Context';
import './Past.css'; // 💡 import custom CSS for styling

function Past_tr() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const { currentTrust } = useContext(TrustContext);
  const trustName = currentTrust;
  const [zoomedImage, setZoomedImage] = useState(null); // For zooming an image

    const handleImageClick = (imgUrl) => {
    setZoomedImage(imgUrl);
    };

    const handleZoomClose = () => {
    setZoomedImage(null);
    };

  useEffect(() => {
    const fetchPastProjects = async () => {
      try {
        const res = await axios.get(`http://localhost:9125/trust-api/trust/${trustName}/past-projects`);
        setProjects(res.data.pastProjects || []);
      } catch (err) {
        console.error('Error fetching past projects:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPastProjects();
  }, [trustName]);

  const handleOpenModal = (images) => {
    setSelectedImages(images);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImages([]);
  };

  if (loading) return <div className="text-center text-muted mt-5">Loading...</div>;

  return (
    <div className="past-container">
      <h3 className="text-center text-heading mb-4">Past Projects of {trustName}</h3>
      {projects.length === 0 ? (
        <p className="text-center text-muted">No past projects found.</p>
      ) : (
        <div className="row">
          {projects.map((proj, index) => (
            <div key={index} className="col-md-6 col-lg-4 mb-4">
              <div className="card project-card">
                <div className="card-body">
                  <h5 className="card-title text-primary-subtle">Project: {proj.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">Village: {proj.villageName}</h6>
                  <p className="card-text text-body">{proj.description}</p>
                  {proj.proof_images && proj.proof_images.length > 0 ? (
                    <button
                      className="btn btn-outline-soft"
                      onClick={() => handleOpenModal(proj.proof_images)}
                    >
                      See Proof of Work
                    </button>
                  ) : (
                    <p className="text-muted">No proof image uploaded.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal fade show custom-modal" style={{ display: 'block' }} aria-modal="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Proof of Work</h5>
                <button type="button" className="close" onClick={handleCloseModal} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="col-md-4 mb-3">
                      <img
                        src={`http://localhost:9125${img}`}
                        alt="Proof"
                        className="img-fluid rounded shadow-sm zoomable-img"
                        style={{ objectFit: 'cover', height: '300px', cursor: 'zoom-in' }}
                        onClick={() => handleImageClick(`http://localhost:9125${img}`)}
                        />
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary px-2 py-1" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
          {zoomedImage && (
            <div className="zoom-modal" onClick={handleZoomClose}>
                <img src={zoomedImage} alt="Zoomed Proof" className="zoomed-image" />
            </div>
            )}
        </div>
      )}
    </div>
  );
}

export default Past_tr;
