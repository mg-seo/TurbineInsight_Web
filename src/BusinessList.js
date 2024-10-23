import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BusinessList.css'; // Assuming you have some CSS for styling
import { MdAdd, MdDelete } from 'react-icons/md';
import { AiOutlineDown, AiOutlineUp, AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { IoCloseCircleOutline } from 'react-icons/io5';

const BusinessList = ({ setSelectedBusiness }) => {

    const [sliderIndex, setSliderIndex] = useState(0);

    const sliderImages = [
        '/images/banner1.jpg',
        '/images/banner2.jpg',
        '/images/banner3.jpg',
    ];

    const [businesses, setBusinesses] = useState([
        { id: 1, name: '가산 풍력단지', date: '2024.10.06', images: [] },
        { id: 2, name: '나산 풍력단지', date: '2024.10.06', images: [] },
        { id: 3, name: '다산 풍력단지', date: '2024.10.06', images: [] },
        { id: 4, name: '라산 풍력단지', date: '2024.10.06', images: [] },
        { id: 5, name: '마산 풍력단지', date: '2024.10.06', images: [] },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCards, setExpandedCards] = useState({});
    const [popupImageIndex, setPopupImageIndex] = useState(null);
    const [popupBusinessId, setPopupBusinessId] = useState(null);

    const navigate = useNavigate();

    const handleBusinessClick = (business) => {
        setSelectedBusiness(business);
        navigate('/map', { state: { business } });
    };

    const handleExpandClick = (id) => {
        setExpandedCards((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleAddImage = (businessId, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                setBusinesses((prev) =>
                    prev.map((business) =>
                        business.id === businessId
                            ? { ...business, images: [...business.images, imageUrl] }
                            : business
                    )
                );
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = (businessId, imageIndex) => {
        setBusinesses((prev) =>
            prev.map((business) =>
                business.id === businessId
                    ? {
                          ...business,
                          images: business.images.filter((_, index) => index !== imageIndex),
                      }
                    : business
            )
        );
    };

    const filteredBusinesses = businesses.filter((business) =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
        <div className="business-list-container">
            <div className="business-list">
                <header className="header">
                    <div className="logo">DOOSAN</div>
                </header>

                <div className="slider-banner">
                    <button className="prev-slide" onClick={() => setSliderIndex((prevIndex) => (prevIndex - 1 + sliderImages.length) % sliderImages.length)}>
                        <AiOutlineLeft />
                    </button>
                    <img src={sliderImages[sliderIndex]} alt="Slider Banner" className="slider-image" />
                    <button className="next-slide" onClick={() => setSliderIndex((prevIndex) => (prevIndex + 1) % sliderImages.length)}>
                        <AiOutlineRight />
                    </button>
                    <div className="slider-indicator">
                        {`${sliderIndex + 1} / ${sliderImages.length}`}
                    </div>
                </div>

                <div className="content">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="사업지 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="action-buttons">
                            <button className="add-button">
                                <MdAdd /> 추가
                            </button>
                            <button className="delete-button">
                                <MdDelete /> 삭제
                            </button>
                        </div>
                    </div>
                    <div className="business-cards">
                        {filteredBusinesses.map((business) => (
                            <div key={business.id} className="business-card">
                                <div className="business-info">
                                    <span className="business-name" onClick={() => handleBusinessClick(business)}>{business.name}</span>
                                    <span className="business-date">{business.date}</span>
                                    <button className="expand-button" onClick={() => handleExpandClick(business.id)}>
                                        {expandedCards[business.id] ? <AiOutlineUp /> : <AiOutlineDown />}
                                    </button>
                                </div>
                                {expandedCards[business.id] && (
                                    <div className="business-details-expanded">
                                        <div className="thumbnail-carousel">
                                            {business.images.map((image, index) => (
                                                <div key={index} className="thumbnail">
                                                    <img src={image} alt={`사업 이미지 ${index + 1}`} onClick={() => handleImageClick(business.id, index)} />
                                                    <button
                                                        className="delete-thumbnail"
                                                        onClick={() => handleDeleteImage(business.id, index)}
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
                                                        accept="image/*"
                                                        onChange={(e) => handleAddImage(business.id, e)}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <p>추가적인 사업 정보가 여기 표시됩니다.</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
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
                        <img src={businesses.find((b) => b.id === popupBusinessId).images[popupImageIndex]} alt="확대 이미지" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessList;
