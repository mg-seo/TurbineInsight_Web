import React, { useEffect, useRef, useState } from 'react';
import { LoadScriptNext } from '@react-google-maps/api';
import { FaEdit, FaCheck } from 'react-icons/fa'; // 수정 아이콘과 체크 아이콘 import
import Sidebar from './Sidebar'; // 사이드바 컴포넌트
import Modal from './Modal'; // 모달 컴포넌트 import

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null); // Google Maps 객체를 저장할 Ref
  const [selectedSection, setSelectedSection] = useState(''); // 선택된 섹션 상태 관리
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태 관리
  const [title, setTitle] = useState('가산 해상풍력단지'); // 제목 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림/닫힘 상태 관리
  const [selectedMarker, setSelectedMarker] = useState(null); // 선택된 마커 저장
  const [markers, setMarkers] = useState([]); // 마커 목록 상태
  const [isPlacingMarker, setIsPlacingMarker] = useState(false); // 마커 추가 모드 상태 관리

  // 지도를 처음 로드할 때 한 번만 초기화
  useEffect(() => {
    if (mapRef.current && !mapInstance.current && window.google) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 37.5665, lng: 126.9780 }, // 서울 기본 위치
        minZoom: 5,
        maxZoom: 15, // 확대/축소 제한 설정
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        disableDefaultUI: false,
      });

      // 지도 클릭 이벤트 추가
      mapInstance.current.addListener('click', (event) => {
        if (isPlacingMarker) {
          addMarker(event.latLng); // 클릭한 위치에 마커 추가
        }
      });
    }
  }, [isPlacingMarker]);

  // 마커 추가 함수
  const addMarker = (location) => {
    const newMarker = {
      id: markers.length + 1, // 고유 id 부여
      name: `마커 ${markers.length + 1}`,
      coordinates: `${location.lat()}, ${location.lng()}`, // 클릭한 좌표
      model: '모델 A',
    };

    // 새로운 마커 추가
    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

    // 마커 추가 후 모드 종료
    setIsPlacingMarker(false);
  };

  // 모달을 열고 선택된 마커 정보 설정
  const handleEditClick = (marker) => {
    setSelectedMarker(marker);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 마커 지정 모드로 전환
  const startPlacingMarker = () => {
    setIsPlacingMarker(true);
  };

  return (
    <div style={mainContainerStyle}>
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

      {/* 사이드바와 상세 바를 함께 배치 */}
      <div style={sidebarWrapperStyle}>
        <Sidebar setSelectedSection={setSelectedSection} />
      </div>

      {/* 선택된 섹션에 따른 목록 표시 */}
      <div
        style={{
          ...detailSectionStyle,
          transform: selectedSection !== '' ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.5s ease',
        }}
      >
        {/* 마커 목록 표시 (selectedSection === 0) */}
        {selectedSection === 0 && (
          <>
            <div style={detailHeaderStyle}>
              <button style={closeButtonStyle} onClick={() => setSelectedSection('')}>X</button>
            </div>
            <h3 style={{ textAlign: 'center' }}>마커 목록</h3>
            {markers.map((marker) => (
              <div key={marker.id} style={markerItemStyle}>
                <img
                  src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png"
                  alt="Marker Icon"
                  style={markerIconStyle}
                />
                <div style={markerTextStyle}>
                  <div style={markerNameStyle}>
                    <strong>{marker.name}</strong>
                    <div style={markerModelStyle}>{marker.model}</div>
                  </div>
                  <div style={markerCoordinatesStyle}>좌표: {marker.coordinates}</div>
                </div>
                <button style={editButtonStyle} onClick={() => handleEditClick(marker)}>
                  <FaEdit />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 지도 */}
      <div style={mapWrapperStyle}>
        <LoadScriptNext
          googleMapsApiKey="AIzaSyCj-nZeQ2J0gl-NvEEjJSh6inRhSPfTDm8"
          loadingElement={<div>지도를 로딩 중입니다...</div>}
        >
          <div ref={mapRef} style={mapContainerStyle} />
        </LoadScriptNext>
      </div>

      {/* 마커 지정 버튼 */}
      <button style={placeMarkerButtonStyle} onClick={startPlacingMarker}>
        지도에서 지정하기
      </button>

      {/* 모달 컴포넌트 추가 */}
      <Modal show={isModalOpen} onClose={handleCloseModal} marker={selectedMarker} />
    </div>
  );
};

// 전체 레이아웃 스타일 (사이드바 + 상세 바와 지도 나란히 배치)
const mainContainerStyle = {
  display: 'flex',
  height: '100vh',
};

// 제목과 버튼을 감싸는 스타일
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

// 제목 스타일
const titleStyle = {
  fontSize: '17px',
  textAlign: 'center',
  flex: 1,
};

// 수정 버튼 스타일
const editButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '20px',
  padding: '0px',
  color: 'gray',
  paddingLeft: '5px',
};

// 체크 버튼 스타일
const checkButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '20px',
  padding: '0px',
  marginLeft: '5px',
  color: '#ccc',
};

// 제목 입력 필드 스타일
const inputStyle = {
  width: '100%',
  padding: '5px',
  fontSize: '17px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  textAlign: 'center',
};

// 사이드바 래퍼 스타일
const sidebarWrapperStyle = {
  zIndex: 3,
  width: '125px',
};

// 상세 바 스타일
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

// 상세 바 헤더 스타일
const detailHeaderStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
};

// 닫기 버튼 스타일
const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
};

// 마커 아이템 스타일
const markerItemStyle = {
  display: 'flex',
  alignItems: 'flex-start', // 아이콘과 텍스트 상단 맞춤
  justifyContent: 'space-between',
  padding: '10px',
  borderBottom: '1px solid #ccc',
};

// 마커 아이콘 스타일
const markerIconStyle = {
  width: '20px',
  height: '20px',
  marginRight: '10px',
  objectFit: 'contain', // 아이콘 찌그러짐 방지
};

// 마커 텍스트 스타일
const markerTextStyle = {
  flex: 1,
  marginLeft: '10px',
};

// 마커 이름 스타일
const markerNameStyle = {
  display: 'flex',
  justifyContent: 'space-between', // 이름과 모델명 정렬
  width: '100%',
};

// 마커 모델명 스타일 (오른쪽 배치)
const markerModelStyle = {
  color: 'gray',
  fontSize: '0.9rem',
};

// 마커 좌표 스타일
const markerCoordinatesStyle = {
  color: 'gray',
  fontSize: '0.8rem',
  marginTop: '5px', // 이름과 좌표 사이 간격
};

// 지도 컨테이너 스타일
const mapWrapperStyle = {
  flex: 1,
  position: 'relative',
  zIndex: 1,
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// 마커 지정 버튼 스타일
const placeMarkerButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  zIndex: 9999,
};

export default MapComponent;
