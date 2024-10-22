import React from 'react';

const Sidebar = ({ setSelectedSection }) => {
  // 섹션 클릭 시 선택된 섹션 인덱스 전달
  const handleSectionClick = (index) => {
    setSelectedSection(index);
  };

  return (
    <div style={sidebarStyle}>
      <h2>사이드바</h2>

      {/* 섹션 버튼 */}
      <div>
        <button onClick={() => handleSectionClick(0)} style={sectionButtonStyle}>
          섹션 1
        </button>
      </div>

      <div>
        <button onClick={() => handleSectionClick(1)} style={sectionButtonStyle}>
          섹션 2
        </button>
      </div>

      <div>
        <button onClick={() => handleSectionClick(2)} style={sectionButtonStyle}>
          섹션 3
        </button>
      </div>
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
  overflowY: 'auto',
};

// 섹션 버튼 스타일
const sectionButtonStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#007bff',
  color: '#fff',
  textAlign: 'left',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  marginBottom: '10px',
};

export default Sidebar;
