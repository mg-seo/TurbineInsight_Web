import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BusinessList from './BusinessList';
import MapPage from './MapPage';

const App = () => {
    const [selectedBusiness, setSelectedBusiness] = useState(null);

    return (
        <Router>
            <Routes>
                {/* 사업 목록 페이지 */}
                <Route
                    path="/"
                    element={<BusinessList setSelectedBusiness={setSelectedBusiness} />}
                />
                {/* 지도 페이지 */}
                <Route
                    path="/map"
                    element={
                        selectedBusiness ? (
                            <MapPage business={selectedBusiness} />
                        ) : (
                            <div>사업을 선택해주세요</div>
                        )
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
