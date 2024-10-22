import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BusinessList = ({ setSelectedBusiness }) => {
    const [businesses] = useState([
        { id: 1, name: '사업 A' },
        { id: 2, name: '사업 B' },
        { id: 3, name: '사업 C' },
    ]);
    const navigate = useNavigate();

    const handleBusinessClick = (business) => {
        setSelectedBusiness(business);
        navigate('/map');
    };

    return (
        <div>
            <h1>사업 목록</h1>
            <ul>
                {businesses.map((business) => (
                    <li key={business.id}>
                        <button onClick={() => handleBusinessClick(business)}>
                            {business.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BusinessList;
