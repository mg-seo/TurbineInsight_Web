import React, { useState, useEffect } from 'react';
import api from './api';

const Modal = ({ show, onClose, marker, onRegister, onDelete, markersLength, businessId }) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('두산중공업 풍력 발전기');
  const [angle, setAngle] = useState(0);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [activeTab, setActiveTab] = useState('model');

  useEffect(() => {
    if (marker) {
      // markerId가 없으면 새로운 마커이므로 기본 이름을 설정
      if (!marker.markerId) {
        setName(`마커 ${markersLength + 1}`);
      } else {
        // 기존 마커인 경우에는 기존 이름을 그대로 사용
        setName(marker.markerName || '');
      }
      setModel(marker.modelName || '두산중공업 풍력 발전기');
      setAngle(marker.angle || 0);
      setLatitude(marker.latitude || '');
      setLongitude(marker.longitude || '');
    }
  }, [marker, markersLength]);

  if (!show) return null;
  const handleRegisterClick = async () => {
    const markerData = {
      markerId: marker?.markerId || null, // 여기에서 markerId를 확인
      markerName: name,
      modelName: model,
      angle: angle,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      businessId: businessId, // 비즈니스 ID 추가
    };
  
    console.log("Sending marker data:", markerData); // 로그로 데이터 확인
  
    try {
      const response = await api.post('/api/businesses/map/post/marker/save', markerData);
      onRegister(response.data);
      onClose();
    } catch (error) {
      console.error("Failed to save marker:", error);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={tabHeaderStyle}>
          <button
            style={activeTab === 'model' ? activeTabButtonStyle : tabButtonStyle}
            onClick={() => setActiveTab('model')}
          >
            모델 지정
          </button>
          <button
            style={activeTab === 'coordinates' ? activeTabButtonStyle : tabButtonStyle}
            onClick={() => setActiveTab('coordinates')}
          >
            좌표 지정
          </button>
        </div>
        <div style={contentWrapperStyle}>
          {activeTab === 'model' ? (
            <>
              <div style={formGroupStyle}>
                <label>마커 이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label>모델 지정</label>
                <select value={model} onChange={(e) => setModel(e.target.value)} style={inputStyle}>
                  <option>두산중공업 풍력 발전기</option>
                  <option>현대중공업 풍력 발전기</option>
                </select>
              </div>
              <div style={formGroupStyle}>
                <label>방향 각도</label>
                <input
                  type="number"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </>
          ) : (
            <>
              <div style={formGroupStyle}>
                <label>위도</label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label>경도</label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </>
          )}
        </div>
        <div style={buttonWrapperStyle}>
          <button style={cancelButtonStyle} onClick={onClose}>취소하기</button>
          <button style={deleteButtonStyle} onClick={() => onDelete(marker.markerId)}>삭제하기</button>
          <button style={registerButtonStyle} onClick={handleRegisterClick}>등록하기</button>
        </div>
      </div>
    </div>
  );
};


// 스타일 정의
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

const activeTabButtonStyle = {
  ...tabButtonStyle,
  backgroundColor: '#ddd',
  fontWeight: 'bold',
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

const registerButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default Modal;
