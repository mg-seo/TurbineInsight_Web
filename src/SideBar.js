import React from 'react';

const Sidebar = ({ setSelectedSection }) => {
  const handleSectionClick = (index) => {
    setSelectedSection(index);
  };

  return (
    <div style={sidebarStyle}>
      <h2>사업지 이름</h2>

      {/* 섹션 버튼 */}
      <div style={{borderTop: '1px solid #ccc'}}>
        <button onClick={() => handleSectionClick(0)} style={sectionButtonStyle}>
          <img src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png" alt="Marker" style={iconStyle} />
          섹션 1
        </button>
      </div>

      <div>
        <button onClick={() => handleSectionClick(1)} style={sectionButtonStyle}>
          <img src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png" alt="Marker" style={iconStyle} />
          섹션 2
        </button>
      </div>

      <div>
        <button onClick={() => handleSectionClick(2)} style={sectionButtonStyle}>
          <img src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png" alt="Marker" style={iconStyle} />
          섹션 3
        </button>
      </div>
    </div>
  );
};

// 사이드바 스타일
const sidebarStyle = {
  textAlign: 'center',
  width: '250px',
  background: '#f4f4f4',
  padding: '0px',
  height: '100vh',
  boxShadow: '2px 0 5px rgba(0,0,0,0.1)', // 쉐도우 유지
  overflowY: 'auto',
};

// 섹션 버튼 스타일
const sectionButtonStyle = {
  display: 'flex',
  alignItems: 'center', // 아이콘과 텍스트를 수평으로 정렬
  width: '100%',
  padding: '10px',
  backgroundColor: 'white',
  color: 'black',
  textAlign: 'left',
  borderTop: 'none',  // 위에만 테두리 적용
  borderBottom: '1px solid #ccc',  // 아래에만 테두리 적용
  borderLeft: 'none', // 좌측 테두리 없음
  borderRight: 'none', // 우측 테두리 없음
  outline: 'none',
  cursor: 'pointer',
  marginBottom: '0px',
  height: '65px',
  fontSize: '1.2rem'
};

// 아이콘 스타일
const iconStyle = {
  width: '20px',  // 아이콘 크기 조정
  height: '20px',
  marginRight: '10px', // 텍스트와 아이콘 사이 간격
  objectFit: 'contain', // 비율을 유지하며 이미지 크기 조정
};

export default Sidebar;
