import React, { useState } from 'react';
import { addDays, format, startOfWeek, subDays, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import './TimelineCalendar.css';

// Mock Data
const MOCK_PROPERTIES = [
  { id: '1', name: 'Casa Guadua' },
  { id: '2', name: 'Casa Palmera' },
  { id: '3', name: 'Casa Caño' },
  { id: '4', name: 'Casa Moriche' },
];

const MOCK_RESERVATIONS = [
  { id: 'r1', propertyId: '1', checkIn: new Date(), checkOut: addDays(new Date(), 3), guest: 'Juan Pérez', status: 'CONFIRMED' },
  { id: 'r2', propertyId: '2', checkIn: addDays(new Date(), 2), checkOut: addDays(new Date(), 6), guest: 'María Gómez', status: 'PENDING' },
  { id: 'r3', propertyId: '1', checkIn: addDays(new Date(), 5), checkOut: addDays(new Date(), 8), guest: 'Carlos Ruiz', status: 'CONFIRMED' },
  { id: 'r4', propertyId: '3', checkIn: subDays(new Date(), 1), checkOut: addDays(new Date(), 2), guest: 'Ana Soto', status: 'CONFIRMED' },
];

export const TimelineCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Generar 14 días a partir del inicio de semana actual
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 14 }).map((_, i) => addDays(startDate, i));

  const nextPeriod = () => setCurrentDate(addDays(currentDate, 7));
  const prevPeriod = () => setCurrentDate(subDays(currentDate, 7));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Controles del calendario */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-lg text-gray-900 capitalize">
          {format(startDate, 'MMMM yyyy', { locale: es })}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevPeriod} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
            Hoy
          </button>
          <button onClick={nextPeriod} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Cabecera de días */}
          <div className="grid grid-cols-[200px_repeat(14,1fr)] border-b border-gray-100">
            <div className="p-4 bg-white sticky left-0 z-10 border-r border-gray-100 flex items-end">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Propiedad</span>
            </div>
            {days.map((day, i) => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div key={i} className={`p-2 border-r border-gray-50 flex flex-col items-center justify-center ${isToday ? 'bg-green-50' : ''}`}>
                  <span className={`text-xs ${isToday ? 'text-guamal-green font-bold' : 'text-gray-400 uppercase'}`}>{format(day, 'EEE', { locale: es })}</span>
                  <span className={`text-lg ${isToday ? 'text-guamal-green font-bold' : 'text-gray-700 font-medium'}`}>{format(day, 'd')}</span>
                </div>
              );
            })}
          </div>

          {/* Filas de propiedades */}
          {MOCK_PROPERTIES.map((property) => (
            <div key={property.id} className="grid grid-cols-[200px_repeat(14,1fr)] border-b border-gray-50 group hover:bg-gray-50/50 transition-colors">
              <div className="p-4 bg-white group-hover:bg-gray-50/50 sticky left-0 z-10 border-r border-gray-100 flex items-center">
                <span className="font-medium text-gray-800 text-sm">{property.name}</span>
              </div>
              
              {/* Celdas de días y barras de reserva */}
              {days.map((day, i) => {
                // Buscar si hay una reserva que ocupe este día para esta propiedad
                const activeReservation = MOCK_RESERVATIONS.find(r => 
                  r.propertyId === property.id && 
                  isWithinInterval(day, { start: r.checkIn, end: r.checkOut })
                );

                const isStart = activeReservation && format(activeReservation.checkIn, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                
                return (
                  <div key={i} className="relative border-r border-gray-50 h-16 p-1">
                    {activeReservation && isStart && (
                      <motion.div 
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        className={`absolute top-2 bottom-2 left-1 rounded-lg shadow-sm flex items-center px-3 z-0 ${activeReservation.status === 'CONFIRMED' ? 'bg-guamal-green text-white' : 'bg-orange-100 text-orange-800 border border-orange-200'}`}
                        style={{ 
                          width: `calc(${Math.ceil((activeReservation.checkOut.getTime() - activeReservation.checkIn.getTime()) / (1000 * 60 * 60 * 24))} * 100% - 8px)`,
                          transformOrigin: 'left'
                        }}
                      >
                        <span className="text-xs font-bold truncate">{activeReservation.guest}</span>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
