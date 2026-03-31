import React, { useState } from 'react';
import { Restaurant, CartItem } from '../types';
import { ArrowLeft, Star, Clock, Bike, MapPin, Music, ShoppingCart, Plus, Minus, Sparkles } from 'lucide-react';
import { SPICE_LABELS, SPICE_EMOJIS } from '../constants';

interface RestaurantPageProps {
  restaurant: Restaurant;
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
  cart: CartItem[];
  onRate: (id: number, note: number) => Promise<boolean>;
}

const RestaurantPage: React.FC<RestaurantPageProps> = ({ restaurant, onBack, onAddToCart, cart, onRate }) => {
  const [itemConfigs, setItemConfigs] = useState<Record<number, { level: number, type: 'powder' | 'liquid', quantity: number }>>({});
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  const getConfig = (itemId: number) => {
    const item = restaurant.menu.find(m => m.id === itemId);
    return itemConfigs[itemId] || { level: item?.defaultSpice || 0, type: 'liquid', quantity: 1 };
  };

  const updateConfig = (itemId: number, updates: any) => {
    setItemConfigs(prev => ({
      ...prev,
      [itemId]: { ...getConfig(itemId), ...updates }
    }));
  };

  const submitRating = async (note: number) => {
    if (hasRated || ratingLoading) return;
    setRatingLoading(true);
    const success = await onRate(restaurant.id, note);
    if (success) {
        setHasRated(true);
        // Animation locale gérée par CSS stars-pop
    }
    setRatingLoading(false);
  };

  const noteMoyenne = restaurant.ratingStats?.note_moyenne || 0;
  const totalAvis = restaurant.ratingStats?.nombre_avis || 0;

  return (
    <div className="fixed inset-0 bg-white z-[100] overflow-y-auto animate-in slide-in-from-right duration-500">
      <div className="relative h-80 overflow-hidden shadow-2xl">
        <img src={restaurant.image} alt={restaurant.nom} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
        <button 
          onClick={onBack}
          className="absolute top-10 left-6 bg-white text-black p-4 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] active:scale-90 transition-transform z-50 border-2 border-black/5"
        >
          <ArrowLeft size={28} strokeWidth={3} />
        </button>
        <div className="absolute bottom-10 left-8 right-8 text-white">
           <h1 className="text-4xl font-black tracking-tighter uppercase">{restaurant.nom}</h1>
           <p className="font-bold opacity-80 text-sm mt-1">{restaurant.type.toUpperCase()} · KINSHASA</p>
        </div>
      </div>

      <div className="px-6 pb-32 -mt-8 bg-white rounded-t-[3rem] relative z-10 pt-10">
        <div className="space-y-6">
          <p className="text-gray-900 font-bold leading-relaxed">{restaurant.description}</p>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star 
                    key={i} 
                    size={22} 
                    fill={i <= Math.round(noteMoyenne) ? "#FFD700" : "none"} 
                    className={i <= Math.round(noteMoyenne) ? "text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-sm font-black ml-2 uppercase tracking-widest text-black">
                {noteMoyenne} <span className="opacity-40">({totalAvis} Avis)</span>
              </span>
            </div>

            {/* Système de notation interactive */}
            {!hasRated ? (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Note ce restaurant, chef !</p>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <button
                                    key={i}
                                    onMouseEnter={() => setHoverRating(i)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => submitRating(i)}
                                    className={`transition-all active:scale-125 ${ratingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Star 
                                        size={28} 
                                        fill={i <= (hoverRating || 0) ? "#FFD700" : "none"} 
                                        className={`${i <= (hoverRating || 0) ? "text-yellow-400 scale-110" : "text-gray-300"} transition-all`}
                                    />
                                </button>
                            ))}
                        </div>
                        {hoverRating > 0 && <span className="text-xs font-black text-yellow-600 animate-pulse uppercase tracking-widest">{hoverRating}/5</span>}
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center gap-3 animate-stars-pop">
                    <Sparkles className="text-green-500" size={18} />
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Merci pour ton avis, chef !</p>
                </div>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl whitespace-nowrap shadow-xl">
              <Clock size={20} className="text-yellow-400" />
              <span className="text-xs font-black uppercase tracking-widest">10h - 23h</span>
            </div>
            <div className="flex items-center gap-3 bg-white text-black px-6 py-4 rounded-2xl whitespace-nowrap border-2 border-gray-100 shadow-sm">
              <Bike size={20} className="text-yellow-500" />
              <span className="text-xs font-black uppercase tracking-widest">25 MIN</span>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-8">
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase mb-6">La Carte</h2>
          {restaurant.menu.map(item => {
            const config = getConfig(item.id);
            return (
              <div key={item.id} className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-6 flex flex-col gap-6 shadow-sm">
                <div className="flex gap-6">
                  <img src={item.image} alt={item.nom} className="w-28 h-28 object-cover rounded-3xl shadow-xl border-2 border-white" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-black text-xl text-black tracking-tighter leading-none">{item.nom}</h3>
                    </div>
                    <p className="text-gray-900 font-black text-xl text-yellow-600 mb-2">{item.prix.toLocaleString()} <span className="text-xs opacity-50 uppercase">Fc</span></p>
                    <p className="text-xs text-gray-500 font-bold line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-50 space-y-5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-black">
                      <span>Niveau de Piment: {SPICE_LABELS[config.level]}</span>
                      <span className="text-xl">{SPICE_EMOJIS[config.level]}</span>
                    </div>
                    <input type="range" min="0" max="4" value={config.level} onChange={(e) => updateConfig(item.id, { level: parseInt(e.target.value) })} className="w-full accent-black h-2 rounded-full cursor-pointer" />
                    <div className="flex gap-4">
                      <button onClick={() => updateConfig(item.id, { type: 'powder' })} className={`flex-1 py-4 text-xs font-black rounded-2xl border-2 transition-all ${config.type === 'powder' ? 'bg-black border-black text-white shadow-xl' : 'border-gray-100 text-gray-400'}`}>POUDRE</button>
                      <button onClick={() => updateConfig(item.id, { type: 'liquid' })} className={`flex-1 py-4 text-xs font-black rounded-2xl border-2 transition-all ${config.type === 'liquid' ? 'bg-black border-black text-white shadow-xl' : 'border-gray-100 text-gray-400'}`}>SAUCE</button>
                    </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-2 quantity-selector">
                    <button onClick={() => updateConfig(item.id, { quantity: Math.max(1, config.quantity - 1) })} className="p-2 text-black active:scale-90"><Minus size={18} strokeWidth={3} /></button>
                    <span className="mx-4 font-black text-lg w-6 text-center text-black">{config.quantity}</span>
                    <button onClick={() => updateConfig(item.id, { quantity: config.quantity + 1 })} className="p-2 text-black active:scale-90"><Plus size={18} strokeWidth={3} /></button>
                  </div>
                  <button onClick={() => onAddToCart({ ...item, quantity: config.quantity, spiceLevel: config.level, spiceType: config.type, restaurantId: restaurant.id, restaurantName: restaurant.nom })} className="flex-1 bg-yellow-400 text-black py-5 rounded-3xl font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-yellow-500 transition-all active:scale-95 uppercase tracking-widest">Ajouter ({config.quantity})</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;