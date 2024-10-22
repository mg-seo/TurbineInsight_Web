import React from 'react';

const MapPage = ({ business }) => {
    return (
        <div>
            <h1>{business.id}의 위치</h1>
            <p>여기에서 지도와 관련된 정보를 표시할 수 있습니다.</p>
        </div>
    );
};

export default MapPage;
