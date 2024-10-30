import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BusinessList from './BusinessList';
import MapPage from './MapPage';
import Login from './Login';
import api from './api';

const App = () => {
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [userId, setUserId] = useState(null);

    return (
        <Router>
            <Routes>
                {/* Login 컴포넌트에 setUserId 전달 */}
                <Route
                    path="/"
                    element={<Login setUserId={setUserId} />}
                />
                {/* BusinessList 컴포넌트에 setSelectedBusiness 전달 */}
                <Route
                    path="/business-list"
                    element={<BusinessList setSelectedBusiness={setSelectedBusiness} />}
                />
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
