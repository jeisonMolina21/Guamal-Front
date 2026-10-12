import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Home as HomeIcon, DollarSign } from 'lucide-react';
import './StatCard.css';

interface Props {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: 'trending' | 'users' | 'home' | 'dollar';
  delay: number;
}

export const StatCard: React.FC<Props> = ({ title, value, trend, isPositive, icon, delay }) => {
  const Icon = {
    trending: TrendingUp,
    users: Users,
    home: HomeIcon,
    dollar: DollarSign,
  }[icon];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="stat-card-box"
    >
      <div className="stat-card-header">
        <div className="stat-card-icon-wrapper">
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`stat-card-trend-badge ${isPositive ? 'stat-card-trend-positive' : 'stat-card-trend-negative'}`}>
            {isPositive ? '+' : '-'}{trend}
          </span>
        )}
      </div>
      
      <p className="stat-card-title">{title}</p>
      <h3 className="stat-card-value">{value}</h3>
    </motion.div>
  );
};

