import React, { useEffect, useRef } from 'react';
import { LoadScriptNext } from '@react-google-maps/api';
import Sidebar from './SideBar';


const MapComponent = () => {
  const mapRef = useRef(null);

  const handleLoad = () => {
    if (mapRef.current && window.google) {
      // Google Maps 객체 생성
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 37.5665, lng: 126.9780 }, // 서울 기본 위치
        minZoom: 5,
        maxZoom: 15, // 확대/축소 제한 설정
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        disableDefaultUI: false
        
      });
    }
  };

  return (
    <div style={mapPageContainerStyle}>
      <Sidebar /> {/* 사이드바 추가 */}
    <LoadScriptNext
      googleMapsApiKey="AIzaSyCj-nZeQ2J0gl-NvEEjJSh6inRhSPfTDm8"
      onLoad={handleLoad}
      loadingElement={<div>지도를 로딩 중입니다...</div>}
    >
      <div ref={mapRef} style={mapContainerStyle} />
    </LoadScriptNext>
    </div>
  );

};
// 전체 레이아웃 스타일
const mapPageContainerStyle = {
    display: 'flex',
    height: '100vh',
  };
  
  // 지도 컨테이너 스타일
  const mapContainerStyle = {
    flex: 1,
    height: '100vh',
  };
  

export default MapComponent;
