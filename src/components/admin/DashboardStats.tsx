import React, { useEffect, useState } from 'react';
import { StatCard } from './StatCard';
import { api } from '../../services/api';

export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.getDashboardStats()
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) return <div className="animate-pulse flex space-x-4">Cargando métricas...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard title="Reservas (Hoy)" value={stats.reservationsToday.toString()} trend="" isPositive={true} icon="home" delay={0.1} />
      <StatCard title="Llegadas (Hoy)" value={stats.checkinsToday.toString()} trend="" isPositive={true} icon="users" delay={0.2} />
      <StatCard title="Ingresos (Mes)" value={`$${stats.monthlyRevenue.toLocaleString('es-CO')}`} trend="" isPositive={true} icon="dollar" delay={0.3} />
      <StatCard title="Ocupación" value={`${stats.occupancyRate}%`} trend="" isPositive={true} icon="trending" delay={0.4} />
    </div>
  );
};
