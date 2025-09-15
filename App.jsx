import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import ForgotPassword from './ForgotPassword';
import History from './History';
import CreateAccount from './CreateAccount';
import DetectionMalade from './DetectionMalade';
import Parametre from './Parametre';
import Messagrie from './Messagrie';
import Parametre2 from './Parametre2';
import Securite from './Securite';
import DetectionMalade2 from './DetectionMalade2';
import { useRef,useState,useEffect  } from 'react';
import axios from 'axios';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState({ email: '', pass: '' });
  const [reponse, setReponse] = useState('');
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState(null);
  const [showcamera,setShowcamera]=useState(false);
  const [countdown, setCountdown] = useState(null);
  const [laonding,setLaonding]=useState(false);
 
useEffect(() => {
  // Au chargement de l'app, on récupère le ticket de sécurité
  axios.get('http://localhost:8000/sanctum/csrf-cookie', {
    withCredentials: true
  });
}, []);
  const connexion = async (e) => {
    e.preventDefault();
    const error = {};
    
    if (!data.email || !data.pass) {
      error.champ = 'Remplir des champs est obligatoire';
    } else if (!data.email.includes('@')) {
      error.email = 'Format d\'email est invalide';
    }
    
    setErrors(error);
    
    console.log(data);
    try {
      const result = await axios.post('http://localhost:8000/api/login', {'email': data.email,
       'pass':data.pass
      },
         { withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if(result.data.success){
        localStorage.setItem('prenom', result.data.prenom);
        localStorage.setItem('nom', result.data.nom);
        localStorage.setItem('profile',result.data.profile);
        navigate('/historique');
      }
      setReponse(result.data);
      console.log(' Réponse:', result.data);
    } catch (erreur) {
      console.log(erreur || "Erreur inconnue");
    }
  }
   const videoRef = useRef(null);
  const canvasRef = useRef(null);
const scanne=async(e)=>{
  try{
     e.preventDefault();
  setShowcamera(true);
  setPhoto(null);
   const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
    
        if (videoRef.current) {
        videoRef.current.srcObject = stream;


        // Quand la vidéo est prête → capture auto
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
           let count = 3;
          setCountdown(count);
          const timer = setInterval(() => {
            count -= 1;
            if (count > 0) {
              setCountdown(count);
            } else {
              clearInterval(timer);
              setCountdown(null);
              takePhoto();
            }
          }, 3000); // délai 1s pour être sûr que l'image est bien chargée
        };
      }
    }catch(err){
      console.log(err);
    }
     
      
  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    setPhoto(dataUrl);

    // Fermer la caméra après capture
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
  };
}
const photo1=photo;
const ScannerPhoto=async(photo1)=>{
  setLaonding(true);
  try{
    
    // Décoder le base64 en tableau d’octets
    const byteString = atob(photo1.split(",")[1]); 
    const mimeString = photo1.split(",")[0].split(":")[1].split(";")[0]; 

    let n = byteString.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = byteString.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mimeString });
    const formData = new FormData();
    formData.append("image",blob,"photo.png");
     const result=await axios.post("http://localhost:8000/api/fatial",formData,
      { withCredentials: true,
         headers: {
          "Content-Type": "multipart/form-data",
          'Accept': 'application/json'
        }
      });
       console.log(result.data);
       if(result.data.id && result.data.prenom && result.data.nom){
        localStorage.setItem('id',result.data.id);
        localStorage.setItem('prenom',result.data.prenom);
        localStorage.setItem('nom',result.data.nom);
        localStorage.setItem('profile',result.data.profile);
        navigate('/historique');
       }else {
        // Utilisateur non reconnu
        alert('Visage non reconnu. Veuillez réessayer ou utiliser la connexion par email.');
        setShowcamera(false);
        setPhoto(null);
      }
    }catch(err){
      console.log(err);
    }
}
  return (
    <div className={`App ${location.pathname === '/' ? 'homepage-background' : 'other-pages'}`}>
      <Routes>
        <Route path="/" element={
          <div className='box'>
            <form>
              {errors.champ && <p style={{ color: 'red' }}>{errors.champ}</p>}
              {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
              <input 
                type="email" 
                className='email' 
                name='emaill' 
                onChange={(e) => setData({...data, email: e.target.value})} 
                placeholder='Adresse E-mail'
              />
              <input 
                type="password" 
                className='pass' 
                name='passwd' 
                onChange={(e) => setData({...data, pass: e.target.value})} 
                placeholder='Mot de passe'
              />
              <button onClick={connexion}>
                Se connecter
              </button>
              <button onClick={scanne}>
                Scanner votre visage pour s'authentifier
              </button>
              <Link to="/mot-de-passe-oublie">Mot de passe oublié</Link>
              <button onClick={() => navigate('/creer-un-compte')}>
                Créer un compte
              </button>
              
            </form>
            {showcamera && (
              <div className="camera-fullpage">
                {!photo ? (
                  <>
                  <video ref={videoRef} autoPlay playsInline />
                    {countdown && <div className="countdown">{countdown}</div>}
                    </>
                ) : (
                  <div className="photo-validation">
                    <img src={photo} alt="Capture" />
                      {laonding ? (
                      <div className="scan-loading">
                        <div className="spinner"></div>
                        <p>Reconnaissance en cours...</p>
                      </div>
                    ) : (
                      <button 
                        className="checkmark" 
                        onClick={() => ScannerPhoto(photo)}
                        disabled={laonding}
                      >
                        ✔
                      </button>
                    )}
                  </div>
                                    
                 
                )}
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>
            )}
          </div>
        } />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/historique" element={<History />} />
        <Route path="/creer-un-compte" element={<CreateAccount />} />
        <Route path="/DetectionMalade" element={<DetectionMalade />} />
        <Route path="/Parametre" element={<Parametre />} />
        <Route path="/Parametre2" element={<Parametre2 />} />
        <Route path="/Securite" element={<Securite />} />
        <Route path="/Message" element={<Messagrie />} />
        <Route path="/DetectionMalade2" element={<DetectionMalade2 />} />
      </Routes>
    </div>
  );
}