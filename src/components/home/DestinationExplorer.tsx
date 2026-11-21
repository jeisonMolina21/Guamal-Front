/**
 * @fileoverview Territorio (Destinos)
 * @description Una foto grande y la lista completa de destinos cerca de la villa.
 * Todas las fotos están montadas y se cruzan por opacidad: cambiar de destino no espera a ninguna descarga.
 */

import React, { useState } from 'react';
import { GUAMAL_DESTINATIONS } from '../../data/destinations';

export function DestinationExplorer() {
  const [activeId, setActiveId] = useState(GUAMAL_DESTINATIONS[0].id);
  const active = GUAMAL_DESTINATIONS.find((d) => d.id === activeId) ?? GUAMAL_DESTINATIONS[0];

  return (
    <section
      id="destinos-guamal"
      className="relative w-full bg-[#070A09] text-[#F4F0E8] px-6 sm:px-10 lg:px-14 py-20 lg:py-0 lg:h-screen lg:min-h-[720px] lg:max-h-[960px] flex flex-col justify-center"
    >
      <div className="mx-auto w-full max-w-[1420px]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 lg:mb-10">
          <h2 className="font-serif font-light text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">
            Puerta de entrada a los <span className="font-editorial-italic font-normal">tesoros del río.</span>
          </h2>
          <a href="/galeria" className="text-sm text-white/70 hover:text-white transition-colors underline underline-offset-4 decoration-white/30">
            Ver galería de la villa
          </a>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 lg:h-[min(62vh,560px)]">
          {/* Foto activa */}
          <figure className="lg:col-span-8 relative overflow-hidden rounded-[28px] bg-[#12201C] aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto">
            {GUAMAL_DESTINATIONS.map((d, i) => (
              <img
                key={d.id}
                src={d.imageUrl}
                alt={d.name}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
                  d.id === active.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070A09]/90 via-[#070A09]/15 to-transparent pointer-events-none" />

            <figcaption key={active.id} className="swap-in absolute inset-x-0 bottom-0 p-6 sm:p-10 max-w-2xl">
              <h3 className="font-serif font-light text-3xl sm:text-4xl leading-[1.08] tracking-tight text-white">
                {active.name}
              </h3>
              <p className="mt-3 text-sm sm:text-base font-light leading-relaxed text-white/80 line-clamp-2">
                {active.description}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${active.mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial mt-5 inline-block rounded-full bg-[#F4F0E8] px-5 py-2.5 text-xs font-semibold tracking-wide text-[#12201C] hover:bg-white"
              >
                Cómo llegar
              </a>
            </figcaption>
          </figure>

          {/* Lista completa */}
          <ol className="lg:col-span-4 flex flex-col justify-center">
            {GUAMAL_DESTINATIONS.map((d) => {
              const isActive = d.id === active.id;
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(d.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`btn-editorial flex w-full items-baseline justify-between gap-4 border-t py-4 text-left cursor-pointer transition-colors duration-200 ${
                      isActive ? 'border-[#F4F0E8] text-[#F4F0E8]' : 'border-white/15 text-white/50 hover:text-white/85'
                    }`}
                  >
                    <span className="font-serif text-lg sm:text-xl leading-snug">{d.name}</span>
                    <span className="shrink-0 text-xs tabular-nums">{d.distanceMinutes} min</span>
                  </button>
                </li>
              );
            })}
            <li className="border-t border-white/15 pt-4 text-xs text-white/50">Distancias desde Villa MCJ.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
