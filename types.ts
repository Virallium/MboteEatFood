export interface User {
  firstName: string;
  lastName: string;
  phone: string;
  profilePhoto?: string;
}

export interface MenuItem {
  id: number;
  nom: string;
  description: string;
  prix: number;
  image: string;
  defaultSpice: number;
}

export interface Restaurant {
  id: number;
  nom: string;
  type: 'malewa' | 'poulet' | 'nganda' | 'mbisi';
  coord: { lat: number; lng: number };
  description: string;
  image: string;
  menu: MenuItem[];
  ratingStats?: {
    total_points: number;
    nombre_avis: number;
    note_moyenne: number;
  };
}

export interface CartItem extends MenuItem {
  quantity: number;
  spiceLevel: number;
  spiceType: 'powder' | 'liquid';
  restaurantId: number;
  restaurantName: string;
}

export interface Order {
  id: string;
  restaurantId: number;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMode: string;
  timestamp: string;
  status: 'pending' | 'delivered';
}

export type ViewState = 'welcome' | 'login' | 'signup' | 'forgot-password' | 'map' | 'profile' | 'history' | 'edit-profile';