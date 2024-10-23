import React from 'react';

const Modal = ({ show, onClose, marker }) => {
  if (!show) return null; // show가 false일 때는 모달을 렌더링하지 않음

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={tabHeaderStyle}>
          <button style={tabButtonStyle}>모델 지정</button>
          <button style={tabButtonStyle}>좌표 지정</button>
        </div>
        <div style={contentWrapperStyle}>
          <div style={formGroupStyle}>
            <label>마커 이름</label>
            <input type="text" value={marker.name} style={inputStyle} />
          </div>
          <div style={formGroupStyle}>
            <label>모델 지정</label>
            <select style={inputStyle}>
              <option>두산중공업 풍력 발전기</option>
              <option>현대중공업 풍력 발전기</option>
            </select>
          </div>
          <div style={imageWrapperStyle}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Wind_turbine_Rødsand2.jpg"
              alt="Wind Turbine"
              style={imageStyle}
            />
          </div>
          <div style={formGroupStyle}>
            <label>방향 각도</label>
            <input type="number" value="0" style={inputStyle} />
          </div>
        </div>
        <div style={buttonWrapperStyle}>
          <button style={cancelButtonStyle} onClick={onClose}>취소하기</button>
          <button style={deleteButtonStyle}>삭제하기</button>
        </div>
      </div>
    </div>
  );
};

// 스타일 설정
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const modalStyle = {
  backgroundColor: 'white',
  borderRadius: '10px',
  padding: '20px',
  width: '350px',
  maxWidth: '100%',
  textAlign: 'center',
};

const tabHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '15px',
};

const tabButtonStyle = {
  flex: 1,
  padding: '10px',
  backgroundColor: '#f1f1f1',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '5px',
  margin: '0 5px',
};

const contentWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '20px',
};

const formGroupStyle = {
  width: '100%',
  marginBottom: '10px',
  textAlign: 'left',
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  borderRadius: '5px',
  border: '1px solid #ccc',
};

const imageWrapperStyle = {
  margin: '15px 0',
};

const imageStyle = {
  width: '100%',
  borderRadius: '5px',
};

const buttonWrapperStyle = {
  display: 'flex',
  justifyContent: 'space-between',
};

const cancelButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#ccc',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const deleteButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default Modal;
