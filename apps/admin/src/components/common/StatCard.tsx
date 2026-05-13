import React from 'react';
import arrowRightIcon from '@/assets/arrow-right.svg';

interface StatCardProps {
  title: string;
  value: string | number;
  miniIcon: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, miniIcon, onClick }) => (
  <article className="statCard" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div className="statCard__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div className="statCard__title">{title}</div>
      <img src={miniIcon} alt="" className="statCard__miniIcon icon--dark-optimized" />
    </div>
    <div className="statCard__bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
      <div className="statCard__value">{value}</div>
      <img src={arrowRightIcon} alt="" className="statCard__arrow icon--dark-optimized" />
    </div>
  </article>
);

export default StatCard;
