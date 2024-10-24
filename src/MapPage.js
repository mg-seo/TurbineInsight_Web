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
  const [businessMarkers, setBusinessMarkers] = useState([]); // 사업별 마커 상태

  // 사업 목록 예시 데이터
  const businesses = [
    { id: 1, name: '사업 1', color: '#0000FF', markers: [{ lat: 37.5665, lng: 126.9780 }] },
    { id: 2, name: '사업 2', color: '#000000', markers: [{ lat: 37.5775, lng: 126.9880 }] },
  ];

  // 지도 및 마커 초기화
  useEffect(() => {
    const initMap = async () => {
      const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary('marker'); // google 객체를 window를 통해 가져옴

      if (mapRef.current && !mapInstance.current && window.google) {
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
          mapId: 'DEMO_MAP_ID', // Map ID 추가
        });

        // 지도 클릭 시 마커 추가 및 모달 열기
        mapInstance.current.addListener('click', (event) => {
          handleMapClick(event.latLng, AdvancedMarkerElement);
        });
      }
    };

    if (isMapLoaded) {
      initMap(); // 지도 로드 완료 시 initMap 호출
    }
  }, [isMapLoaded]);

  // 지도 클릭 시 마커 생성 및 애니메이션 처리 후 모달 열기
  const handleMapClick = (location, AdvancedMarkerElement) => {
    const marker = new AdvancedMarkerElement({
      position: location,
      map: mapInstance.current,
      title: `마커 ${markers.length + 1}`,
    });

    const newMarker = {
      id: markers.length + 1,
      name: `마커 ${markers.length + 1}`,
      position: location,
      markerInstance: marker,
    };

    setPendingMarker(newMarker); // 새로 추가할 마커를 대기 상태로 설정
    setIsModalOpen(true); // 모달 창 열기

    // 마커 클릭 시 수정 가능한 모달 창 열기
    marker.addListener('click', () => {
      handleEditMarker(newMarker);
    });
  };

  // 사업별 마커 생성 및 지도에 표시
  const handleBusinessMarkerToggle = async (business, checked) => {
    const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary('marker');

    if (checked) {
      const newBusinessMarkers = business.markers.map((marker, index) => {
        const pinBackground = new PinElement({
          background: business.color, // 사업별로 다른 배경색 설정
        });

        const newMarker = new AdvancedMarkerElement({
          position: marker,
          map: mapInstance.current,
          content: pinBackground.element,
        });

        return newMarker;
      });
      setBusinessMarkers((prev) => [...prev, ...newBusinessMarkers]);
    } else {
      // 체크 해제 시 해당 사업의 모든 마커 삭제
      businessMarkers.forEach((marker) => marker.setMap(null));
      setBusinessMarkers([]);
    }
  };

  // 모달에서 "등록하기" 클릭 시 마커 목록에 추가/수정
  const handleRegisterMarker = (updatedMarker) => {
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
        libraries={['marker']} // AdvancedMarkerElement와 PinElement를 사용하려면 'marker' 라이브러리를 포함
        onLoad={() => setIsMapLoaded(true)}
        loadingElement={<div>지도를 로딩 중입니다...</div>}
      >
        <div ref={mapRef} style={mapContainerStyle} />
      </LoadScriptNext>

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

      <div style={sidebarWrapperStyle}>
        <Sidebar setSelectedSection={setSelectedSection} />
      </div>

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

        {/* 사업 목록 표시 */}
        {selectedSection === 1 && (
          <>
            <div style={detailHeaderStyle}>
              <button style={closeButtonStyle} onClick={() => setSelectedSection('')}>X</button>
            </div>
            <h3 style={{ textAlign: 'center' }}>사업 목록</h3>
            {businesses.map((business) => (
              <div key={business.id} style={markerItemStyle}>
                <input
                  type="checkbox"
                  onChange={(e) => handleBusinessMarkerToggle(business, e.target.checked)}
                />
                <span>{business.name}</span>
              </div>
            ))}
          </>
        )}
      </div>

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
