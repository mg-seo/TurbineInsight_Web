import React, { useState, useEffect } from 'react'; // useEffect 추가
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BusinessList from './BusinessList';
import MapPage from './MapPage';
import Login from './Login';

const App = () => {
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [userId, setUserId] = useState(() => sessionStorage.getItem('userId') || null);

    useEffect(() => {
        if (userId) {
            sessionStorage.setItem('userId', userId);
        } else {
            sessionStorage.removeItem('userId');
        }
    }, [userId]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login setUserId={setUserId} />} />
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
