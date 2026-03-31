
import React, { useState, useRef } from 'react';
import { User, ViewState } from '../types';
import { ArrowLeft, Camera, Eye, EyeOff, Phone, Lock } from 'lucide-react';

// Accès au Firebase global défini dans App.tsx ou index.html
declare var firebase: any;

interface AuthProps {
  view: 'login' | 'signup' | 'forgot-password';
  setView: (view: ViewState) => void;
  onAuthComplete: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ view, setView, onAuthComplete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    if (!formData.phone || !formData.password) {
      alert("Ndeko, remplis au moins le téléphone et le mot de passe !");
      return;
    }

    const db = firebase.database();
    const phoneKey = formData.phone.replace(/\s/g, ''); // Nettoyage du numéro
    setIsLoading(true);

    try {
      if (view === 'signup') {
        if (!formData.firstName) {
          alert("Prénom obligatoire pour l'inscription !");
          setIsLoading(false);
          return;
        }

        // 1. Vérifier si l'utilisateur existe déjà sur Firebase
        const snapshot = await db.ref('utilisateurs/' + phoneKey).once('value');
        if (snapshot.exists()) {
          alert("Ce numéro est déjà utilisé sur MboteEat ! Connecte-toi.");
          setIsLoading(false);
          return;
        }

        // 2. Création du compte sur Firebase
        const newUser = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          password: formData.password, // Stockage simple pour ton prototype
          profilePhoto: profileImage || "",
          dateInscription: firebase.database.ServerValue.TIMESTAMP
        };

        await db.ref('utilisateurs/' + phoneKey).set(newUser);
        
        // 3. Session locale
        const userSession: User = { 
          firstName: newUser.firstName, 
          lastName: newUser.lastName, 
          phone: newUser.phone,
          profilePhoto: newUser.profilePhoto || undefined
        };
        localStorage.setItem('mboteEat_currentUser', JSON.stringify(userSession));
        onAuthComplete(userSession);

      } else if (view === 'login') {
        // 1. Récupération depuis Firebase
        const snapshot = await db.ref('utilisateurs/' + phoneKey).once('value');
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          
          // 2. Vérification mot de passe
          if (userData.password === formData.password) {
            const userSession: User = {
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              profilePhoto: userData.profilePhoto || undefined
            };
            localStorage.setItem('mboteEat_currentUser', JSON.stringify(userSession));
            onAuthComplete(userSession);
          } else {
            alert("Mot de passe incorrect, réessaye !");
          }
        } else {
          alert("Ce numéro n'existe pas. Crée un compte !");
          setView('signup');
        }
      }
    } catch (error: any) {
      alert("Erreur de connexion : " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[300] flex flex-col h-full overflow-hidden">
      <div className="relative h-40 bg-yellow-400 flex flex-col justify-end p-6 shrink-0 shadow-md">
        <button 
          onClick={() => setView('welcome')}
          className="absolute top-6 left-6 p-2.5 bg-black text-white rounded-xl active:scale-90 transition-transform shadow-lg"
        >
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
        <div className="mb-2">
          <h1 className="text-3xl font-black text-black tracking-tighter leading-none uppercase">
            {view === 'login' ? 'Connexion' : view === 'signup' ? 'S\'inscrire' : 'Récupérer'}
          </h1>
          <p className="text-black font-black text-[9px] uppercase tracking-[0.2em] opacity-60 mt-1">
            {isLoading ? 'Chargement...' : 'Base de données synchronisée'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pt-8 pb-12 space-y-6">
        {view === 'signup' && (
          <div className="flex flex-col items-center mb-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 bg-gray-100 rounded-[2.5rem] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative group cursor-pointer"
            >
              {profileImage ? (
                <img src={profileImage} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <Camera size={28} className="text-gray-300" />
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Photo de profil</span>
          </div>
        )}

        <div className="space-y-4">
          {view === 'signup' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Prénom</label>
                <input 
                  disabled={isLoading}
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none text-black font-bold text-sm shadow-sm transition-all disabled:opacity-50" 
                  placeholder="Jean" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Nom</label>
                <input 
                  disabled={isLoading}
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none text-black font-bold text-sm shadow-sm transition-all disabled:opacity-50" 
                  placeholder="Kongo" 
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                disabled={isLoading}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none text-black font-bold text-sm shadow-sm transition-all disabled:opacity-50" 
                placeholder="081 000 0000" 
                type="tel" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                disabled={isLoading}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-14 pr-14 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none text-black font-bold text-sm shadow-sm transition-all disabled:opacity-50" 
                placeholder="********" 
                type={showPassword ? "text" : "password"} 
              />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        {view === 'login' && (
          <div className="flex justify-end">
            <button onClick={() => setView('forgot-password')} className="text-[11px] font-black text-black uppercase underline decoration-yellow-400 underline-offset-4">Mot de passe oublié ?</button>
          </div>
        )}

        <button 
          onClick={handleAction}
          disabled={isLoading}
          className={`w-full bg-black text-white py-5 rounded-3xl font-black text-sm shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 ${isLoading ? 'opacity-70' : ''}`}
        >
          {isLoading ? 'Traitement en cours...' : (view === 'login' ? 'Connexion' : 'Créer mon compte')}
        </button>

        <div className="flex items-center gap-6 py-4">
          <div className="h-px bg-gray-100 flex-1"></div>
          <span className="text-[9px] font-black text-gray-300 uppercase">Ou continuer avec</span>
          <div className="h-px bg-gray-100 flex-1"></div>
        </div>

        <button 
          disabled={isLoading}
          className="w-full bg-white border-2 border-gray-100 text-black py-4 rounded-3xl font-black text-[11px] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-sm uppercase tracking-widest disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Google
        </button>
      </div>
    </div>
  );
};

export default Auth;
