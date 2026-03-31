
import React, { useMemo } from 'react';
import { CartItem, Restaurant } from '../types';
import { X, ShoppingBag, MapPin, Trash2, Lock } from 'lucide-react';
import { POINTS_DE_VENTE, SPICE_LABELS } from '../constants';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (index: number) => void;
  onCheckout: (deliveryFee: number, total: number) => void;
  userLocation: { lat: number; lng: number } | null;
  selectedDelivery: string;
  onSelectDelivery: (mode: string) => void;
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, onClose, cart, onRemove, onCheckout, userLocation, selectedDelivery, onSelectDelivery 
}) => {
  const deliveryInfo = useMemo(() => {
    if (cart.length === 0 || !userLocation) return { distance: 0, bikeAvailable: false, motoPrice: 3500 };
    const restaurant = POINTS_DE_VENTE.find(r => r.id === cart[0].restaurantId);
    if (!restaurant) return { distance: 0, bikeAvailable: false, motoPrice: 3500 };

    const distance = calculateDistance(
      userLocation.lat, userLocation.lng,
      restaurant.coord.lat, restaurant.coord.lng
    );

    const stabilizedKm = Math.ceil(distance);

    return {
      distance: Math.round(distance * 10) / 10,
      bikeAvailable: distance < 3, // Vélo débloqué si < 3km
      motoPrice: 2500 + (stabilizedKm * 500)
    };
  }, [cart, userLocation]);

  const subtotal = cart.reduce((sum, item) => sum + (item.prix * item.quantity), 0);
  const deliveryFee = selectedDelivery === 'moto' ? deliveryInfo.motoPrice : 2500;
  const total = subtotal + (cart.length > 0 ? deliveryFee : 0);

  return (
    <div className={`fixed inset-0 z-[1000] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col rounded-l-[3.5rem]`}>
        <div className="p-8 flex justify-between items-center border-b border-gray-50">
          <div>
            <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Panier</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cart.length} plats sélectionnés</p>
          </div>
          <button onClick={onClose} className="p-4 bg-gray-50 text-black rounded-2xl active:scale-90 transition-all"><X size={24} strokeWidth={3}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 text-black">
              <ShoppingBag size={100} strokeWidth={1} className="mb-6" />
              <p className="font-black text-xl uppercase tracking-widest">Panier vide</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 bg-gray-900 text-white rounded-[1.8rem] shadow-xl">
                <MapPin size={22} className="text-yellow-400" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Livraison</p>
                  <p className="text-xs font-black">{deliveryInfo.distance} km</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-gray-100 shadow-sm relative group animate-in slide-in-from-right duration-300">
                    <img src={item.image} alt={item.nom} className="w-20 h-20 object-cover rounded-2xl shadow-md shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-black text-sm tracking-tight leading-none mb-1 truncate">{item.nom}</h3>
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{SPICE_LABELS[item.spiceLevel]} · Qté: {item.quantity}</p>
                      <p className="text-lg font-black text-black mt-2">{(item.prix * item.quantity).toLocaleString()} <span className="text-[10px] opacity-30">FC</span></p>
                    </div>
                    <button 
                      onClick={() => onRemove(idx)}
                      className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center active:scale-75 transition-all hover:bg-red-500 hover:text-white"
                      title="Supprimer"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 bg-white border-t border-gray-100 rounded-t-[3.5rem] shadow-2xl">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                disabled={!deliveryInfo.bikeAvailable}
                onClick={() => onSelectDelivery('bike')}
                className={`relative flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${selectedDelivery === 'bike' ? 'bg-yellow-400 border-yellow-400 text-black' : deliveryInfo.bikeAvailable ? 'bg-white border-gray-100 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'}`}
              >
                🚲 Vélo
                {!deliveryInfo.bikeAvailable && <Lock size={12} className="opacity-50" />}
              </button>
              <button
                onClick={() => onSelectDelivery('moto')}
                className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${selectedDelivery === 'moto' ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-gray-300'}`}
              >
                🏍️ Moto
              </button>
            </div>

            <div className="space-y-2 mb-6 text-sm px-2">
              <div className="flex justify-between font-bold text-gray-500"><span>Livraison</span><span>{deliveryFee.toLocaleString()} FC</span></div>
              <div className="flex justify-between font-black text-2xl text-black pt-4 border-t border-gray-100 uppercase tracking-tighter">
                <span>TOTAL</span>
                <span className="text-yellow-500">{total.toLocaleString()} FC</span>
              </div>
            </div>

            <button 
              onClick={() => onCheckout(deliveryFee, total)}
              className="w-full bg-black text-white py-6 rounded-[2.2rem] font-black text-xl flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all uppercase tracking-tighter"
            >
              Commander
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
