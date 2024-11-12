import React from 'react';

const BusinessMapList = ({ businessData, handleBusinessCheck }) => {
  return (
    <div style={sidebarWrapperStyle}>
      <h3>사업 목록</h3>
      {businessData.map((business) => (
        <div key={business.id}>
          <label>
            <input
              type="checkbox"
              onChange={(e) => handleBusinessCheck(business.id, e.target.checked)}
            />
            {business.name}
          </label>
        </div>
      ))}
    </div>
  );
};

const sidebarWrapperStyle = {
  width: '200px',
  padding: '10px',
  backgroundColor: '#f0f0f0',
  overflowY: 'auto',
};

export default BusinessMapList;
