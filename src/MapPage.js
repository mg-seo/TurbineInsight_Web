import React, { useEffect, useRef, useState } from 'react';
import { LoadScriptNext } from '@react-google-maps/api';
import { FaEdit, FaCheck } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Modal from './Modal';
import './MapPage.css';

const MapComponent = () => {
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
  const businesses = [
    { id: 1, name: '사업 1', color: '#FF0000', markers: [{ lat: 37.5665, lng: 126.9780 }] },
    { id: 2, name: '사업 2', color: '#0000FF', markers: [{ lat: 37.5775, lng: 126.9880 }] },
  ];

  useEffect(() => {
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

  const handleMapClick = (location) => {
    const marker = new window.google.maps.Marker({
      position: location,
      map: mapInstance.current,
      title: `마커 ${markers.length + 1}`,
      animation: window.google.maps.Animation.DROP,
    });

    const newMarker = {
      id: markers.length + 1,
      name: `마커 ${markers.length + 1}`,
      position: location,
      markerInstance: marker,
    };

    window.google.maps.event.addListenerOnce(marker, 'animation_changed', () => {
      setPendingMarker(newMarker);
      setIsModalOpen(true);
    });

    marker.addListener('click', () => handleEditMarker(newMarker));
  };

  const handleBusinessMarkerToggle = async (business, checked) => {
    const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary('marker');

    if (checked) {
      const newBusinessMarkers = business.markers.map((marker) => {
        const pinBackground = new PinElement({
          background: business.color,
        });

        return new AdvancedMarkerElement({
          position: marker,
          map: mapInstance.current,
          content: pinBackground.element,
        });
      });
      setBusinessMarkers((prev) => [...prev, ...newBusinessMarkers]);
    } else {
      businessMarkers.forEach((marker) => marker.setMap(null));
      setBusinessMarkers([]);
    }
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

  const handleRegisterMarker = (updatedMarker) => {
    setMarkers((prevMarkers) => [...prevMarkers, updatedMarker]);
    setPendingMarker(null);
    setIsModalOpen(false);
  };

  const handleDeleteMarker = (marker) => {
    marker.markerInstance.setMap(null);
    setMarkers((prevMarkers) => prevMarkers.filter((m) => m.id !== marker.id));
    setPendingMarker(null);
    setIsModalOpen(false);
  };

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
        libraries={['marker']}
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
                    <strong>{marker.name}</strong>
                  </div>
                  <div className="marker-coordinates">
                    좌표: {marker.position.lat().toFixed(6)}, {marker.position.lng().toFixed(6)}
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
            {businesses.map((business) => (
              <div key={business.id} className="marker-item">
                <input
                  type="checkbox"
                  onChange={(e) => handleBusinessMarkerToggle(business, e.target.checked)}
                />
                <span>{business.name}</span>
              </div>
            ))}
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
      />
    </div>
  );
};

export default MapComponent;
