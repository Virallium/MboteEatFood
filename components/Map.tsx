
import React, { useEffect, useRef } from 'react';
import { Restaurant } from '../types';
import { POINTS_DE_VENTE } from '../constants';

interface MapProps {
  onRestaurantSelect: (restaurant: Restaurant) => void;
  userLocation: { lat: number; lng: number } | null;
}

const Map: React.FC<MapProps> = ({ onRestaurantSelect, userLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const L = (window as any).L;
    const initialCenter = userLocation || { lat: -4.325, lng: 15.322 };

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([initialCenter.lat, initialCenter.lng], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    // Effacer les markers des restaurants seulement au premier rendu ou si besoin
    // Pour optimiser, on ne recrée pas tout à chaque changement de userLocation
    const existingMarkers: any[] = [];
    mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker && layer !== userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(layer);
        }
    });

    // Ajouter les restaurants
    POINTS_DE_VENTE.forEach(restaurant => {
      let typeColor = '#000000';
      let label = 'P';
      
      switch(restaurant.type) {
        case 'poulet': 
          typeColor = '#FFD700'; label = 'P'; break;
        case 'nganda': 
          typeColor = '#FF4500'; label = 'N'; break;
        case 'mbisi': 
          typeColor = '#0077FF'; label = 'B'; break;
      }
      
      const iconHtml = `
        <div style="
          background: ${typeColor};
          width: 42px;
          height: 42px;
          border-radius: 16px;
          border: 4px solid white;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: ${restaurant.type === 'poulet' ? 'black' : 'white'};
          font-size: 18px;
          transition: all 0.2s;
        " onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1.0)';">
          ${label}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-map-icon',
        iconSize: [42, 42],
        iconAnchor: [21, 42]
      });

      const marker = L.marker([restaurant.coord.lat, restaurant.coord.lng], { icon: customIcon })
        .addTo(mapInstanceRef.current);

      marker.on('click', () => {
        onRestaurantSelect(restaurant);
        mapInstanceRef.current.flyTo([restaurant.coord.lat, restaurant.coord.lng], 15, { duration: 1 });
      });
    });

  }, []); // On ne recrée les restaurants qu'au montage

  // Gérer la position du client séparément pour la fluidité
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    const L = (window as any).L;

    // Icône Client Rouge stylisée
    const userIconHtml = `
      <div style="position: relative; width: 40px; height: 40px;">
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(239, 68, 68, 0.2);
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
        <div style="
          position: absolute;
          top: 10px;
          left: 10px;
          width: 20px;
          height: 20px;
          background: #ef4444;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
          z-index: 2;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      </style>
    `;

    const userIcon = L.divIcon({
      html: userIconHtml,
      className: 'user-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup("<div style='font-weight:900; font-family:Poppins; font-size:10px;'>VOUS ÊTES ICI</div>");
      
      // Premier centrage sur l'utilisateur
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [userLocation]);
  return <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />;
  
};

export default Map;
