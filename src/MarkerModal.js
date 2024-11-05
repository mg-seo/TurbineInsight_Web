import React from 'react';

const MarkerModal = ({ marker, onClose }) => {
  return (
    <div style={modalStyle}>
      <h3>마커 정보 수정</h3>
      <div style={modalContentStyle}>
        <label>이름:</label>
        <input type="text" defaultValue={marker.name} style={inputFieldStyle} />
      </div>
      <div style={modalContentStyle}>
        <label>모델:</label>
        <input type="text" defaultValue={marker.model} style={inputFieldStyle} />
      </div>
      <div style={modalContentStyle}>
        <label>좌표:</label>
        <input type="text" defaultValue={marker.coordinates} style={inputFieldStyle} />
      </div>
      <button style={buttonStyle} onClick={onClose}>닫기</button>
    </div>
  );
};

// 모달 스타일
const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
  zIndex: 1000,
  width: '300px',
};

// 모달 내부 스타일
const modalContentStyle = {
  marginBottom: '10px',
  display: 'flex',
  flexDirection: 'column',
};

// 인풋 필드 스타일
const inputFieldStyle = {
  padding: '5px',
  fontSize: '1rem',
  marginBottom: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
};

// 버튼 스타일
const buttonStyle = {
  padding: '10px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default MarkerModal;
