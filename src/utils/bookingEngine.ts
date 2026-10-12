export interface Property {
  id: string;
  name: string;
  capacity: number;
  pricePerNight: number;
}

export interface BookingBundle {
  id: string;
  type: 'SINGLE' | 'BUNDLE';
  properties: Property[];
  totalCapacity: number;
  totalPrice: number;
  description: string;
}
import { API_URL } from '../services/api';


const FALLBACK_PROPERTIES: Property[] = [
  { id: 'casa-1', name: 'Casa Ceiba', capacity: 4, pricePerNight: 180000 },
  { id: 'casa-2', name: 'Casa Samán', capacity: 5, pricePerNight: 200000 },
  { id: 'casa-3', name: 'Casa Moriche', capacity: 6, pricePerNight: 250000 },
];

/**
 * Fetches available properties for the given dates from the backend.
 */
export async function getAvailableCapacity(checkIn: string, checkOut: string): Promise<number> {
  if (!checkIn || !checkOut) return 0;
  
  try {
    const res = await fetch(`${API_URL}/properties?checkIn=${checkIn}&checkOut=${checkOut}`);
    if (res.ok) {
      const properties: Property[] = await res.json();
      if (Array.isArray(properties) && properties.length > 0) {
        return properties.reduce((acc, prop) => acc + (prop.capacity || 0), 0);
      }
    }
  } catch (error) {
    // Ignore network error and use fallback
  }

  return FALLBACK_PROPERTIES.reduce((acc, prop) => acc + prop.capacity, 0);
}

/**
 * Finds the best property or combination of properties for the requested guests from backend data.
 */
export async function findBookingBundles(guestsCount: number, checkIn: string, checkOut: string): Promise<BookingBundle[]> {
  const bundles: BookingBundle[] = [];
  let availableProps: Property[] = [];
  
  try {
    const res = await fetch(`${API_URL}/properties?checkIn=${checkIn}&checkOut=${checkOut}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        availableProps = data;
      }
    }
  } catch (error) {
    // Fallback if backend offline
  }

  if (availableProps.length === 0) {
    availableProps = FALLBACK_PROPERTIES;
  }

  // 1. Single properties that fit the requested guests
  const singles = availableProps.filter(p => p.capacity >= guestsCount);
  singles.forEach(p => {
    bundles.push({
      id: p.id,
      type: 'SINGLE',
      properties: [p],
      totalCapacity: p.capacity,
      totalPrice: p.pricePerNight,
      description: `Ideal para tu grupo en una sola casa.`
    });
  });

  // 2. Combinations if needed or for multi-house booking
  if ((singles.length === 0 || guestsCount > 5) && guestsCount > 0) {
    const sorted = [...availableProps].sort((a, b) => b.capacity - a.capacity);
    let currentCapacity = 0;
    let currentPrice = 0;
    const selected: Property[] = [];

    for (const prop of sorted) {
      if (currentCapacity < guestsCount) {
        selected.push(prop);
        currentCapacity += prop.capacity;
        currentPrice += prop.pricePerNight;
      }
    }

    if (currentCapacity >= guestsCount && selected.length > 1) {
      bundles.push({
        id: 'bundle-' + Date.now(),
        type: 'BUNDLE',
        properties: selected,
        totalCapacity: currentCapacity,
        totalPrice: currentPrice,
        description: `Paquete Grupo: ${selected.map(s => s.name).join(' + ')}`
      });
    }
  }

  return bundles;
}
