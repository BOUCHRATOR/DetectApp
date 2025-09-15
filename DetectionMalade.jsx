import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './DetMalade.css';
import axios from 'axios';
export default function DetectionMalade() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [prendrePhoto, setPrendrePhoto] = useState(null);
  const [stream, setStream] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const navigate = useNavigate();
 const image=localStorage.getItem('profile');
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
const Analyser=async()=>{
  try{ 
      const imageSource = prendrePhoto || selectedFile;
   let base64Data;
    if (imageSource.startsWith('blob:')) {
      // Cas Blob (caméra/téléchargement)
      const blob = await fetch(imageSource).then(r => r.blob());
      base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
    } else {
      // Cas Base64 existant
      base64Data = imageSource.split(',')[1]
      
    }
const reponse= await axios.post('http://localhost:8000/api/analyse',{
      'chemin':base64Data
  },
 {withCredentials: true,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        }
      });
      
    localStorage.setItem('lastAnalysis', reponse.data.analyse);
     navigate('/DetectionMalade2');
console.log('Données à envoyer:', reponse.data);

}catch(error){
  console.log(error);
  
}};

  const Camera = async () => {
    try {
     
      if (isCameraActive) {
        PrendrePhotoo();
        return;
      }

      
      stopCamera();
      setIsCameraActive(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      setStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.onplaying = resolve;
        });
      }
    } catch (error) {
      console.error("Camera error:", error);
      setIsCameraActive(false);
      if (error.name === 'NotAllowedError') {
        setPermissionDenied(true);
        alert('Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur');
      }
    }
  };

  const PrendrePhotoo = () => {
    if (!videoRef.current || !photoRef.current) return;

    
    const { videoWidth: width, videoHeight: height } = videoRef.current;
    photoRef.current.width = width;
    photoRef.current.height = height;
    
    const context = photoRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, width, height);
    const photoUrl = photoRef.current.toDataURL('image/jpeg');
    setPrendrePhoto(photoUrl);
    setSelectedFile(null);
    
    stopCamera();
    setIsCameraActive(false);
    
   
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };
  
  const Telecharger = async () => {
    try {
      stopCamera();
      setIsCameraActive(false);
      
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'Images',
          accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] }
        }],
        multiple: false
      });
      const file = await fileHandle.getFile();
      const url = URL.createObjectURL(file);
      setSelectedFile(url);
      setPrendrePhoto(null);
    } catch (error) {
      console.log("Sélection annulée ou erreur:", error);
    }
  };
    const logout =async()=>{
     try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });

    await axios.post(
  "http://localhost:8000/api/logout",
  {},
  {
    withCredentials: true,
    
  }
);
localStorage.clear();
      
      window.location.href = "/"; // rediriger vers login
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
    }
  };


  useEffect(() => {
    return () => {
      stopCamera();
      if (selectedFile) URL.revokeObjectURL(selectedFile);
      if (prendrePhoto) URL.revokeObjectURL(prendrePhoto);
    };
  }, []);
  
 const prenom = localStorage.getItem('prenom');
  return (
    <div className={`main-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      <div className={`layout-left ${!isSidebarOpen ? 'collapsed' : ''}`}>
        <div className="profile">
          <img src={`http://localhost:8000/storage/${image}`} alt="Icône de profil" />
          <p>Bonjour, {prenom}</p>
        </div>
        
        <nav>
          <Link to="/historique">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clock-history" viewBox="0 0 16 16">
              <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z"/>
              <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z"/>
              <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5"/>
            </svg>
            <span>History</span>
          </Link>
          <Link to="/DetectionMalade" className="malde">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-upc-scan" viewBox="0 0 16 16">
              <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5M3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0z"/>
            </svg>
            <span>Détection de maladie</span>
          </Link>
          <Link to="/Parametre" >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527-1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
            </svg>
            <span>Paramètres</span>
          </Link>
          <Link to="/Message" className="mesgg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-right-dots" viewBox="0 0 16 16">
              <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"/>
              <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
            </svg>
            <span>ChatBot</span>
          </Link>
           <button onClick={logout} className="deconnexion">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-unindent" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M13 8a.5.5 0 0 0-.5-.5H5.707l2.147-2.146a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L5.707 8.5H12.5A.5.5 0 0 0 13 8"/>
    <path fillRule="evenodd" d="M3.5 4a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 1 0v-7a.5.5 0 0 0-.5-.5"/>
  </svg>
  <span>Déconnexion</span>
</button>
        </nav>
      </div>
  
      <div className="content1">
        <header>
          <svg onClick={toggleSidebar} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
          </svg>
          
          <h3>Détection de maladie</h3>
        
          <div className="notification">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bell" viewBox="0 0 16 16">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
            </svg>
            <span className="messge">0</span>
          </div>
        </header>
        
        <div className="detection-wrapper">
          <div className="detection-card">
            <canvas ref={photoRef} style={{ display: 'none' }} />
            
            <div className="image-frame">
              {isCameraActive ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : selectedFile || prendrePhoto ? (
                <img 
                  src={selectedFile || prendrePhoto} 
                  alt="Aperçu" 
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <svg 
                  className="profile-icon" 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  fill="currentColor" 
                  viewBox="0 0 16 16"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                </svg>
              )}
            </div>

            <div className="button-container">
              <button onClick={Camera}>
                {isCameraActive ? 'PRENDRE PHOTO' : 'ACTIVER CAMÉRA'}
              </button>
              <button onClick={Telecharger}>TÉLÉCHARGER</button>
              <button 
                onClick={Analyser}
                disabled={!selectedFile && !prendrePhoto}
              >
                ANALYSER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}