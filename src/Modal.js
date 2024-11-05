import React, { useState, useEffect } from 'react';
import api from './api';
import './Modal.css';

const Modal = ({ show, onClose, marker, onRegister, onDelete, markersLength, business }) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('두산중공업 풍력 발전기');
  const [angle, setAngle] = useState(0);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [activeTab, setActiveTab] = useState('model');

  // 도, 분, 초, 방향 상태
  const [latDegrees, setLatDegrees] = useState('');
  const [latMinutes, setLatMinutes] = useState('');
  const [latSeconds, setLatSeconds] = useState('');
  const [latDirection, setLatDirection] = useState('N');
  const [lngDegrees, setLngDegrees] = useState('');
  const [lngMinutes, setLngMinutes] = useState('');
  const [lngSeconds, setLngSeconds] = useState('');
  const [lngDirection, setLngDirection] = useState('E');

  useEffect(() => {
    if (show) {
      setActiveTab('model'); // 모달이 열릴 때 항상 "모델 지정" 탭을 기본으로 설정
    }
    if (marker) {
      setName(marker.markerId ? marker.markerName || '' : `마커 ${markersLength + 1}`);
      setModel(marker.modelName || '두산중공업 풍력 발전기');
      setAngle(marker.angle || 0);
      setLatitude(marker.latitude || '');
      setLongitude(marker.longitude || '');
      // 위도/경도를 도/분/초로 변환
      if (marker.latitude && marker.longitude) {
        convertToDMS(marker.latitude, marker.longitude);
      }
    }
  }, [marker, markersLength, business, show]);

  if (!show) return null;

  // 위도/경도를 도/분/초로 변환하는 함수
  const convertToDMS = (lat, lng) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';

    const [latD, latM, latS] = toDMS(Math.abs(lat));
    const [lngD, lngM, lngS] = toDMS(Math.abs(lng));

    setLatDegrees(latD);
    setLatMinutes(latM);
    setLatSeconds(latS);
    setLatDirection(latDir);

    setLngDegrees(lngD);
    setLngMinutes(lngM);
    setLngSeconds(lngS);
    setLngDirection(lngDir);
  };

  const toDMS = (decimal) => {
    const degrees = Math.floor(decimal);
    const minutes = Math.floor((decimal - degrees) * 60);
    const seconds = Math.round((decimal - degrees - minutes / 60) * 3600);
    return [degrees, minutes, seconds];
  };

  // 도/분/초를 위도/경도로 변환하는 함수
  const convertToDecimal = () => {
    const lat = toDecimal(latDegrees, latMinutes, latSeconds, latDirection === 'S');
    const lng = toDecimal(lngDegrees, lngMinutes, lngSeconds, lngDirection === 'W');

    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
  };

  const toDecimal = (degrees, minutes, seconds, isNegative) => {
    const decimal = Math.abs(degrees) + minutes / 60 + seconds / 3600;
    return isNegative ? -decimal : decimal;
  };

  const handleRegisterClick = async () => {
    const markerData = {
      markerId: marker?.markerId || null,
      markerName: name,
      modelName: model,
      angle: angle,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      business: {
        businessId: business.id
      }
    };

    try {
      const response = await api.post('/api/businesses/map/post/marker/add', markerData);
      onRegister(response.data);
      onClose();
    } catch (error) {
      console.error("Failed to save marker:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="tab-header">
          <button
            className={`tab-button ${activeTab === 'model' ? 'active-tab-button' : ''}`}
            onClick={() => setActiveTab('model')}
          >
            모델 지정
          </button>
          <button
            className={`tab-button ${activeTab === 'coordinates' ? 'active-tab-button' : ''}`}
            onClick={() => setActiveTab('coordinates')}
          >
            좌표 지정
          </button>
        </div>
        <div className="content-wrapper">
          {activeTab === 'model' ? (
            <>
              <div className="form-group">
                <label>마커 이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>모델 지정</label>
                <select value={model} onChange={(e) => setModel(e.target.value)} className="input-field">
                  <option>두산중공업 풍력 발전기</option>
                  <option>현대중공업 풍력 발전기</option>
                </select>
              </div>
              <div className="form-group">
                <label>방향 각도</label>
                <input
                  type="number"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  className="input-field"
                />
              </div>
            </>
          ) : (
            <>
            <div className="form-group">
              <label>위도</label>
              <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                onBlur={() => convertToDMS(parseFloat(latitude), parseFloat(longitude))}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>경도</label>
              <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                onBlur={() => convertToDMS(parseFloat(latitude), parseFloat(longitude))}
                className="input-field"
              />
            </div>

            {/* 위도에 대한 Degrees, Minutes, Seconds, Direction 필드 */}
            <div className="dms-group">
              <div className="dms-row">
                <label>Degrees (위도)</label>
                <input
                  type="number"
                  value={latDegrees}
                  onChange={(e) => setLatDegrees(e.target.value)}
                  onBlur={convertToDecimal}
                  className="input-field-small"
                />
              </div>
              <div className="dms-row">
                <label>Minutes</label>
                <input
                  type="number"
                  value={latMinutes}
                  onChange={(e) => setLatMinutes(e.target.value)}
                  onBlur={convertToDecimal}
                  className="input-field-small"
                />
              </div>
              <div className="dms-row">
                <label>Seconds</label>
                <input
                  type="number"
                  value={latSeconds}
                  onChange={(e) => setLatSeconds(e.target.value)}
                  onBlur={convertToDecimal}
                  className="input-field-small"
                />
              </div>
              <div className="dms-row">
                <label>Direction</label>
                <select
                  value={latDirection}
                  onChange={(e) => setLatDirection(e.target.value)}
                  onBlur={convertToDecimal}
                  className="input-field-small"
                >
                  <option>N</option>
                  <option>S</option>
                </select>
              </div>
            </div>

            {/* 경도에 대한 Degrees, Minutes, Seconds, Direction 필드 */}
            <div className="dms-group">
              <div className="dms-row">
                <label>Degrees (경도)</label>
                <input
                  type="number"
                  value={lngDegrees}
                  onChange={(e) => setLngDegrees(e.target.value)}
                  onBlur={convertToDecimal}
                  className="input-field-small"
                />
              </div>
              <div className="dms-row">
                <label>Minutes</label>
                <input
                  type="number"
                  value={lngMinutes}
                  onChange={(e) => setLngMinutes(e.target.value)}
                  onBlur={convertToDecimal}
                  className="input-field-small"
                />
              </div>
              <div className="dms-row">
                <label>Seconds</label>
                <input
                  type="number"
                  value={lngSeconds}
                  onChange={(e) => setLngSeconds(e.target.value)}
                  onBlur={convertToDecimal}
                  className="input-field-small"
                />
              </div>
              <div className="dms-row">
                <label>Direction</label>
                <select
                  value={lngDirection}
                  onChange={(e) => setLngDirection(e.target.value)}
                  onBlur={convertToDecimal}
                  className="input-field-small"
                >
                  <option>E</option>
                  <option>W</option>
                </select>
              </div>
            </div>
          </>
          )}
        </div>
        <div className="button-wrapper">
          <button className="cancel-button" onClick={onClose}>취소하기</button>
          {marker?.markerId && (
            <button className="delete-button" onClick={() => onDelete(marker.markerId)}>삭제하기</button>
          )}
          <button className="register-button" onClick={handleRegisterClick}>
            {marker?.markerId ? '수정하기' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
