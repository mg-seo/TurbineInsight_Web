import React, { useEffect, useRef, useState } from 'react';
import { LoadScriptNext } from '@react-google-maps/api';
import Sidebar from './Sidebar'; // 사이드바 컴포넌트

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null); // Google Maps 객체를 저장할 Ref
  const [selectedSection, setSelectedSection] = useState(null); // 선택된 섹션 상태 관리
  const [sectionData, setSectionData] = useState(null); // 섹션의 상세 데이터 상태 관리

  // 지도를 처음 로드할 때 한 번만 초기화
  useEffect(() => {
    if (mapRef.current && !mapInstance.current && window.google) {
      // Google Maps 객체 생성
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
    }
  }, []);

  // 섹션 클릭 시 비동기로 상세 정보 로딩
  const handleSectionClick = async (index) => {
    setSelectedSection(null); // 이전 선택 초기화
    setSectionData(null);

    try {
      // 실제 API 호출 - 여기서는 jsonplaceholder에서 샘플 데이터 가져옴
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${index + 1}`);
      if (!response.ok) {
        throw new Error('네트워크 응답에 문제가 있습니다.');
      }
      const data = await response.json();
      setSectionData(data);
      setSelectedSection(index);
    } catch (error) {
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
    }
  };

  return (
    <div style={mainContainerStyle}>
      {/* 사이드바와 상세 바가 함께 있는 컨테이너 */}
      <div style={sidebarWithDetailContainerStyle}>
        <Sidebar setSelectedSection={handleSectionClick} /> {/* 사이드바 추가 */}

        {/* 오른쪽에 추가적인 상세 바 표시 */}
        <div
          style={{
            ...detailSectionStyle,
            transform: selectedSection !== null ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.5s ease', // 트랜지션 효과 추가 (왼쪽에서 오른쪽으로 이동)
          }}
        >
          {selectedSection !== null && sectionData && (
            <>
              <h3>{sectionData.title}</h3>
              <p>{sectionData.body}</p>
            </>
          )}
        </div>
      </div>

      {/* 지도 */}
      <LoadScriptNext
        googleMapsApiKey="AIzaSyCj-nZeQ2J0gl-NvEEjJSh6inRhSPfTDm8"
        onLoad={() => {
          // 지도를 로드할 때 한 번만 실행, 이미 로드된 경우 무시
          if (mapRef.current && !mapInstance.current) {
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
          }
        }}
        loadingElement={<div>지도를 로딩 중입니다...</div>}
      >
        <div ref={mapRef} style={mapContainerStyle} />
      </LoadScriptNext>
    </div>
  );
};

// 전체 레이아웃 스타일 (사이드바 + 상세 바와 지도 나란히 배치)
const mainContainerStyle = {
  display: 'flex',
  height: '100vh',
};

// 사이드바와 상세 바 컨테이너 스타일 (가로로 나란히 배치)
const sidebarWithDetailContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  height: '100vh',
};

// 상세 바 스타일
const detailSectionStyle = {
  width: '150px', // 상세 바의 너비
  background: '#f9f9f9',
  padding: '20px',
  boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
  overflowY: 'auto',
  position: 'relative', // 위치 속성 추가
};

// 지도 컨테이너 스타일
const mapContainerStyle = {
  flex: 1,
  height: '100vh',
};

export default MapComponent;
