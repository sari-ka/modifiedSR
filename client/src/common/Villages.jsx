import { useState, useEffect,useContext } from 'react';
import axios from 'axios';
import styles from './Village.module.css';
import { TrustContext } from "../Context/LoginT_Context";
function Villages() {
  const [villages, setVillages] = useState([]);
  const { currentTrust } = useContext(TrustContext);
  const [error, setError] = useState('');
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [acceptedProblems, setAcceptedProblems] = useState({});

  async function fetchVillages() {
    try {
      const res = await axios.get('http://localhost:9125/village-api/village');
      if (res.data.message === 'Villages') {
        setVillages(res.data.payload);
        setError('');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error('Fetch villages error:', err.response ? err.response.data : err.message);
      setError('Failed to fetch villages');
    }
  }

  useEffect(() => {
    fetchVillages();
  }, []);

  const getPendingProjects = (problems) =>
    problems.filter((p) => p.status === 'pending');

  const openGoogleMaps = () => {
    if (!selectedVillage) return;

    const villageName = selectedVillage.name || "Tangeda";
    const state = selectedVillage.state || "Andhra Pradesh";
    const pincode = selectedVillage.pincode || "522414";

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${villageName}, ${pincode}, ${state}`)}`,
      '_blank'
    );
  };

  const handleAccept = async (villageId, problemId) => {
    const res = await axios.get(`http://localhost:9125/trust-api/trust/${currentTrust}`);
    let trustId = res.data.payload[0]._id
    console.log('Accepting project:', { villageId, problemId });
    
    try {
      const response = await axios.put(
        `http://localhost:9125/village-api/${villageId}/problem/${problemId}/${trustId}/accept`,
        {}
      );
  
      console.log('Accept response:', response.data);
  
      if (response.data.message.includes("sent to villagers")) {
        setStatusMessage("✅ Request sent to villagers. Waiting for their confirmation...");
        setAcceptedProblems(prev => ({
          ...prev,
          [`${villageId}-${problemId}`]: true
        }));
      } else {
        setStatusMessage(response.data.message || 'Status updated');
      }
  
      fetchVillages();
      setTimeout(() => setSelectedVillage(null), 2000);
    } catch (error) {
      console.error('Error updating status:', error.response ? error.response.data : error.message);
      setStatusMessage(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className={styles.villageContainer}>
      {villages.map((village) => {
        const pending = getPendingProjects(village.problems);
        return (
          <div className={styles.villageCard} key={village.email}>
            <div className={styles.villageCardBody}>
              <h3>{village.name}</h3>
              <p><b>Contact:</b> {village.contact}</p>
              <p><b>Email:</b> {village.email}</p>
              {pending.length > 0 && (
                <div>
                  <p><b>1 Pending Project:</b> {pending[0].title}</p>
                </div>
              )}
              <button onClick={() => setSelectedVillage(village)} className={styles.villageButton}>
                Explore
              </button>
            </div>
          </div>
        );
      })}

      {selectedVillage && (
        <div className={styles.villageModal}>
          <div className={styles.villageModalContent}>
            <button className={styles.villageClose} onClick={() => setSelectedVillage(null)}>X</button>
            <h2>{selectedVillage.name}</h2>
            <p><b>Contact:</b> {selectedVillage.contact}</p>
            <p><b>Email:</b> {selectedVillage.email}</p>
            <button className={styles.villageMapButton} onClick={openGoogleMaps}>
              <i className="bi bi-map me-2"></i> Open in Google Maps
            </button>

            <h3 className='mt-3'>Pending Projects:</h3>
            {getPendingProjects(selectedVillage.problems).map((proj, index) => (
  <div key={index} className={styles.villageProject}>
    <p><b>Title:</b> {proj.title}</p>
    <p><b>Description:</b> {proj.description}</p>
    <p><b>Estimated Amount:</b> {proj.estimatedamt}</p>
    {acceptedProblems[`${selectedVillage._id}-${proj._id}`] || proj.done_by_trust === 'accepted' ? (
      <div className="text-danger">
        Request sent to villagers...
      </div>
    ) : (
      <button
        onClick={() => handleAccept(selectedVillage._id, proj._id)}
        className={styles.villageAcceptButton}
      >
        Accept
      </button>
    )}
  </div>
))}

          </div>
        </div>
      )}

      {statusMessage && <p className={styles.villageStatusMessage}>{statusMessage}</p>}
      {error && <p className={styles.villageStatusMessage}>{error}</p>}
    </div>
  );
}

export default Villages;