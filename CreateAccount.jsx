import { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import React from "react";
 import './CreateAccount.css';
import axios from "axios";
export default function CreateAccount() {
   const navigate = useNavigate();
const [Datacreer,setDatacreer]=useState({
  email:'',nom:'',prenom:'',
  ville:'',date:'',image:null,role:'',
  motpss:'',motpssconf:'',tele:''
});
const [erreur,setErreurs]=useState('');
useEffect(() => {
  // Au chargement de l'app, on récupère le ticket de sécurité
  axios.get('http://localhost:8000/sanctum/csrf-cookie', {
    withCredentials: true
  });
}, []);
  const Creer = async(e)=>{
      e.preventDefault();
      const erreurs={};
      if (!Datacreer.email || !Datacreer.tele|| !Datacreer.role|| !Datacreer.nom || !Datacreer.prenom || !Datacreer.ville 
        || !Datacreer.image || !Datacreer.date || !Datacreer.motpss ||!Datacreer.motpssconf) {
      erreurs.champ = 'Remplir des champs est obligatoire';
    } else if (!Datacreer.email.includes('@')) {
      erreurs.email = 'Format d\'email est invalide';
    }else if(Datacreer.motpss !== Datacreer.motpssconf ){
      erreurs.motdpass='le mot se passe est pas identique';
    }
    setErreurs(erreurs);
    try{
      const formData = new FormData();
        formData.append("email", Datacreer.email);
        formData.append("nom", Datacreer.nom);
        formData.append("prenom", Datacreer.prenom);
        formData.append("ville", Datacreer.ville);
        formData.append("date", Datacreer.date);
        formData.append("role", Datacreer.role);
        formData.append("tele", Datacreer.tele);
        formData.append("motpss", Datacreer.motpss);
        formData.append("image", Datacreer.image);
        const result=await axios.post('http://localhost:8000/api/creer',formData,
         { withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      if(result.data.success){
        
        alert("Compte créé avec succès ✅");
        navigate('/');
      }
console.log("✅ Réponse :", result.data);
    }catch(err){
      console.log(err||'erreur inconnu');
    }
  }
  
  return (
    <>
    <div class="header">
        <div class="logo-container">
            <div class="logo-background-shape"></div>
        </div>
    </div>
      <div className="containerdiv">
        
        <div className="from-containerdiv">
            <form className="from">
               {erreur.champ && <p style={{ color: 'red' }}>{erreur.champ}</p>}
               {erreur.email && <p style={{ color: 'red' }}>{erreur.email}</p>}
                <input type="text" placeholder="Adresse e-mail " className="test"
                onChange={(e)=>setDatacreer({...Datacreer,email:e.target.value})}
                />
                <input type="text" placeholder="NOM" className="test"
                onChange={(e)=>setDatacreer({...Datacreer,nom:e.target.value})}
                />
                <input type="text" placeholder="PRENOM" className="test"
                onChange={(e)=>setDatacreer({...Datacreer,prenom:e.target.value})}
                />
                <input type="text" placeholder="VILLE" className="test"
                onChange={(e)=>setDatacreer({...Datacreer,ville:e.target.value})}
                />
                <input type="date" className="test" onChange={(e)=>setDatacreer({...Datacreer,date:e.target.value})}
                />
                 <input type="text" className="test" onChange={(e)=>setDatacreer({...Datacreer,tele:e.target.value})}
                placeholder="numero de telephone"  />
                  <input type="file" placeholder="image" className="test" 
                  onChange={(e)=>setDatacreer({...Datacreer,image:e.target.files[0]})}
                  />
                  <select className="test"
                  value={Datacreer.role} 
                  onChange={(e)=>setDatacreer({...Datacreer,role:e.target.value})}>
                   <option value="">-- Sélectionner un rôle --</option>
                  <option value='client'>Client</option>
                  <option value='docteur'>Docteur</option>
                  </select>
                  <input type="password" placeholder="MOT DE PASSE" className="test"
                  onChange={(e)=>setDatacreer({...Datacreer,motpss:e.target.value})}
                  />
                  <input type="password" placeholder="CONFIRMATION" className="test"
                  onChange={(e)=>setDatacreer({...Datacreer,motpssconf:e.target.value})}
                  />
                  {erreur.motdpass && <p style={{ color: 'red' }}>{erreur.motdpass}</p>}
                <button onClick={Creer}>SUIVANT</button>
            </form>
        </div>
    </div>
    </>
  );
}