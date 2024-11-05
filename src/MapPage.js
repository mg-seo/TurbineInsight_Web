import React, { useEffect, useRef, useState } from 'react';
import { LoadScriptNext } from '@react-google-maps/api';
import { FaEdit, FaCheck } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Modal from './Modal';
import api from './api';
import './MapPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const libraries = ['marker'];

const MapPage = ({ business, userId }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingMarker, setPendingMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [businessList, setBusinessList] = useState([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState([]);
  const [otherMarkers, setOtherMarkers] = useState({}); // 다른 사업 마커를 저장할 상태
  const [canPlaceMarker, setCanPlaceMarker] = useState(true); // 마커 찍기 가능 여부 상태
  const [regulatedAreas, setRegulatedAreas] = useState([]); // 규제지역 목록 상태
  const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFA500', '#800080', '#FFFF00', '#00FFFF', '#FFC0CB']; // 색상 배열

  useEffect(() => {
    // 제목 불러오기
    if (business && business.name) {
      setTitle(business.name); // business에서 제목 설정
    }
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
        setIsMapLoaded(true); // 맵이 완전히 로드됨을 설정

        mapInstance.current.addListener('click', (event) => {
          if(canPlaceMarker) {
            handleMapClick(event.latLng);

          }

        });
      }
    };

    if (isMapLoaded) initMap();
  }, [isMapLoaded, canPlaceMarker, business]);
 // 제목 업데이트 함수
 const updateTitle = async () => {
  try {
    const response = await api.put(`/api/businesses/updateName/${business.id}`, null, {
      params: { businessName: title }, // 제목을 파라미터로 전달
    });
    console.log('Updated business title:', response.data);
    setIsEditing(false); // 편집 모드를 종료합니다.
  } catch (error) {
    console.error('Failed to update title:', error);
  }
};
const fetchMarkers = async () => {
  if (!business?.id) return;

  try {
    const response = await api.get(`/api/businesses/map/get/marker/${business.id}`);
    
    if (Array.isArray(response.data)) {
      console.log("Fetched markers:", response.data);

      // 기존 마커 제거
      markers.forEach(marker => {
        if (marker.markerInstance) {
          marker.markerInstance.setMap(null); // 지도에서 마커 제거
        }
      });

      // 마커 배열 초기화
      setMarkers([]);

      // 새 마커 추가 (애니메이션 조건부 적용)
      const newMarkers = response.data.map((markerData) => {
        const existingMarker = markers.find(m => m.markerId === markerData.markerId);
        
        const markerInstance = new window.google.maps.Marker({
          position: { lat: markerData.latitude, lng: markerData.longitude },
          map: mapInstance.current,
          title: markerData.markerName,
          animation: existingMarker ? null : window.google.maps.Animation.DROP, // 기존 마커일 경우 애니메이션 없음
        });

        markerInstance.addListener('click', () => handleEditMarker(markerData));

        return { ...markerData, markerInstance };
      });

      setMarkers(newMarkers); // 상태에 새 마커 설정
    } else {
      console.warn("No markers found for this business ID:", business.id);
      setMarkers([]); // 빈 배열로 설정하여 UI에서 마커가 없음을 반영
    }
  } catch (error) {
    console.error("Error fetching markers:", error.response?.data || error.message);
  }
};

  useEffect(() => {
    if (isMapLoaded && business?.id) {
      fetchMarkers(); // 지도 로드 후 fetchMarkers 호출
    }
  }, [isMapLoaded, business?.id]);

  // 상태 외에 플래그 변수를 추가하여 클릭 이벤트 차단 제어
// 전역 플래그 변수 추가
let isPlacingMarker = false;

const handleMapClick = (location) => {
  if (!canPlaceMarker || isPlacingMarker) {
    console.log("마커 추가가 비활성화된 상태입니다.");
    return;
  }

  // 클릭 즉시 추가 마커 차단
  isPlacingMarker = true;
  setCanPlaceMarker(false); 

  if (!business?.id) {
    console.error("Business ID is undefined.");
    return;
  }

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
    latitude: location.lat(),
    longitude: location.lng(),
    markerInstance: marker,
    businessId: business.id,
  };

  window.google.maps.event.addListenerOnce(marker, 'animation_changed', () => {
    setPendingMarker(newMarker);
    setIsModalOpen(true);
    isPlacingMarker = false; // 모달이 열리면서 다시 클릭 허용
  });

  marker.addListener('click', () => handleEditMarker(newMarker));
};

  useEffect(() => {
    const fetchBusinessList = async () => {
      try {
        console.log(`Fetching businesses for userId: ${userId}`);
        const response = await api.get(`/api/businesses/list/${userId}`);
        console.log('API Response:', response.data); // 응답 데이터 확인
  
        // 현재 선택된 사업 ID를 제외한 나머지 사업만 필터링
        const filteredList = response.data.filter(item => item.businessId !== business.id);
        console.log('Filtered Business List:', filteredList);
        setBusinessList(filteredList);
      } catch (error) {
        console.error('Error fetching business list:', error);
      }
    };
  
    if (userId) {
      fetchBusinessList();
    }
  }, [userId, business.id]);
  
  // 마커 등록 및 수정 함수
const handleRegisterMarker = async (updatedMarker) => {
  try {
    const markerData = {
      ...updatedMarker,
      businessId: business.id,
    };

    if (pendingMarker?.markerId) {
      // 기존 마커 업데이트
      await api.post(`/api/businesses/map/post/marker/update/${pendingMarker.markerId}`, markerData);
      toast.success("마커가 수정 되었습니다.")
    } else {
      // 새로운 마커 추가
      await api.post('/api/businesses/map/post/marker/add', markerData);
      toast.success("마커가 새로 추가되었습니다.")
    }

    // 마커 목록 재조회하여 최신 상태 유지
    await fetchMarkers();

    // 상태 초기화 및 모달 닫기
    setIsModalOpen(false);
    setPendingMarker(null); // 선택된 마커 초기화
    setCanPlaceMarker(true); // 마커 추가 허용
    
  } catch (error) {
    console.error("Failed to save marker:", error);
  }
};
  
  

  const markerInstances = useRef([]); // 마커 인스턴스를 저장하는 배열

  const handleDeleteMarker = async (markerId) => {
    try {
      await api.delete(`/api/businesses/map/delete/marker/${markerId}`);
      toast.success("마커가 삭제되었습니다.")
      // UI에서 마커 제거 및 지도에서 해당 마커 삭제
      setMarkers((prevMarkers) => {
        return prevMarkers.filter((marker) => {
          if (marker.markerId === markerId) {
            if (marker.markerInstance) {
              console.log("Removing marker from map:", marker.markerId);
              marker.markerInstance.setMap(null); // 지도에서 마커 제거
            }
            return false; // 상태에서 제거
          }
          return true;
        });
      });
  
      // markerInstances 배열에서도 해당 마커 인스턴스 제거
      markerInstances.current = markerInstances.current.filter(instance => {
        if (instance.markerId === markerId) {
          instance.setMap(null); // 지도에서 마커 제거
          return false;
        }
        return true;
      });
  
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting marker:", error);
    }
  };
//사업 상세보기
const handleBusinessToggle = (businessId, isChecked, index) => {
  if (isChecked) {
    if (selectedBusinesses.length >= 3) {
      toast.warn("최대 3개까지 선택할 수 있습니다."); // 알림 메시지
      return;
    }
    fetchOtherBusinessMarkers(businessId, index); // 인덱스를 함께 전달
    setSelectedBusinesses((prev) => [...prev, businessId]);
  } else {
    if (otherMarkers[businessId]) {
      otherMarkers[businessId].forEach(marker => {
        marker.markerInstance.setMap(null);
      });
      setOtherMarkers((prevMarkers) => {
        const updatedMarkers = { ...prevMarkers };
        delete updatedMarkers[businessId];
        return updatedMarkers;
      });
    }
    setSelectedBusinesses((prev) => prev.filter((id) => id !== businessId));
  }
};


// 다른 사업의 마커를 가져와 지도에 추가하는 함수
const fetchOtherBusinessMarkers = async (otherBusinessId, index) => {
  if (!isMapLoaded) return; // Google Maps API가 로드되지 않았다면 실행하지 않음

  try {
    const response = await api.get(`/api/businesses/map/get/marker/${otherBusinessId}`);
    if (Array.isArray(response.data)) {
      // 색상 설정 (3개의 사업까지 허용)
      let backgroundColor, borderColor, glyphColor;
      switch (index) {
        case 0: // 파랑
          backgroundColor = "#0000FF";
          borderColor = "#000080";
          glyphColor = "#000080";
          break;
        case 1: // 노랑
          backgroundColor = "#FFFF00";
          borderColor = "#CCCC00";
          glyphColor = "#CCCC00";
          break;
        case 2: // 초록
          backgroundColor = "#008000";
          borderColor = "#006400";
          glyphColor = "#006400";
          break;
        default:
          backgroundColor = "#FF0000"; // 기본 빨간색 (예외 처리용)
          borderColor = "#800000";
          glyphColor = "#800000";
      }

      const newMarkers = response.data.map((markerData) => {
        const pinElement = new window.google.maps.marker.PinElement({
          background: backgroundColor,
          borderColor: borderColor,
          glyphColor: glyphColor,
        });

      // 초기 위치 설정
  pinElement.element.style.transition = "transform 0.2s ease-out";
  pinElement.element.style.transform = "translateY(-500px)"; // 화면 위에서 시작

  // 드롭 애니메이션 시작 후 반동 효과
  setTimeout(() => {
    pinElement.element.style.transform = "translateY(0)"; // 원래 위치로 착지

    // 반동 효과: 처음 위치에 도달 후 반동 설정
    setTimeout(() => {
      pinElement.element.style.transition = "transform 0.1s ease-in-out";
      pinElement.element.style.transform = "translateY(-15px)"; // 살짝 위로 올라감

      // 원래 위치로 돌아오는 동작
      setTimeout(() => {
        pinElement.element.style.transform = "translateY(0)";
      }, 100);

    }, 200); // 착지 후 반동 시작 시간
  }, 50); // 드롭 애니메이션 시작 시간

        const markerInstance = new window.google.maps.marker.AdvancedMarkerElement({
          map: mapInstance.current,
          position: { lat: markerData.latitude, lng: markerData.longitude },
          content: pinElement.element,
        });

        return { ...markerData, markerInstance };
      });

      setOtherMarkers((prevMarkers) => ({
        ...prevMarkers,
        [otherBusinessId]: newMarkers,
      }));
    }
  } catch (error) {
    console.error("Error fetching other business markers:", error.message);
  }
};


const handleEditMarker = (marker) => {
  console.log("Received marker in handleEditMarker:", marker); // handleEditMarker로 전달된 marker
  setPendingMarker(marker); // marker를 pendingMarker에 설정
  setIsModalOpen(true); // 모달 열기
};



const handleCloseModal = () => {
  if (!pendingMarker?.markerId && pendingMarker?.markerInstance) {
    // 새로운 마커일 경우에만 지도에서 제거
    pendingMarker.markerInstance.setMap(null);
  }
  setIsModalOpen(false); // 모달 창 닫기
  setPendingMarker(null); // pendingMarker 초기화
  setCanPlaceMarker(true); // 마커 찍기 허용 상태로 변경
};
 // 사용자 ID로 규제지역 목록을 불러오기
 useEffect(() => {
  if (userId) {
    api.get(`/api/businesses/regulatedArea/list/${userId}`)
      .then((response) => {
        const areasWithColors = response.data.map((area, index) => ({
          ...area,
          color: colors[index % colors.length],
          isChecked: false
        }));
        setRegulatedAreas(areasWithColors);
      })
      .catch((error) => {
        console.error("Error fetching regulated areas:", error);
      });
  }
}, [userId]);

// 규제지역의 GeoJSON 파일을 로드하여 지도에 표시하는 함수
const handleAreaToggle = async (areaId, checked) => {
  setRegulatedAreas(prevAreas =>
    prevAreas.map(area =>
      area.areaId === areaId ? { ...area, isChecked: checked } : area
    )
  );

  const area = regulatedAreas.find((item) => item.areaId === areaId);

  if (checked) {
    try {
      const response = await fetch(area.filePath);
      if (!response.ok) throw new Error("Failed to load GeoJSON data");
      const geoJsonData = await response.json();

      const addedFeatures = mapInstance.current.data.addGeoJson(geoJsonData);
      addedFeatures.forEach((feature) => {
        feature.setProperty("areaId", area.areaId);
        mapInstance.current.data.overrideStyle(feature, {
          fillColor: area.color,
          strokeColor: area.color,
          strokeWeight: 2,
          fillOpacity: 0.4,
        });
      });
      // 기존 클릭 이벤트 리스너를 제거
      window.google.maps.event.clearListeners(mapInstance.current.data, "click");
      
      mapInstance.current.data.addListener("click", (event) => {
        const clickedAreaId = event.feature.getProperty("areaId");
        if (clickedAreaId === areaId) {
          toast.warn(`${area.areaName} 지역에는 마커를 추가 할 수 없습니다.`);
        }
      });
    } catch (error) {
      console.error("Error loading GeoJSON data:", error);
    }
  } else {
    mapInstance.current.data.forEach((feature) => {
      if (feature.getProperty("areaId") === area.areaId) {
        mapInstance.current.data.remove(feature);
      }
    });
  }
};

  return (
    
    <div className="main-container">
      <ToastContainer 
        position="bottom-center"
        autoClose={2000}
      />
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
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="title-input" />
            <button className="check-button" onClick={updateTitle}>
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
                     {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
                  </div>
                </div>
                <button className="edit-button" onClick={() => {
                  console.log("Marker data from Sidebar edit button:", marker); // Sidebar에서 전달되는 marker
                  handleEditMarker(marker);

                }}>      

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
            {businessList.map((item, index) => (
              <div key={item.businessId} className="marker-item">
                <input
                  type="checkbox"
                  checked={selectedBusinesses.includes(item.businessId)} // 체크 상태 유지
                  onChange={(e) => handleBusinessToggle(item.businessId, e.target.checked, index)}
                />
                <span>{item.businessName}</span> {/* 사업 이름 표시 */}
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
            {regulatedAreas.map((area) => (
              <div key={area.areaId} className="marker-item">
                <input
                  type="checkbox"
                  checked={area.isChecked} // 초기 상태는 false로 설정
                  onChange={(e) => handleAreaToggle(area.areaId, e.target.checked)}
                />
                <span>{area.areaName}</span> {/* 규제지역 이름을 표시 */}
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
        business={business} // businessId 전달

      />
    </div>
  );
};

export default MapPage;
