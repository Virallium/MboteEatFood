
import React, { useState, useEffect, useRef } from 'react';
import { User, ViewState, Restaurant, CartItem, Order } from './types';
import Map from './components/Map';
import RestaurantPage from './components/RestaurantPage';
import CartSidebar from './components/CartSidebar';
import Auth from './components/Auth';
import { User as UserIcon, History, Map as MapIcon, ShoppingCart, Send, X, ChevronRight, Sparkles, Bell, LogOut, Edit3, Camera, Save, AlertTriangle } from 'lucide-react';
import { getAiRecommendation } from './services/gemini';
import { SPICE_LABELS, POINTS_DE_VENTE } from './constants';

//----INFO APK IMAGE ET NOM---//
import photologo1 from './components/photos/mboteeat.jpeg';
import photologo2 from './components/photos/mboteeatlogo.jpeg';
// --- CONFIGURATION FIREBASE ---
declare var firebase: any;
const firebaseConfig = {
    apiKey: "AIzaSyCPN63Y47SCTFh_E2qsbINV7ZVrfz3BB40",
    authDomain: "mboteeat.firebaseapp.com",
    projectId: "mboteeat",
    storageBucket: "mboteEat.firebasestorage.app",
    messagingSenderId: "166834281562",
    appId: "1:166834281562:web:c0b42e5f5c5f7d9b200c63",
    databaseURL: "https://mboteeat-default-rtdb.firebaseio.com/"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(POINTS_DE_VENTE);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState('moto');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [isAiVisible, setIsAiVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', profilePhoto: '' });
  const [showOrderToast, setShowOrderToast] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  useEffect(() => {
    const checkNightMode = () => {
      const currentHour = new Date().getHours();
      const night = currentHour >= 18 || currentHour < 6;
      setIsNightMode(night);
      if (night) {
        document.body.classList.add('mode-nuit');
      } else {
        document.body.classList.remove('mode-nuit');
      }
    };

    checkNightMode();
    const interval = setInterval(checkNightMode, 60000);

    const savedUser = localStorage.getItem('mboteEat_currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setEditForm({ 
        firstName: parsedUser.firstName, 
        lastName: parsedUser.lastName, 
        profilePhoto: parsedUser.profilePhoto || '' 
      });
      setView('map');
    }

    if (typeof firebase !== 'undefined') {
        const ratingsRef = firebase.database().ref('restaurant_ratings');
        ratingsRef.on('value', (snapshot: any) => {
            const data = snapshot.val();
            if (data) {
                setRestaurants(prev => prev.map(r => data[r.id] ? { ...r, ratingStats: data[r.id] } : r));
            }
        });
    }

    const savedOrders = localStorage.getItem('mboteEat_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(newLoc);
          (window as any).currentLat = newLoc.lat;
          (window as any).currentLng = newLoc.lng;
        },
        null,
        { enableHighAccuracy: true }
      );
    }

    return () => {
      clearInterval(interval);
      if (typeof firebase !== 'undefined') firebase.database().ref('restaurant_ratings').off();
    };
  }, []);

  const handleRateRestaurant = async (restaurantId: number, noteClient: number) => {
    if (typeof firebase === 'undefined') return false;
    const ratingRef = firebase.database().ref(`restaurant_ratings/${restaurantId}`);
    try {
        await ratingRef.transaction((currentData: any) => {
            const initial = currentData || restaurants.find(r => r.id === restaurantId)?.ratingStats || { total_points: 0, nombre_avis: 0, note_moyenne: 0 };
            const newTotal = (initial.total_points || 0) + noteClient;
            const newCount = (initial.nombre_avis || 0) + 1;
            return {
                total_points: newTotal,
                nombre_avis: newCount,
                note_moyenne: Math.round((newTotal / newCount) * 10) / 10
            };
        });
        return true;
    } catch (error) {
        console.error("Erreur transaction rating:", error);
        return false;
    }
  };

  const handleSendMessageToAi = async () => {
    if (!userInput.trim()) return;
    const userText = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsAiLoading(true);
    const aiResponse = await getAiRecommendation(userText, orders);
    setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsAiLoading(false);
  };

  const addToCart = (newItem: CartItem) => {
    setCart(prev => {
      if (prev.length > 0 && prev[0].restaurantId !== newItem.restaurantId) {
        if (window.confirm("Changer de restaurant videra votre panier actuel. Continuer ?")) {
          return [newItem];
        }
        return prev;
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const handleCheckout = (deliveryFee: number, total: number) => {
    if (cart.length === 0) return;
    const finalLat = userLocation?.lat || (window as any).currentLat;
    const finalLng = userLocation?.lng || (window as any).currentLng;
    if (!finalLat) { alert("Attendez que le GPS vous localise..."); return; }

    const restaurantActuel = restaurants.find(r => r.id === cart[0].restaurantId);
    if (!restaurantActuel) return;
    
    const newOrder: Order = {
      id: `CMD-${Math.floor(Math.random() * 1000000)}`,
      restaurantId: restaurantActuel.id,
      restaurantName: restaurantActuel.nom,
      items: [...cart],
      subtotal: total - deliveryFee,
      deliveryFee,
      total,
      deliveryMode: selectedDelivery,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    if (typeof firebase !== 'undefined') {
        firebase.database().ref('commandes').push({
            client: user ? `${user.firstName} ${user.lastName}` : "Client Mbote",
            telephone: user?.phone || "Inconnu",
            plat: cart.map(i => `${i.quantity}x ${i.nom}`).join(', '),
            prix_total: total,
            restau_nom: restaurantActuel.nom,
            lat: finalLat, lng: finalLng,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            const updatedOrders = [newOrder, ...orders];
            setOrders(updatedOrders);
            localStorage.setItem('mboteEat_orders', JSON.stringify(updatedOrders));
            setCart([]);
            setIsCartOpen(false);
            setShowOrderToast(true);
            setTimeout(() => setShowOrderToast(false), 5100); 
        });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profilePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !editForm.firstName) return;
    const phoneKey = user.phone.replace(/\s/g, '');
    try {
      if (typeof firebase !== 'undefined') {
        await firebase.database().ref('utilisateurs/' + phoneKey).update(editForm);
        const updatedUser = { ...user, ...editForm };
        setUser(updatedUser);
        localStorage.setItem('mboteEat_currentUser', JSON.stringify(updatedUser));
        setIsEditingProfile(false);
        alert("Profil mis à jour !");
      }
    } catch (e) { alert("Erreur mise à jour"); }
  };

  const logout = () => {
    localStorage.removeItem('mboteEat_currentUser');
    setUser(null);
    setView('welcome');
  };

  if (view === 'welcome') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-between p-8 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Fd36tnp772eyphs.cloudfront.net%2Fblogs%2F1%2F2020%2F04%2FTour-de-lEchangeur-in-Kinshasa-in-the-Democratic-Republic-of-the-Congo.jpg&sp=1775691145Tcfe7903553169d28b0f701a987dcf8c7501b9508201716332eda4f11ab7c177c')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="relative z-10 text-center mt-20">
          <div className="w-24 h-24 bg-yellow-400 rounded-[2rem] mx-auto mb-6 flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.5)] rotate-3 overflow-hidden"><span className="text-5xl font-black text-black"><img src={photologo2} alt="logo" className="w-100 h-100 rounded-xl" /></span></div>
          <h1 className="text-6xl font-black text-white mb-2 tracking-tighter uppercase leading-none">MboteEat</h1>
          <p className="text-white font-medium text-lg opacity-90 tracking-tight">Le meilleur de la street-food congolaise</p>
        </div>
        <div className="relative z-10 w-full max-w-sm space-y-4 mb-10">
          <button onClick={() => setView('login')} className="w-full bg-yellow-400 text-black py-6 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all">CONNEXION</button>
          <button onClick={() => setView('signup')} className="w-full bg-white/10 backdrop-blur-md text-white py-6 rounded-3xl font-black text-xl border-2 border-white/20 active:scale-95 transition-all">S'INSCRIRE</button>
        </div>
      </div>
    );
  }

  if (view === 'login' || view === 'signup' || view === 'forgot-password') {
    return <Auth view={view as any} setView={setView} onAuthComplete={(u) => { setUser(u); setEditForm({firstName: u.firstName, lastName: u.lastName, profilePhoto: u.profilePhoto || ''}); setView('map'); }} />;
  }

  // LOGIQUE DE VISIBILITÉ STRICTE : Uniquement sur la carte, pas en cours de commande, pas panier ouvert
  const isNavbarActive = view === 'map' && !selectedRestaurant && !isCartOpen;
  const welcomeText = isNightMode ? "Bonsoir chef ! Léo est prêt pour la livraison de nuit. On mange quoi ?" : "C'est Léo, je suis dans la place. Quoi de neuf, chef ?";
  const logo_day_night= isNightMode ? photologo2 : photologo1
  // nat-top
  return (
    <div className="fixed inset-0 bg-white flex flex-col h-full overflow-hidden">
      {showOrderToast && (
        <div className="fixed top-8 left-4 right-4 z-[2000] flex justify-center animate-notification">
          <div className="w-full max-w-[340px] bg-black/80 backdrop-blur-3xl p-5 rounded-[2.5rem] shadow-2xl flex items-center gap-5 border border-white/10 ring-1 ring-yellow-400/20">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shrink-0"><Bell size={24} className="text-black animate-ring" /></div>
            <div className="flex-1">
              <p className="font-black text-[10px] text-yellow-400 uppercase tracking-[0.2em] mb-0.5">Notification</p>
              <p className="font-black text-[11px] text-white uppercase tracking-wider leading-tight">COMMANDE VALIDÉ, LE LIVREUR ARRIVE</p>
            </div>
          </div>
        </div>
      )}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[100]">
        <div className="bg-black px-0.5 py-0.5 rounded-2xl shadow-xl font-black text-sm tracking-widest border border-white overflow-hidden/10"><img src={photologo1} alt="mboteeat logo"  className="rounded-xl w-100 h-10" /></div>
        <div className="flex gap-3">
          <button onClick={() => setIsAiVisible(!isAiVisible)} className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all ${isAiVisible ? 'bg-yellow-400 text-black' : 'bg-white text-gray-400'}`}><Sparkles size={26} /></button>
          <button onClick={() => setIsCartOpen(true)} className="bg-white w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center relative border border-gray-100">
            <ShoppingCart size={26} className="text-black" />
            {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[11px] w-7 h-7 rounded-full flex items-center justify-center border-4 border-white font-black">{cart.length}</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <Map userLocation={userLocation} onRestaurantSelect={setSelectedRestaurant} />
        {isAiVisible && (
          <div className="absolute right-6 left-6 bottom-36 max-h-[350px] z-[200] bg-white/95 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="bg-black text-white p-5 flex justify-between items-center">
               <div className="flex items-center gap-3"><div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-black text-xs"><img src={logo_day_night} alt="Léo" className="w-10 h-10 rounded-xl "/></div><h3 className="font-black text-sm uppercase tracking-widest">Léo - MboteEat</h3></div>
               <button onClick={() => setIsAiVisible(false)} className="p-3"><X size={22}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
               {chatMessages.length === 0 && <p className="text-center text-gray-400 font-bold text-sm italic opacity-50">"{welcomeText}"</p>}
               {chatMessages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-5 rounded-[2rem] font-bold text-sm shadow-sm ${msg.role === 'user' ? 'bg-yellow-400 text-black rounded-tr-none' : 'bg-gray-50 text-black rounded-tl-none'}`}>{msg.text}</div>
                 </div>
               ))}
               <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
               <input value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessageToAi()} placeholder="Koma nini ozo kanisa..." className="flex-1 bg-gray-50 rounded-2xl px-6 py-4 text-sm font-bold text-black outline-none" />
               <button onClick={handleSendMessageToAi} className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center"><Send size={22} /></button>
            </div>
          </div>
        )}
      </div>

      {/* NAVBAR : Elle est toujours rendue si l'utilisateur existe, mais l'état active/hidden gère l'animation */}
      {user && (
        <div className={`footer-nav ${!isNavbarActive ? 'hidden' : ''} relative`}>
          <button 
            onClick={() => setView('history')}
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${view === 'history' ? 'text-yellow-400 nav-active-glow scale-110' : 'text-white/40'}`}
          >
            <div className="div">
              <History size={26} color="white" id="History"/>
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest">Commandes</span>
          </button>
          
          <button 
            onClick={() => { setView('map'); setSelectedRestaurant(null); }} 
            className="map-center-btn"
          >
            <MapIcon size={26} className="text-black" />
          </button>
          
          <button 
            onClick={() => setView('profile')} 
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${view === 'profile' ? 'text-yellow-400 nav-active-glow scale-110' : 'text-white/40'}`}
          >
            <div className="div">
              <UserIcon size={26} color="white" id="userIcon"/>
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest">Profil</span>
          </button>
        </div>
      )}

      {/* INTERFACE HISTORIQUE */}
      {view === 'history' && (
        <div className="fixed inset-0 bg-white z-[600] flex flex-col p-8 animate-in slide-in-from-bottom duration-500 overflow-hidden">
           <div className="flex justify-between items-center mb-8 pt-6">
             <div><h2 className="text-4xl font-black text-black uppercase tracking-tighter">Historique</h2><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Tes délices passés</p></div>
             <button onClick={() => setView('map')} className="p-4 bg-black text-white rounded-[1.5rem]"><X size={24} /></button>
           </div>
           <div className="flex-1 overflow-y-auto space-y-4 pb-32 hide-scrollbar">
             {orders.length === 0 ? <div className="text-center opacity-10 mt-20"><History size={120} className="mx-auto mb-6" /><p className="font-black uppercase tracking-widest text-sm">Oza naino na commande moko te</p></div> : 
               orders.map(order => (
                 <div key={order.id} className="p-6 bg-gray-50 rounded-[2rem] border-2 border-gray-100 flex justify-between items-center">
                   <div className="space-y-1"><p className="font-black text-sm text-black uppercase">{order.restaurantName}</p><p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(order.timestamp).toLocaleDateString('fr-FR')} · {order.items.length} Plats</p></div>
                   <div className="text-right"><p className="font-black text-black text-xl">{order.total.toLocaleString()} <span className="text-[10px] opacity-40">FC</span></p><span className="inline-block px-3 py-1 bg-green-100 text-green-600 text-[8px] font-black rounded-full uppercase mt-1">LIVRÉ</span></div>
                 </div>
               ))}
           </div>
        </div>
      )}

      {/* INTERFACE PROFIL */}
      {view === 'profile' && (
        <div className="fixed inset-0 bg-white z-[600] flex flex-col p-8 animate-in slide-in-from-bottom duration-500 overflow-hidden">
           <div className="flex justify-between items-center mb-10 pt-6">
              <div><h2 className="text-4xl font-black text-black uppercase tracking-tighter">Profil</h2><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Membre MboteEat Gold</p></div>
              <button onClick={() => setView('map')} className="p-4 bg-black text-white rounded-[1.5rem]"><X size={24} /></button>
           </div>
           <div className="flex-1 overflow-y-auto space-y-8 pb-32 hide-scrollbar profile-card">
              <div className="relative p-1 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-[3rem] shadow-2xl">
                 <div className="bg-white rounded-[2.9rem] p-8 flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl mb-6">
                       <img src={user?.profilePhoto || "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=300&q=80"} className="w-full h-full object-cover" alt="Profile" />
                    </div>
                    <h3 className="text-3xl font-black text-black uppercase tracking-tighter">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-gray-400 font-black text-[11px] tracking-widest mt-2 flex items-center justify-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {user?.phone}
                    </p>
                 </div>
              </div>
              <div className="space-y-4">
                 <button onClick={() => setIsEditingProfile(true)} className="w-full p-6 bg-black text-white rounded-3xl flex justify-between items-center shadow-lg active:scale-95 transition-all">
                    <span className="flex items-center gap-4"><UserIcon size={20}/><span className="text-xs font-black uppercase tracking-widest">Modifier mes infos</span></span><ChevronRight size={20} />
                 </button>
                 
                 <button onClick={logout} className="w-full p-5 bg-red-50 text-red-600 rounded-2xl flex justify-between items-center border border-red-100 shadow-sm">
                    <span className="flex items-center gap-4"><LogOut size={18}/><span className="text-[11px] font-black uppercase tracking-widest">Déconnexion</span></span><ChevronRight size={18} />
                 </button>

                 <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col gap-4 overflow-hidden relative">
                    <Sparkles className="absolute -right-5 -top-5 w-32 h-32 opacity-10 rotate-12" />
                    <h4 className="text-xl font-black uppercase tracking-tighter">Support Client</h4>
                    <p className="text-[11px] font-bold opacity-70 leading-relaxed">Un problème avec ta commande ? Notre équipe est là 24h/24 pour te servir avec le sourire.</p>
                    <button 
                      onClick={() => window.open("https://wa.me/243993580222", "_blank")}
                      className="bg-yellow-400 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest mt-2 shadow-xl active:scale-95 transition-all"
                    >
                      Contactez-nous
                    </button>
                 </div>
              </div>
           </div>
           {isEditingProfile && (
             <div className="fixed inset-0 z-[1000] flex flex-col bg-white animate-in slide-in-from-right duration-500">
                <div className="p-8 flex justify-between items-center border-b border-gray-100">
                   <button onClick={() => setIsEditingProfile(false)} className="p-4 bg-gray-50 rounded-2xl"><X size={24}/></button>
                   <h2 className="text-xl font-black uppercase tracking-tighter">Modifier Profil</h2>
                   <button onClick={handleUpdateProfile} className="p-4 bg-yellow-400 rounded-2xl text-black shadow-lg"><Save size={24}/></button>
                </div>
                <div className="flex-1 p-8 space-y-8 overflow-y-auto hide-scrollbar">
                   <div className="flex flex-col items-center">
                      <div className="relative">
                         <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-yellow-400 shadow-2xl">
                            <img src={editForm.profilePhoto || "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=300&q=80"} className="w-full h-full object-cover" alt="Preview" />
                         </div>
                         <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center border-4 border-white cursor-pointer"><Camera size={20} /><input type="file" className="hidden" onChange={handleImageChange} accept="image/*" /></label>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <input value={editForm.firstName} onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))} className="w-full p-6 bg-gray-50 rounded-3xl font-black text-black outline-none border border-gray-100 focus:border-black transition-all" placeholder="Prénom" />
                      <input value={editForm.lastName} onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))} className="w-full p-6 bg-gray-50 rounded-3xl font-black text-black outline-none border border-gray-100 focus:border-black transition-all" placeholder="Nom" />
                   </div>
                   <button onClick={handleUpdateProfile} className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-xl uppercase tracking-tighter mt-4 shadow-2xl active:scale-95">Enregistrer les changements</button>
                </div>
             </div>
           )}
        </div>
      )}

      {selectedRestaurant && (
        <RestaurantPage 
            restaurant={restaurants.find(r => r.id === selectedRestaurant.id) || selectedRestaurant} 
            onBack={() => setSelectedRestaurant(null)} 
            onAddToCart={addToCart} 
            cart={cart} 
            onRate={handleRateRestaurant}
        />
      )}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onRemove={(index) => setCart(prev => prev.filter((_, i) => i !== index))} onCheckout={handleCheckout} userLocation={userLocation} selectedDelivery={selectedDelivery} onSelectDelivery={setSelectedDelivery} />
    </div>
  );
};

export default App;
