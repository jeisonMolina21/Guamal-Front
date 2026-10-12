import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Compass, ExternalLink, Sparkles, Navigation } from 'lucide-react';
import './TourismGallery.css';

interface TouristSpot {
  id: string;
  title: string;
  category: string;
  distance: string;
  badge: string;
  description: string;
  imageUrl: string;
  mapsQuery: string;
}

const TOURIST_SPOTS: TouristSpot[] = [
  {
    id: 'humadea',
    title: 'Río Humadea & Balnearios',
    category: 'Río & Balnearios',
    distance: 'A 10 min de Villa MCJ',
    badge: 'Imprescindible',
    description: 'Famoso por sus aguas cristalinas y templadas que descienden de la cordillera. Disfruta de pozos naturales, tradicionales paseos de olla y restaurantes a la orilla del río con sancocho criollo y mojarra.',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=900&auto=format&fit=crop',
    mapsQuery: 'Rio+Humadea+Guamal+Meta'
  },
  {
    id: 'cacao',
    title: 'Ruta del Cacao & Chocolatería',
    category: 'Agroturismo & Cacao',
    distance: 'A 12 min de Villa MCJ',
    badge: 'Tradición',
    description: 'Guamal es la Capital Cacaotera del Meta y sede del Festival Nacional del Cacao. Recorre plantaciones campesinas, degusta el fruto fresco y disfruta catas de chocolate artesanal fino de aroma.',
    imageUrl: 'https://images.unsplash.com/photo-1548695607-9c73430ba065?q=80&w=900&auto=format&fit=crop',
    mapsQuery: 'Ruta+del+cacao+Guamal+Meta'
  },
  {
    id: 'lajosa',
    title: 'Cascada La Lajosa & Cañón Río Guamal',
    category: 'Cascadas & Senderismo',
    distance: 'A 20 min de Villa MCJ',
    badge: 'Ecoturismo',
    description: 'Imponentes caídas de agua natural, pozos color esmeralda y senderos ecológicos del piedemonte donde podrás realizar senderismo, avistar tucanes y refrescarte en piscinas naturales.',
    imageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=900&auto=format&fit=crop',
    mapsQuery: 'Rio+Guamal+Meta'
  },
  {
    id: 'gastronomia',
    title: 'Gastronomía: Mamona & Pan de Arroz',
    category: 'Sabor Llanero',
    distance: 'Casco Urbano (5 min)',
    badge: 'Auténtico',
    description: 'Degusta la inconfundible carne a la llanera (mamona) asada lentamente a la leña en chuzos de madera, carne a la perra, tungos de plátano y el crujiente pan de arroz recién horneado.',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=900&auto=format&fit=crop',
    mapsQuery: 'Restaurantes+Guamal+Meta'
  },
  {
    id: 'amanecer',
    title: 'Amaneceres Llaneros & Safari Fotográfico',
    category: 'Fauna & Paisaje',
    distance: 'Sabanas de Guamal',
    badge: 'Fotografía',
    description: 'Cielos infinitos que se tiñen de dorado y violeta al despuntar el día. En los esteros y sabanas cercanas podrás avistar manadas de chigüiros, corocoras rojas, garzas reales y monos aulladores.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=900&auto=format&fit=crop',
    mapsQuery: 'Mirador+Guamal+Meta'
  },
  {
    id: 'vaqueria',
    title: 'Manga de Coleo & Cultura de Joropo',
    category: 'Folclor Llanero',
    distance: 'A 8 min de Villa MCJ',
    badge: 'Orgullo Llanero',
    description: 'Siente la adrenalina del coleo llanero en las mangas tradicionales, al ritmo de arpa, cuatro, maracas y copla vaquera, con presentaciones de baile de joropo zapateado de talla nacional.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=900&auto=format&fit=crop',
    mapsQuery: 'Manga+de+coleo+Guamal+Meta'
  }
];

export function TourismGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDown.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftPos.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  return (
    <section className="tourism-section" id="turismo-guamal">
      <div className="tourism-container">
        
        {/* Header */}
        <div className="tourism-header">
          <div>
            <div className="tourism-tag">
              <Compass size={16} />
              <span>Explora el Llano desde Villa MCJ</span>
            </div>
            <h2 className="tourism-title">
              Destinos & Turismo en Guamal
            </h2>
            <p className="tourism-subtitle">
              Guamal, Meta, es tierra de ríos cristalinos, cacao de exportación, atardeceres mágicos y folclor llanero. Descubre los sitios más emblemáticos a pocos minutos de nuestras cabañas.
            </p>
          </div>

          {/* Nav Controls */}
          <div className="tourism-controls">
            <button
              onClick={() => scroll('left')}
              aria-label="Anterior atractivo turístico"
              className="tourism-nav-btn"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Siguiente atractivo turístico"
              className="tourism-nav-btn"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* Horizontal Track Gallery */}
        <div 
          className="tourism-track cursor-grab active:cursor-grabbing" 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
        >
          {TOURIST_SPOTS.map((spot) => (
            <article key={spot.id} className="tourism-card group">
              
              {/* Photo & Badges */}
              <div className="tourism-card-img-wrap">
                <img
                  src={spot.imageUrl}
                  alt={spot.title}
                  className="tourism-card-img"
                  loading="lazy"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/hero-cabanas.jpg';
                  }}
                />
                <div className="tourism-card-overlay"></div>

                <div className="tourism-badge-distance">
                  <MapPin size={13} style={{ color: '#1E3A34' }} />
                  <span>{spot.distance}</span>
                </div>

                <div className="tourism-badge-highlight">
                  <span>{spot.badge}</span>
                </div>

                <span className="tourism-category">{spot.category}</span>
              </div>

              {/* Content */}
              <div className="tourism-card-body">
                <h3 className="tourism-card-title">{spot.title}</h3>
                <p className="tourism-card-desc">{spot.description}</p>
                
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${spot.mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tourism-card-btn"
                >
                  <Navigation size={15} />
                  <span>Cómo llegar en Google Maps</span>
                  <ExternalLink size={13} style={{ opacity: 0.7 }} />
                </a>
              </div>

            </article>
          ))}
        </div>

        {/* Footer info helper */}
        <div className="tourism-footer-info">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} style={{ color: '#1E3A34' }} />
            Desplaza horizontalmente o arrastra para ver los 6 atractivos turísticos
          </span>
          <a
            href="/guamal"
            style={{ fontWeight: 700, color: '#1E3A34', textDecoration: 'underline' }}
          >
            Ver guía completa de Guamal, Meta →
          </a>
        </div>

      </div>
    </section>
  );
}
