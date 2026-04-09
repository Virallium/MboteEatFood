import { Restaurant, MenuItem } from './types';

export const COLORS = {
  primary: '#FFD700',
  secondary: '#000000',
  spice: '#FF4500',
  success: '#28a745',
  danger: '#dc3545',
  mbisi: '#0077FF',
};

// ... menus existants inchangés ...
const MENU_NGANDA: MenuItem[] = [
  { id: 10, nom: "Ntaba", description: "Viande de chèvre grillée", prix: 9500, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80", defaultSpice: 3 },
  { id: 11, nom: "Ngulu", description: "Porc grillé croustillant", prix: 8000, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80", defaultSpice: 3 },
  { id: 12, nom: "Soso", description: "Poulet local grillé", prix: 8500, image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80", defaultSpice: 2 },
  { id: 13, nom: "Cuisse", description: "Cuisse de poulet grillée", prix: 4500, image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80", defaultSpice: 2 },
  { id: 14, nom: "Kwanga", description: "Pain de manioc", prix: 1500, image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80", defaultSpice: 0 },
];

const MENU_POULET_MAYO: MenuItem[] = [
  { id: 20, nom: "Poulet mayo entier", description: "Poulet complet à la mayonnaise", prix: 28000, image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80", defaultSpice: 1 },
  { id: 21, nom: "Poulet mayo demi", description: "Demi poulet à la mayonnaise", prix: 15000, image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80", defaultSpice: 1 },
  { id: 22, nom: "Cuisse", description: "Cuisse de poulet mayo", prix: 7500, image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80", defaultSpice: 1 },
  { id: 23, nom: "Kwanga", description: "L'accompagnement classique", prix: 1500, image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80", defaultSpice: 0 },
];

const MENU_MBISI: MenuItem[] = [
  { id: 40, nom: "Liboke mbisi", description: "Poisson en papillote", prix: 12000, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80", defaultSpice: 3 },
  { id: 41, nom: "Tilapia", description: "Tilapia frais grillé", prix: 25000, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80", defaultSpice: 1 },
  { id: 42, nom: "Évida", description: "Poisson fumé/séché", prix: 14000, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80", defaultSpice: 2 },
  { id: 43, nom: "Tomson", description: "Chinchard du fleuve", prix: 6000, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80", defaultSpice: 3 },
  { id: 44, nom: "Kwanga", description: "L'indispensable du fleuve", prix: 1500, image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80", defaultSpice: 0 },
];

export const POINTS_DE_VENTE: Restaurant[] = [
  { id: 1, nom: "Espoir Mayo - Lingwala", type: "poulet", coord: { lat: -4.316, lng: 15.296 }, description: "Référence du Poulet Mayo.", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80", menu: MENU_POULET_MAYO, ratingStats: { total_points: 1125, nombre_avis: 250, note_moyenne: 4.5 } },
  { id: 2, nom: "Nganda Bloc - Bandal", type: "nganda", coord: { lat: -4.336, lng: 15.281 }, description: "Ntaba et Ngulu grillés au charbon.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80", menu: MENU_NGANDA, ratingStats: { total_points: 1150, nombre_avis: 250, note_moyenne: 4.6 } },
  { id: 3, nom: "Le Capitaine - Kinkole", type: "mbisi", coord: { lat: -4.368, lng: 15.420 }, description: "Poissons frais du port de Kinkole.", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80", menu: MENU_MBISI, ratingStats: { total_points: 1100, nombre_avis: 250, note_moyenne: 4.4 } },
  { id: 4, nom: "Rive Nord - Gombe", type: "mbisi", coord: { lat: -4.298, lng: 15.305 }, description: "Liboke Mbisi au bord du fleuve.", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80", menu: MENU_MBISI, ratingStats: { total_points: 1175, nombre_avis: 250, note_moyenne: 4.7 } },
  { id: 5, nom: "Tonton Mayo - Limete", type: "poulet", coord: { lat: -4.355, lng: 15.335 }, description: "Le Poulet Mayo de l'Échangeur.", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80", menu: MENU_POULET_MAYO, ratingStats: { total_points: 1100, nombre_avis: 250, note_moyenne: 4.4 } },
  { id: 6, nom: "Nganda Ambiance - Matonge", type: "nganda", coord: { lat: -4.328, lng: 15.308 }, description: "La cité en mouvement.", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80", menu: MENU_NGANDA, ratingStats: { total_points: 1225, nombre_avis: 250, note_moyenne: 4.9 } }
];

export const SPICE_LABELS = ['Doux', 'Léger', 'Moyen', 'Fort', 'Makasi'];
export const SPICE_EMOJIS = ['😇', '😊', '😋', '🔥', '💀'];