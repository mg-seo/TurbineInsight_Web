import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BusinessList.css'; // Assuming you have some CSS for styling
import { MdAdd, MdDelete } from 'react-icons/md';
import { AiOutlineDown, AiOutlineUp } from 'react-icons/ai';

const BusinessList = ({ setSelectedBusiness }) => {
    const [businesses] = useState([
        { id: 1, name: '가산 풍력단지', date: '2024.10.06' },
        { id: 2, name: '나산 풍력단지', date: '2024.10.06' },
        { id: 3, name: '다산 풍력단지', date: '2024.10.06' },
        { id: 4, name: '라산 풍력단지', date: '2024.10.06' },
        { id: 5, name: '마산 풍력단지', date: '2024.10.06' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCards, setExpandedCards] = useState({});

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

    const filteredBusinesses = businesses.filter((business) =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="business-list">
            <header className="header">
                <div className="logo">DOOSAN</div>
            </header>
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
                                <div className="business-details-expanded" style={{ margin: '10px 0' }}>
                                    <div className="thumbnail-carousel">
                                        <div className="thumbnail"></div>
                                        <div className="thumbnail"></div>
                                        <div className="thumbnail"></div>
                                        <button className="add-thumbnail">
                                            <MdAdd />
                                        </button>
                                    </div>
                                    <p>추가적인 사업 정보가 여기 표시됩니다.</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BusinessList;

/* BusinessList.css example */
/* You would create BusinessList.css to style the components accordingly */
