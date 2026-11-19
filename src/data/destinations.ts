export interface DestinationSpot {
  id: string;
  name: string;
  category: 'Río & Balneario' | 'Cascadas' | 'Gastronomía' | 'Cultura & Aventura';
  distanceMinutes: number;
  highlight: string;
  description: string;
  imageUrl: string;
  mapsQuery: string;
  badge: string;
  tips: string;
}

/**
 * Authentic, georeferenced ecotourism spots in Guamal, Meta (Piedemonte Llanero).
 * Verified with official municipal tourism data (turismoguamalmeta.com).
 */
export const GUAMAL_DESTINATIONS: DestinationSpot[] = [
  {
    id: 'rio-humadea',
    name: 'Río Humadea & Malecón Turístico',
    category: 'Río & Balneario',
    distanceMinutes: 10,
    highlight: 'Aguas cristalinas del Sumapaz',
    description: 'El principal atractivo natural de Guamal. Pozos profundos de agua pura y templada que desciende de la cordillera, riberas de piedra para descanso y quioscos gastronómicos.',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200&auto=format&fit=crop',
    mapsQuery: 'Centro+Turistico+Humadea+Guamal+Meta',
    badge: 'Imperdible #1',
    tips: 'Ideal para paseo de olla, nadar en aguas calmas y tomar fotos en el parador "Yo Amo Guamal".'
  },
  {
    id: 'cascada-monserrate',
    name: 'Cascada Monserrate Bajo',
    category: 'Cascadas',
    distanceMinutes: 25,
    highlight: 'Senderismo & Pozo Esmeralda',
    description: 'Impresionante caída de agua oculta en los bosques del piedemonte andino-orinocense. Senderos ecológicos entre aves exóticas, orquídeas y piscinas de baño natural.',
    imageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=1200&auto=format&fit=crop',
    mapsQuery: 'Cascada+Monserrate+Bajo+Guamal+Meta',
    badge: 'Aventura & Senderismo',
    tips: 'Llevar calzado de agua o trekking. Recomendado salir a primera hora de la mañana.'
  },
  {
    id: 'el-guamalazo',
    name: 'Ruta Gastronómica & "El Guamalazo"',
    category: 'Gastronomía',
    distanceMinutes: 5,
    highlight: 'Carne a la Llanera & Fusión Criolla',
    description: 'Sabores auténticos en restaurantes típicos como La Talanquera y Uuy. Degusta la mamona asada en chuzos a leña, pan de arroz crujiente y "El Guamalazo" con carne oreada.',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop',
    mapsQuery: 'Restaurantes+Campestres+Guamal+Meta',
    badge: 'Sabor Auténtico',
    tips: 'Acompañar con masato criollo fresco o jugo de cítricos locales recién cosechados.'
  },
  {
    id: 'ruta-cacao',
    name: 'Ruta Agroturística del Cacao',
    category: 'Cultura & Aventura',
    distanceMinutes: 12,
    highlight: 'Capital Cacaotera del Meta',
    description: 'Guamal es reconocido por sus plantaciones de cacao fino de aroma. Vive un recorrido guiado por fincas campesinas, cata de chocolates artesanales y proceso de cosecha.',
    imageUrl: 'https://images.unsplash.com/photo-1548695607-9c73430ba065?q=80&w=1200&auto=format&fit=crop',
    mapsQuery: 'Ruta+del+Cacao+Guamal+Meta',
    badge: 'Agroturismo',
    tips: 'Compra barras de chocolate 70% artesanal y derivados para llevar a casa.'
  },
  {
    id: 'rio-orotoy',
    name: 'Balneario Natural Río Orotoy',
    category: 'Río & Balneario',
    distanceMinutes: 15,
    highlight: 'Remansos serenos y sombra natural',
    description: 'Una corriente tranquila rodeada de vegetación autóctona, ideal para familias con niños pequeños que buscan un baño sereno lejos del bullicio urbano.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    mapsQuery: 'Rio+Orotoy+Guamal+Meta',
    badge: 'Plan Familiar',
    tips: 'Excelente zona para avistamiento de aves al atardecer.'
  },
  {
    id: 'amanecer-llanero',
    name: 'Amaneceres & Safaris en Sabana',
    category: 'Cultura & Aventura',
    distanceMinutes: 10,
    highlight: 'Cielos dorados y fauna orinocense',
    description: 'Horizontes infinitos donde el sol tiñe el cielo de violeta y naranja. Avistamiento de chigüiros, corocoras rojas, garzas blancas y bandadas de loros llaneros.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
    mapsQuery: 'Sabanas+de+Guamal+Meta',
    badge: 'Fotografía Paisajística',
    tips: 'Despiértate a las 5:30 am en Villa MCJ para contemplar el amanecer desde tu hamaca.'
  }
];
