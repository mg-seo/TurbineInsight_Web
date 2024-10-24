import React, { useEffect, useRef, useState } from 'react';
import { LoadScriptNext } from '@react-google-maps/api';
import { FaEdit, FaCheck } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Modal from './Modal';

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('가산 해상풍력단지');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingMarker, setPendingMarker] = useState(null);
  const [markers, setMarkers] = useState([]); // 마커 목록 상태
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (isMapLoaded && mapRef.current && !mapInstance.current && window.google) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 37.5665, lng: 126.9780 },
        minZoom: 5,
        maxZoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        disableDefaultUI: false,
      });

      // 지도 클릭 시 마커 추가 및 모달 열기
      mapInstance.current.addListener('click', (event) => {
        handleMapClick(event.latLng);
      });
    }
  }, [isMapLoaded]);

  // 지도 클릭 시 마커 생성 및 애니메이션 처리 후 모달 열기
  const handleMapClick = (location) => {
    const marker = new window.google.maps.Marker({
      position: location,
      map: mapInstance.current,
      title: `마커 ${markers.length + 1}`,
      animation: window.google.maps.Animation.DROP, // DROP 애니메이션 적용
    });

    const newMarker = {
      id: markers.length + 1,
      name: `마커 ${markers.length + 1}`,
      position: location,
      markerInstance: marker,
    };

    // 새로 추가할 마커를 대기 상태로 설정
    setPendingMarker(newMarker); 
    setIsModalOpen(true); // 모달 창 열기

    // 마커 클릭 시 수정 가능한 모달 창 열기
    marker.addListener('click', () => {
      handleEditMarker(newMarker);
    });
  };

  // 모달에서 "등록하기" 클릭 시 마커 목록에 추가/수정
  const handleRegisterMarker = (updatedMarker) => {
    // 기존 마커 목록에 새 마커를 추가
    setMarkers((prevMarkers) => [...prevMarkers, updatedMarker]); // 목록에 새 마커 추가
    setPendingMarker(null); // 등록 후 대기 중 마커 초기화
    setIsModalOpen(false); // 모달 닫기
  };

  // 모달에서 마커 삭제 버튼 클릭 시
  const handleDeleteMarker = (marker) => {
    // 지도에서 해당 마커만 삭제
    marker.markerInstance.setMap(null); 

    // 마커 목록에서 해당 마커만 삭제
    setMarkers((prevMarkers) => prevMarkers.filter((m) => m.id !== marker.id));

    // 모달 닫기 및 대기 중 마커 초기화
    setPendingMarker(null);
    setIsModalOpen(false);
  };

  // 마커 클릭 시 수정 가능한 모달을 여는 함수
  const handleEditMarker = (marker) => {
    setPendingMarker(marker); // 수정할 마커 설정
    setIsModalOpen(true); // 모달 열기
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPendingMarker(null); // 대기 중 마커 초기화
  };

  return (
    <div style={mainContainerStyle}>
      <LoadScriptNext
        googleMapsApiKey="AIzaSyCj-nZeQ2J0gl-NvEEjJSh6inRhSPfTDm8"
        onLoad={() => setIsMapLoaded(true)}
        loadingElement={<div>지도를 로딩 중입니다...</div>}
      >
        {/* 지도 컨테이너 */}
        <div ref={mapRef} style={mapContainerStyle} />
      </LoadScriptNext>

      {/* 제목을 지도 위에 추가 */}
      <div style={titleWrapperStyle}>
        {isEditing ? (
          <>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
            <button style={checkButtonStyle} onClick={() => setIsEditing(false)}>
              <FaCheck />
            </button>
          </>
        ) : (
          <>
            <div style={titleStyle}>{title}</div>
            <button style={editButtonStyle} onClick={() => setIsEditing(true)}>
              <FaEdit />
            </button>
          </>
        )}
      </div>

      {/* 사이드바 */}
      <div style={sidebarWrapperStyle}>
        <Sidebar setSelectedSection={setSelectedSection} />
      </div>

      {/* 마커 목록 표시 */}
      <div
        style={{
          ...detailSectionStyle,
          transform: selectedSection !== '' ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.5s ease',
        }}
      >
        {selectedSection === 0 && (
          <>
            <div style={detailHeaderStyle}>
              <button style={closeButtonStyle} onClick={() => setSelectedSection('')}>X</button>
            </div>
            <h3 style={{ textAlign: 'center' }}>마커 목록</h3>
            {markers.map((marker, index) => (
              <div key={index} style={markerItemStyle}>
                <img
                  src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png"
                  alt="Marker Icon"
                  style={markerIconStyle}
                />
                <div style={markerTextStyle}>
                  <div style={markerNameStyle}>
                    <strong>{marker.name}</strong>
                  </div>
                  <div style={markerCoordinatesStyle}>
                    좌표: {marker.position.lat().toFixed(6)}, {marker.position.lng().toFixed(6)}
                  </div>
                </div>
                <button style={editButtonStyle} onClick={() => handleEditMarker(marker)}>
                  <FaEdit />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 모달 컴포넌트 추가 */}
      <Modal
        show={isModalOpen}
        onClose={handleCloseModal}
        marker={pendingMarker}
        onRegister={handleRegisterMarker}
        onDelete={handleDeleteMarker}
      />
    </div>
  );
};

// 스타일 정의
const mainContainerStyle = {
  display: 'flex',
  height: '100vh',
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const titleWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: '50px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'white',
  padding: '10px 20px',
  borderRadius: '10px',
  boxShadow: '0px 2px 5px rgba(0,0,0,0.3)',
  zIndex: 9999,
  minWidth: '200px',
};

const titleStyle = {
  fontSize: '17px',
  textAlign: 'center',
  flex: 1,
};

const editButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '20px',
  padding: '0px',
  color: 'gray',
  paddingLeft: '5px',
};

const checkButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '20px',
  padding: '0px',
  marginLeft: '5px',
  color: '#ccc',
};

const inputStyle = {
  width: '100%',
  padding: '5px',
  fontSize: '17px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  textAlign: 'center',
};

const sidebarWrapperStyle = {
  zIndex: 3,
  width: '125px',
  position: 'absolute',
  left: '0px',
  top: '0px',
  height: '100%',
  backgroundColor: 'white',
  boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
  overflowY: 'auto',
};

const detailSectionStyle = {
  width: '250px',
  background: '#f9f9f9',
  padding: '10px',
  boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
  overflowY: 'auto',
  position: 'absolute',
  top: 0,
  left: '125px',
  height: '100%',
  zIndex: 2,
};

const markerItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: '10px',
  borderBottom: '1px solid #ccc',
};

const markerIconStyle = {
  width: '20px',
  height: '20px',
  marginRight: '10px',
  objectFit: 'contain',
};

const markerTextStyle = {
  flex: 1,
  marginLeft: '10px',
};

const markerNameStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
};

const markerCoordinatesStyle = {
  color: 'gray',
  fontSize: '0.8rem',
  marginTop: '5px',
};

const detailHeaderStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
};

export default MapComponent;
