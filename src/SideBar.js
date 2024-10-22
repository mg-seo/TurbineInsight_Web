import React from 'react';

const Sidebar = () => {
  return (
    <div style={sidebarStyle}>
      <h2>사이드바</h2>
      <ul>
        <li>항목 1</li>
        <li>항목 2</li>
        <li>항목 3</li>
      </ul>
    </div>
  );
};

// 사이드바 스타일
const sidebarStyle = {
  width: '250px',
  background: '#f4f4f4',
  padding: '20px',
  height: '100vh',
  boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
};

export default Sidebar;
