import React, { useEffect, useRef, useState } from 'react';
import { LoadScriptNext } from '@react-google-maps/api';
import { FaEdit, FaCheck } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Modal from './Modal';
import api from './api';
import './MapPage.css';

const libraries = ['marker'];

const MapPage = ({ business }) => {
  const businessId = business?.id; // business.id에서 가져오기

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('가산 해상풍력단지');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingMarker, setPendingMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [businessMarkers, setBusinessMarkers] = useState([]);
  const [restrictAreaFiles, setRestrictAreaFiles] = useState([
    { fileName: 'fish.geojson', displayName: '어류 보호구역', color: '#FF0000', isChecked: false },
    { fileName: 'mammalia.geojson', displayName: '포유류 보호구역', color: '#0000FF', isChecked: false },
    { fileName: 'reptile.geojson', displayName: '파충류 보호구역', color: '#00FF00', isChecked: false },
    { fileName: 'seaweed.geojson', displayName: '해조류 보호구역', color: '#FFA500', isChecked: false },
    { fileName: 'prtwt_surface.geojson', displayName: '표면 보호구역', color: '#800080', isChecked: false },
    { fileName: 'pwtrs_a.geojson', displayName: '담수 보호구역', color: '#FFFF00', isChecked: false },
    { fileName: 'wld_lvb_pzn_a.geojson', displayName: '야생 서식지', color: '#00FFFF', isChecked: false },
    { fileName: 'intb_anml_a.geojson', displayName: '국내동물 보호구역', color: '#FFC0CB', isChecked: false },
  ]);

  useEffect(() => {
    console.log("MapPage received business:", business);

    const initMap = () => {
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
          mapId: 'DEMO_MAP_ID',
        });

        mapInstance.current.addListener('click', (event) => {
          handleMapClick(event.latLng);
        });
      }
    };

    if (isMapLoaded) initMap();
  }, [isMapLoaded]);

  useEffect(() => {
    const fetchMarkers = async () => {
      if (!business?.id) return;

      console.log("Fetching markers for businessId:", business.id);
      try {
        const response = await api.get(`/api/businesses/map/${business.id}`);
        console.log("Fetched markers data:", response.data);
        setMarkers(response.data);
      } catch (error) {
        console.error('Error fetching marker data:', error);
      }
    };

    fetchMarkers();
  }, [business]);

  // 지도에 마커 추가
  useEffect(() => {
    if (mapInstance.current && markers.length > 0) {
      markers.forEach((markerData) => {
        const marker = new window.google.maps.Marker({
          position: { lat: markerData.latitude, lng: markerData.longitude },
          map: mapInstance.current,
          title: markerData.markerName,
        });
      });
    }
  }, [markers]);

  const handleMapClick = (location) => {
    const marker = new window.google.maps.Marker({
      position: location,
      map: mapInstance.current,
      title: `마커 ${markers.length + 1}`,
      animation: window.google.maps.Animation.DROP,
    });
  
    const newMarker = {
      id: markers.length + 1,
      name: `마커 ${markers.length + 1}`, // 기본 이름 설정
      position: location,
      latitude: location.lat(),
      longitude: location.lng(),
      markerInstance: marker,
    };
  
    window.google.maps.event.addListenerOnce(marker, 'animation_changed', () => {
      setPendingMarker(newMarker);
      setIsModalOpen(true);
    });
  
    marker.addListener('click', () => handleEditMarker(newMarker));
  };
  

  const handleRestrictAreaToggle = async (area, checked) => {
    const { fileName, color } = area;
    const filePath = `/geojson/${fileName}`;

    setRestrictAreaFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.fileName === fileName ? { ...file, isChecked: checked } : file
      )
    );

    if (checked) {
      try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error("Failed to load GeoJSON data");
        const geoJsonData = await response.json();

        const addedFeatures = mapInstance.current.data.addGeoJson(geoJsonData);
        addedFeatures.forEach((feature) => {
          feature.setProperty("fileName", fileName);
          mapInstance.current.data.overrideStyle(feature, {
            fillColor: color,
            strokeColor: color,
            strokeWeight: 2,
            fillOpacity: 0.4,
          });
        });

        setMarkers((prevMarkers) => {
          return prevMarkers.filter((marker) => {
            const isInRestrictedArea = addedFeatures.some((feature) => {
              return (
                feature.getGeometry().getType() === 'Polygon' &&
                window.google.maps.geometry.poly.containsLocation(
                  marker.position,
                  feature.getGeometry()
                )
              );
            });
            if (isInRestrictedArea) {
              marker.markerInstance.setMap(null);
              return false;
            }
            return true;
          });
        });
      } catch (error) {
        console.error("Error loading GeoJSON data:", error);
      }
    } else {
      mapInstance.current.data.forEach((feature) => {
        if (feature.getProperty("fileName") === fileName) {
          mapInstance.current.data.remove(feature);
        }
      });
    }
  };

  const handleRegisterMarker = async (updatedMarker) => {
    try {
      // markerId가 유효한지 확인
      const markerData = {
        ...updatedMarker,
        businessId: businessId, // 추가된 비즈니스 ID
      };
  
      const response = await api.post('/api/businesses/map/post/marker/save', markerData);
      const savedMarker = response.data; // 서버로부터 반환된 마커 정보
  
      // 마커가 존재하는지 확인 후 추가/수정
      setMarkers((prevMarkers) => {
        const markerExists = prevMarkers.some(marker => marker.markerId === savedMarker.markerId);
        
        if (markerExists) {
          return prevMarkers.map(marker =>
            marker.markerId === savedMarker.markerId ? savedMarker : marker
          );
        } else {
          return [...prevMarkers, savedMarker];
        }
      });
      
      setPendingMarker(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save marker:", error);
    }
  };
  

// 마커 삭제 함수
const handleDeleteMarker = async (markerId) => {
  try {
    await api.delete(`/api/businesses/map/delete/marker/${markerId}`);
    console.log("Marker deleted");
    
    // 마커 삭제 후 UI 업데이트
    setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.markerId !== markerId));
  } catch (error) {
    console.error("Error deleting marker:", error);
  }
};

// 마커 수정 모달 열기 함수
const handleEditMarker = (marker) => {
  setPendingMarker(marker);
  setIsModalOpen(true);
};


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPendingMarker(null);
  };

  return (
    <div className="main-container">
      <LoadScriptNext
        googleMapsApiKey="AIzaSyCj-nZeQ2J0gl-NvEEjJSh6inRhSPfTDm8"
        libraries={libraries}
        onLoad={() => setIsMapLoaded(true)}
        loadingElement={<div>지도를 로딩 중입니다...</div>}
      >
        <div ref={mapRef} className="map-container" />
      </LoadScriptNext>

      <div className="title-wrapper">
        {isEditing ? (
          <>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="title-input"
            />
            <button className="check-button" onClick={() => setIsEditing(false)}>
              <FaCheck />
            </button>
          </>
        ) : (
          <>
            <div className="title">{title}</div>
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              <FaEdit />
            </button>
          </>
        )}
      </div>

      <div className="sidebar-wrapper">
        <Sidebar setSelectedSection={setSelectedSection} />
      </div>

      <div
        className="detail-section"
        style={{ transform: selectedSection !== '' ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {selectedSection === 0 && (
          <>
            <div className="detail-header">
              <button className="close-button" onClick={() => setSelectedSection('')}>X</button>
            </div>
            <h3 className="section-title">마커 목록</h3>
            {markers.map((marker, index) => (
              <div key={index} className="marker-item">
                <img
                  src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png"
                  alt="Marker Icon"
                  className="marker-icon"
                />
                <div className="marker-text">
                  <div className="marker-name">
                    <strong>{marker.markerName}</strong>
                  </div>
                  <div className="marker-coordinates">
                    좌표: {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
                  </div>
                </div>
                <button className="edit-button" onClick={() => handleEditMarker(marker)}>
                  <FaEdit />
                </button>
              </div>
            ))}
          </>
        )}

        {selectedSection === 1 && (
          <>
            <div className="detail-header">
              <button className="close-button" onClick={() => setSelectedSection('')}>X</button>
            </div>
            <h3 className="section-title">사업 목록</h3>
          </>
        )}

        {selectedSection === 2 && (
          <>
            <div className="detail-header">
              <button className="close-button" onClick={() => setSelectedSection('')}>X</button>
            </div>
            <h3 className="section-title">규제 지역</h3>
            {restrictAreaFiles.map((area) => (
              <div key={area.fileName} className="marker-item">
                <input
                  type="checkbox"
                  checked={area.isChecked}
                  onChange={(e) => handleRestrictAreaToggle(area, e.target.checked)}
                />
                <span>{area.displayName}</span>
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
        markersLength={markers.length} // 여기서 props로 전달
        businessId={business.id} // businessId를 전달합니다.

      />
    </div>
  );
};

export default MapPage;
