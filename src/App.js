import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BusinessList from './BusinessList';
import MapPage from './MapPage';
import Login from './Login';

const App = () => {
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [userId, setUserId] = useState(() => sessionStorage.getItem('userId') || null);

    useEffect(() => {
        // userId가 변경될 때마다 sessionStorage에 저장
        if (userId) {
            sessionStorage.setItem('userId', userId);
        } else {
            sessionStorage.removeItem('userId'); // 로그아웃 시 제거
        }
    }, [userId]);

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
                    element={<BusinessList setSelectedBusiness={setSelectedBusiness} userId={userId} />}
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
