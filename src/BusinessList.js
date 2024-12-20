import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './BusinessList.css'; // Assuming you have some CSS for styling
import { MdAdd, MdDelete, MdSearch, MdClose, MdEdit, MdCheck } from 'react-icons/md';
import { FaBars } from 'react-icons/fa';
import { AiOutlineDown, AiOutlineUp, AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { IoCloseCircleOutline } from 'react-icons/io5';
import headerImage from './img/header_proto01.png';
import banner01 from './img/banner01.png';
import banner02 from './img/banner02.png';
import banner03 from './img/banner03.png';
import api from './api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BusinessList = ({ setSelectedBusiness, userId }) => {

    const maxSize = 5 * 1024 * 1024; //파일 업로드 5MB 제한

    // 서버에서 유저, 사업체 목록 가져오기
    const [userInfo, setUserInfo] = useState(null);
    const [businesses, setBusinesses] = useState([]);

    useEffect(() => {
        if (userId) {
            //사용자 정보 조회
            api.get(`/api/businesses/${userId}`)
                .then((response) => {
                    setUserInfo(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error);
                });
            
            //사업 정보 조회
            api.get(`/api/businesses/list/${userId}`)
                .then((response) => {
                    // 서버에서 가져온 데이터를 정렬하여 상태에 저장
                    const sortedData = response.data
                        .map((business) => ({
                            id: business.businessId,
                            name: business.businessName,
                            date: new Date(business.createdDate),
                            lastModifiedDate: new Date(business.lastModifiedDate),
                            images: [],
                            memo: business.memo || ''
                        }))
                        .sort((a, b) => b.lastModifiedDate - a.lastModifiedDate); // 내림차순 정렬
    
                    setBusinesses(sortedData);
                })
                .catch((error) => {
                    console.error('Error fetching business data:', error);
                });
        }
    }, [userId]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    // 메뉴 열기/닫기 토글 핸들러
    const handleMenuToggle = () => {
        setIsMenuOpen((prev) => !prev);
    };

    // 메뉴 외부 클릭 시 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 메뉴와 버튼 둘 다 외부일 때만 메뉴를 닫음
            if (
                menuRef.current && 
                buttonRef.current &&
                !menuRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleLogout = () => {
        sessionStorage.removeItem('userId');
        navigate('/');
    };
    
    // Slider state and functionality
    const [sliderIndex, setSliderIndex] = useState(0);
    
    const sliderImages = [
        banner01,
        banner02,
        banner03
    ];
    
    // 자동 슬라이드 기능
    useEffect(() => {
        const autoSlide = setInterval(() => {
            setSliderIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
        }, 3000); // 자동으로 3초마다 다음 슬라이드
        
        return () => clearInterval(autoSlide);
    }, []);
    

    // 수동 슬라이드 핸들러
    const handleNextSlide = () => {
        setSliderIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
    };

    const handlePrevSlide = () => {
        setSliderIndex((prevIndex) => (prevIndex - 1 + sliderImages.length) % sliderImages.length);
    };


    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCards, setExpandedCards] = useState({});
    const [popupImageIndex, setPopupImageIndex] = useState(null);
    const [popupBusinessId, setPopupBusinessId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBusinessId, setSelectedBusinessId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBusinessName, setNewBusinessName] = useState('');

    const addInputRef = useRef(null);
    const deleteModalRef = useRef(null);
    const navigate = useNavigate();

    // Business card handlers
    const handleBusinessClick = (business) => {
        setSelectedBusiness(business);
        navigate('/map', { state: { business } });
    };

    // 특정 사업체의 모든 이미지 가져오기
    const fetchImages = (businessId) => {
        api.get(`/api/businesses/business/${businessId}`)
            .then((response) => {
                setBusinesses((prevBusinesses) =>
                    prevBusinesses.map((business) =>
                        business.id === businessId
                            ? { ...business, images: response.data }
                            : business
                    )
                );
            })
            .catch((error) => console.error('Error fetching images:', error));
    };

    // 카드 확장 시 이미지 불러오기
    const handleExpandClick = (businessId) => {
        setExpandedCards((prev) => ({
            ...prev,
            [businessId]: !prev[businessId],
        }));
        if (!expandedCards[businessId]) fetchImages(businessId);
        
        const business = businesses.find((b) => b.id === businessId);
        setInitialMemo((prev) => ({
            ...prev,
            [businessId]: business.memo,
        }));
    };

    const [initialMemo, setInitialMemo] = useState({}); // 각 사업체의 초기 메모 상태
    const [isMemoEdited, setIsMemoEdited] = useState({}); // 각 사업체 별로 메모 수정 상태를 추적

    // Memo 저장 요청
    const handleSaveMemo = (businessId) => {
        if (isMemoEdited[businessId]) { // 수정된 경우만 저장
            const business = businesses.find((b) => b.id === businessId);
            api.put(`/api/businesses/updateMemo/${businessId}`, null, {
                params: { memo: business.memo }
            })
            .then((response) => {
                // 성공적으로 저장된 경우 초기 메모 상태 및 수정 상태 업데이트
                setBusinesses((prev) =>
                    prev.map((b) =>
                        b.id === businessId ? { ...b, memo: response.data.memo } : b
                    )
                );
                setInitialMemo(prev => ({ ...prev, [businessId]: response.data.memo }));
                setIsMemoEdited(prev => ({ ...prev, [businessId]: false }));
                toast.success('저장되었습니다.');
            })
            .catch((error) => {
                console.error('Error saving memo:', error);
                toast.error('저장에 실패하였습니다.');
            });
        }
    };

    // Memo 수정 시 호출
    const handleMemoChange = (businessId, e) => {
        const newMemo = e.target.value;
        const isEdited = newMemo !== initialMemo[businessId]; // 초기 상태와 비교

        setIsMemoEdited(prev => ({ ...prev, [businessId]: isEdited }));
        setBusinesses((prev) =>
            prev.map((business) =>
                business.id === businessId ? { ...business, memo: newMemo } : business
            )
        );

        // 텍스트 에어리어의 높이를 내용에 맞게 자동 조정
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
    };


    // 이미지 추가하기
    const handleAddImage = (businessId, event) => {
        const file = event.target.files[0];
        if (file) {

            if (file.size > maxSize) {
                toast.warn("파일 크기는 5MB를 초과할 수 없습니다.");
                setFileName(''); // 파일 초기화
                return;
            }

            const fileExtension = file.name.split('.').pop().toLowerCase(); // 파일 확장자 확인
            const allowedExtensions = ['jpg', 'jpeg', 'png'];
    
            if (!allowedExtensions.includes(fileExtension)) {
                toast.warn('오직 .jpg, .jpeg, .png 파일만 업로드 가능합니다.');
                event.target.value = ''; // 잘못된 파일을 선택한 경우 input을 비웁니다
                return; // 함수 종료
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("businessId", businessId);

            api.post("/api/businesses/add", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
                setBusinesses((prevBusinesses) =>
                    prevBusinesses.map((business) =>
                        business.id === businessId
                            ? { ...business, images: [...business.images, response.data] }
                            : business
                    )
                );
                toast.success('성공적으로 추가되었습니다.');
            })
            .catch((error) => {
                console.error("Error adding image:", error);
                toast.error('추가에 실패했습니다.');
            });
        }
    };

    // 이미지 삭제하기
    const handleDeleteImage = (businessId, imageId) => {
        api.delete(`/api/businesses/deleteImage/${imageId}`)
            .then(() => {
                setBusinesses((prevBusinesses) =>
                    prevBusinesses.map((business) =>
                        business.id === businessId
                            ? { ...business, images: business.images.filter((img) => img.imageId !== imageId) }
                            : business
                    )
                );
                toast.success('성공적으로 삭제되었습니다.');
            })
            .catch((error) => {
                console.error("Error deleting image:", error);
                toast.error('삭제에 실패했습니다.');
            });
    };

    // Delete business handlers
    const handleDeleteButtonClick = (businessId) => {
        setShowDeleteModal(true);
        setSelectedBusinessId(businessId);
        setTimeout(() => {
            if (deleteModalRef.current) {
                deleteModalRef.current.focus();
            }
        }, 0);
    };

    const handleConfirmDelete = () => {
        // 서버에 DELETE 요청 보내기
        api.delete(`/api/businesses/delete/${selectedBusinessId}`)
            .then(() => {
                // 삭제된 사업체를 화면에서도 제거
                setBusinesses((prev) => prev.filter((business) => business.id !== selectedBusinessId));
                setShowDeleteModal(false);
                setSelectedBusinessId(null);
                toast.success('성공적으로 삭제되었습니다.');
            })
            .catch((error) => {
                console.error('Error deleting business:', error);
                toast.error('삭제에 실패했습니다.');
            });
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedBusinessId(null);
    };

    const handleKeyPressDelete = (e) => {
        if (e.key === 'Enter') {
            handleConfirmDelete();
        }
    };

    // Add business handlers
    const handleAddButtonClick = () => {
        setShowAddModal(true);
        setTimeout(() => {
            if (addInputRef.current) {
                addInputRef.current.focus();
            }
        }, 0);
    };

    const handleAddBusiness = () => {
        if (newBusinessName.trim() !== '') {
            // 서버에 새 사업체 추가 요청
            api.post('/api/businesses/create', null, {
                params: { businessName: newBusinessName, userId }
            })
            .then((response) => {
                const newBusiness = {
                    id: response.data.businessId,
                    name: response.data.businessName,
                    date: new Date(response.data.createdDate).toLocaleDateString(),
                    lastModifiedDate: new Date(response.data.lastModifiedDate),
                    images: [],
                    memo: response.data.memo || ''
                };
                
                // 새로운 사업체를 businesses 목록에 추가
                setBusinesses((prev) => [newBusiness, ...prev]); // 최근 항목을 위로 추가
                setShowAddModal(false);
                setNewBusinessName('');
                toast.success('성공적으로 추가되었습니다.');
            })
            .catch((error) => {
                console.error('Error creating new business:', error);
                toast.error('추가에 실패했습니다.');
            });
        }
    };

    const handleCancelAdd = () => {
        setShowAddModal(false);
        setNewBusinessName('');
    };

    const handleKeyPressAdd = (e) => {
        if (e.key === 'Enter') {
            handleAddBusiness();
        }
    };

    // Filtered businesses based on search term
    const filteredBusinesses = businesses.filter((business) =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Image popup handlers
    const handleImageClick = (businessId, imageIndex) => {
        setPopupBusinessId(businessId);
        setPopupImageIndex(imageIndex);
    };

    const handleClosePopup = () => {
        setPopupBusinessId(null);
        setPopupImageIndex(null);
    };

    const handleNextImage = () => {
        setPopupImageIndex((prevIndex) => {
            const business = businesses.find((b) => b.id === popupBusinessId);
            return (prevIndex + 1) % business.images.length;
        });
    };

    const handlePrevImage = () => {
        setPopupImageIndex((prevIndex) => {
            const business = businesses.find((b) => b.id === popupBusinessId);
            return (prevIndex - 1 + business.images.length) % business.images.length;
        });
    };

    //규제지역 업로드 모달
    const [showAreaModal, setShowAreaModal] = useState(false);
    const [regulatedAreas, setRegulatedAreas] = useState([]); // 규제지역 목록 상태
    const [editMode, setEditMode] = useState({});
    const [areaName, setAreaName] = useState(''); // 수정할 규제지역 이름
    const [fileName, setFileName] = useState('');

    // 모달 열기 및 닫기
    const openAreaModal = () => {
        setIsMenuOpen(false);
        setShowAreaModal(true)
    };
    const closeAreaModal = () => {
        setShowAreaModal(false);
        setFileName(''); // 초기화
        setAreaName(''); // 초기화
    };

    // 규제지역 목록 불러오기
    useEffect(() => {
        if (userId) {
            api.get(`/api/businesses/regulatedArea/list/${userId}`)
                .then((response) => {
                    setRegulatedAreas(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching regulated areas:", error);
                });
        }
    }, [userId]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        
        if (file && file.name.endsWith('.geojson')) {

            if (file.size > maxSize) {
                toast.warn("파일 크기는 5MB를 초과할 수 없습니다.");
                setFileName(''); // 파일 초기화
                return;
            }

            setFileName(file.name);
            
            // 기본 규제지역 이름 생성 ("규제지역" + (목록 개수 + 1))
            const defaultAreaName = `규제지역${regulatedAreas.length + 1}`;
    
            const formData = new FormData();
            formData.append("file", file);
            formData.append("areaName", defaultAreaName); // 기본 규제지역 이름
            formData.append("userId", userId); // userId가 화면에 전달된다고 가정
    
            // 규제지역 추가 API 호출
            api.post("/api/businesses/regulatedArea/add", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                toast.success("성공적으로 추가되었습니다.");
                // 규제지역 목록 업데이트
                setRegulatedAreas(prev => [...prev, response.data]);
                setFileName(''); // 파일명 초기화
            })
            .catch((error) => {
                console.error("Error adding regulated area:", error);
                toast.error("추가에 실패했습니다.");
                setFileName(''); // 파일명 초기화
            });
        } else {
            toast.warn('.geojson 파일만 업로드 가능합니다.');
            setFileName('');
        }
    };

    const inputRef = useRef(null);
    // 규제지역 이름 업데이트
    const handleUpdateArea = (id) => {
        if (areaName.trim().length > 0) {
            api.put(`/api/businesses/regulatedArea/update/${id}`, null, {
                params: { areaName },
            })
            .then((response) => {
                // 성공적으로 업데이트된 경우, 목록의 해당 항목 이름을 업데이트
                setRegulatedAreas((prevAreas) =>
                    prevAreas.map((area) =>
                        area.areaId === id ? { ...area, areaName: response.data.areaName } : area
                    )
                );
                setEditMode((prev) => ({ ...prev, [id]: false }));
                setAreaName(''); // 이름 입력 초기화
                toast.success("성공적으로 수정되었습니다.")
            })
            .catch((error) => {
                console.error("Error updating area name:", error);
            });
        } else {
            toast.warn("이름은 최소 1자 이상 입력해야 합니다.");
            inputRef.current.focus();
        }
    };

    // 규제지역 삭제 - 로직은 추후 구현
    const handleDeleteArea = (id) => {
        api.delete(`/api/businesses/regulatedArea/delete/${id}`)
            .then(() => {
                // 성공적으로 삭제된 경우, 규제지역 목록에서 해당 항목 제거
                setRegulatedAreas((prevAreas) => prevAreas.filter((area) => area.areaId !== id));
                toast.success("성공적으로 삭제되었습니다.");
            })
            .catch((error) => {
                console.error("Error deleting regulated area:", error);
                toast.error("삭제에 실패했습니다.");
            });
    };

    return (
        <div className="business-list-container">
            <ToastContainer 
                position="bottom-center" 
                autoClose={2000}
            />
            {/* Header section */}
            <header className="header" onClick={() => window.location.reload()}>
                <img src={headerImage} alt="Header" />
            </header>

            <div className="business-list">
                
                {/* menu section */}
                <div className='menu'>
                    <button className="invisible-button" aria-hidden="true" disabled></button>
                    <div className="user-info">
                    {userInfo ? (
                        <div className='user-info-text'>
                            <span className="user-name">🏢 {userInfo.userName}</span>
                            <span className="welcome-message">({userInfo.userId})</span>
                        </div>
                    ) : (
                        <div>Loading user information...</div>
                    )}
                    </div>
                    <button className="menu-button" onClick={handleMenuToggle} ref={buttonRef}>
                        <FaBars size={20} />
                    </button>
                    {isMenuOpen && (
                        <div className="menu-options" ref={menuRef}>
                            <button className="regulated-area-upload-button" onClick={openAreaModal}>
                                규제지역 관리
                            </button>
                            <button className="logout-button" onClick={handleLogout}>
                                로그아웃
                            </button>
                        </div>
                    )}
                </div>

                {/* Slider banner section */}
                <div className="slider-banner">
                    <button className="prev-slide" onClick={handlePrevSlide}>
                        <AiOutlineLeft />
                    </button>
                    <div className="slider-banner-wrapper" style={{ transform: `translateX(-${sliderIndex * 100}%)` }}>
                        {sliderImages.map((image, index) => (
                        <img key={index} src={image} alt={`Slide ${index}`} className="slider-image" />
                        ))}
                    </div>
                    <button className="next-slide" onClick={handleNextSlide}>
                        <AiOutlineRight />
                    </button>
                    <div className="slider-indicator">
                        {`${sliderIndex + 1} / ${sliderImages.length}`}
                    </div>
                </div>

                {/* Content section */}
                <div className="content">
                    {/* Search bar section */}
                    <div className="search-bar">
                        <div className="search-input">
                            <MdSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="사업지 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="action-buttons">
                            <button className="add-button" onClick={handleAddButtonClick}>
                                <MdAdd />
                            </button>
                        </div>
                    </div>

                    {/* Business cards section */}
                    <div className="business-cards">
                        {filteredBusinesses.length === 0 ? (
                            <p className="no-businesses-message">추가된 사업지가 없습니다.</p>
                        ) : (
                            filteredBusinesses.map((business) => (
                                <div key={business.id} className="business-card">
                                    <div className="business-info">
                                        <span className="business-name" onClick={() => handleBusinessClick(business)}>{business.name}</span>
                                        <span className="business-date">최종 수정일 {business.lastModifiedDate.toLocaleDateString()}</span>
                                        <button className="expand-button" onClick={() => handleExpandClick(business.id)}>
                                            {expandedCards[business.id] ? <AiOutlineUp /> : <AiOutlineDown />}
                                        </button>
                                    </div>
                                    {expandedCards[business.id] && (
                                        <div className="business-details-expanded">
                                            <div className="expanded-text">• 메모</div>
                                            <textarea 
                                                className="memo-textarea"
                                                placeholder="여기에 메모를 입력하세요..." 
                                                value={business.memo}
                                                onChange={(e) => handleMemoChange(business.id, e)}
                                                rows="1"
                                                style={{ overflow: 'hidden' }}
                                            />
                                            <div className='save-memo-container'>
                                                <button 
                                                    className={`save-memo-button ${isMemoEdited[business.id] ? 'hoverable' : ''}`}
                                                    onClick={() => handleSaveMemo(business.id)}
                                                    disabled={!isMemoEdited[business.id]} // 수정된 경우만 활성화
                                                >
                                                    {isMemoEdited[business.id] ? '저장' : '✔'}
                                                </button>
                                            </div>
                                            <div className="expanded-text"><span>• 사진</span> <span className='image-limit-text'>(장당 5MB 제한)</span></div>
                                            <div className="thumbnail-carousel">
                                                {business.images.map((image, index) => (
                                                    <div key={index} className="thumbnail">
                                                        <img
                                                            src={image.filePath}
                                                            alt={`사업 이미지 ${index + 1}`}
                                                            onClick={() => handleImageClick(business.id, index)}
                                                        />
                                                        <button
                                                            className="delete-thumbnail"
                                                            onClick={() => handleDeleteImage(business.id, image.imageId)}
                                                        >
                                                            <IoCloseCircleOutline />
                                                        </button>
                                                    </div>
                                                ))}
                                                {business.images.length < 20 && (
                                                    <label htmlFor={`file-input-${business.id}`} className="add-thumbnail">
                                                        <MdAdd />
                                                        <input
                                                            id={`file-input-${business.id}`}
                                                            type="file"
                                                            accept=".jpg, .jpeg, .png"
                                                            onChange={(e) => handleAddImage(business.id, e)}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                            <div className='delete-button-container'>
                                                <button className="delete-button" onClick={() => handleDeleteButtonClick(business.id)}>
                                                    <MdDelete/>삭제
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                </div>
               
            </div>
            
            {/* Footer section */}
            <footer className="footer">
                <p>© 2024 Team Yi & Seo. All rights reserved.</p>
                <p>https://github.com/mg-seo/TurbineInsight_Web</p>
            </footer>

            {/* Image popup modal */}
            {popupBusinessId !== null && popupImageIndex !== null && (
                <div className="image-popup-overlay" onClick={handleClosePopup}>
                    <div className="image-popup-content" onClick={(e) => e.stopPropagation()}>
                        <div className="image-popup-navigation">
                            {businesses.find((b) => b.id === popupBusinessId).images.length > 1 && (
                                <>
                                    <button className="prev-image" onClick={handlePrevImage}><AiOutlineLeft /></button>
                                    <button className="next-image" onClick={handleNextImage}><AiOutlineRight /></button>
                                </>
                            )}
                            <span className="image-counter">
                                {popupImageIndex + 1} / {businesses.find((b) => b.id === popupBusinessId).images.length}
                            </span>
                        </div>
                        <img
                            src={businesses.find(b => b.id === popupBusinessId)?.images[popupImageIndex]?.filePath}
                            alt={`확대 이미지 ${popupImageIndex + 1}`}
                        />
                    </div>
                </div>
            )}

            {/* Delete modal */}
            {showDeleteModal && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal" ref={deleteModalRef} onKeyPress={handleKeyPressDelete} tabIndex="0">
                        <p>정말 삭제하시겠습니까?</p>
                        <div className="modal-buttons">
                            <button className="delete-button" onClick={handleConfirmDelete}>예</button>
                            <button className="cancel-button" onClick={handleCancelDelete}>아니오</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add business modal */}
            {showAddModal && (
                <div className="add-modal-overlay">
                    <div className="add-modal">
                        <p>추가할 사업지 이름을 입력하세요.</p>
                        <input
                            type="text"
                            value={newBusinessName}
                            onChange={(e) => setNewBusinessName(e.target.value)}
                            placeholder="최대 20자"
                            maxLength={20}
                            ref={addInputRef}
                            onKeyPress={handleKeyPressAdd}
                        />
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={handleAddBusiness}>추가하기</button>
                            <button className="cancel-button" onClick={handleCancelAdd}>취소</button>
                        </div>
                    </div>
                </div>
            )}

            {showAreaModal && (
                <div className="area-modal-overlay">
                    <div className="area-modal">
                        <div className="modal-header">
                            <h2>규제지역 관리</h2>
                            <button className="close-button" onClick={closeAreaModal}>X</button>
                        </div>

                        {/* 규제지역 추가 */}
                        <div className="file-input-group">
                            <input
                                type="text"
                                className="file-name-display"
                                value={fileName}
                                placeholder=".geojson 파일만 등록 가능합니다."
                                readOnly
                            />
                            <label className="file-upload-button">
                                추가
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    accept=".geojson"
                                />
                            </label>
                        </div>

                        {/* 규제지역 목록 */}
                        <div className="area-list">
                        {regulatedAreas.length > 0 ? (
                            regulatedAreas.map((area) => (
                                <div key={area.areaId} className="area-item">
                                    {editMode[area.areaId] ? (
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={areaName}
                                            onChange={(e) => setAreaName(e.target.value)}
                                            maxLength={20}
                                            className="edit-input"
                                            required
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleUpdateArea(area.areaId);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className="area-name">{area.areaName}</span>
                                    )}
                                    {editMode[area.areaId] ? (
                                        <MdCheck
                                            className="icon-button"
                                            onClick={() => handleUpdateArea(area.areaId)}
                                        />
                                    ) : (
                                        <MdEdit
                                            className="icon-button"
                                            onClick={() => {
                                                setAreaName(area.areaName);
                                                setEditMode((prev) => ({ ...prev, [area.areaId]: true }));
                                            }}
                                        />
                                    )}
                                    <MdClose
                                        className="icon-button"
                                        onClick={() => handleDeleteArea(area.areaId)}
                                    />
                                </div>
                            ))
                        ) : (
                            <p className="no-areas-message">추가된 규제지역이 없습니다.</p>
                        )}
                        </div>
                    </div>
                </div>
            )}

            

        </div>
    );
};

export default BusinessList;
