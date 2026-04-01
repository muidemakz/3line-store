import React from 'react';

// Import Assets
import editIcon from '@/assets/edit.svg';

const SettingsPage: React.FC = () => {
  return (
    <div className="panel__content">
      <div className="settingsStack" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
        <article className="settingCard">
          <div className="settingCard__header">
            <div>
              <div className="settingCard__title">Point Configuration</div>
              <div className="settingCard__desc">Adjust the conversion rate between Naira and Store Points.</div>
            </div>
            <button className="miniIconButton">
              <img src={editIcon} alt="" />
            </button>
          </div>

          <div className="settingCard__row settingCard__row--highlight">
            <div className="settingCard__rowLabel">Amount per 1 Point</div>
            <div className="settingCard__rowValue">₦-</div>
          </div>
        </article>

        <article className="settingCard">
          <div className="settingCard__header">
            <div>
              <div className="settingCard__title">Grade Levels & Points</div>
              <div className="settingCard__desc">Manage user grade levels and their associated point allocations.</div>
            </div>
            <button className="miniIconButton">
              <img src={editIcon} alt="" />
            </button>
          </div>

          <div className="settingCard__bigNumber">0</div>
        </article>
      </div>
    </div>
  );
};

export default SettingsPage;
