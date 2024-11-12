import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BusinessList from './BusinessList';
import MapPage from './MapPage';
import Login from './Login';
import PrivateRoute from './PrivateRoute';


const App = () => {
    const [selectedBusiness, setSelectedBusiness] = useState(() => {
        const savedBusiness = sessionStorage.getItem('selectedBusiness');
        return savedBusiness ? JSON.parse(savedBusiness) : null;
    });
    
    const [userId, setUserId] = useState(() => sessionStorage.getItem('userId') || null);

    useEffect(() => {
        if (userId) {
            sessionStorage.setItem('userId', userId);
        } else {
            sessionStorage.removeItem('userId');
        }
    }, [userId]);

    useEffect(() => {
        if (selectedBusiness) {
            sessionStorage.setItem('selectedBusiness', JSON.stringify(selectedBusiness));
        } else {
            sessionStorage.removeItem('selectedBusiness');
        }
    }, [selectedBusiness]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login setUserId={setUserId} />} />
                <Route 
                    path="/business-list" 
                    element={
                        <PrivateRoute userId={userId}>
                            <BusinessList setSelectedBusiness={setSelectedBusiness} userId={userId} />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/map" 
                    element={
                        <PrivateRoute userId={userId}>
                            {selectedBusiness ? (
                                <MapPage business={selectedBusiness} userId={userId} />
                            ) : (
                                <div>사업을 선택해주세요</div>
                            )}
                        </PrivateRoute>
                    } 
                />
            </Routes>
        </Router>
    );
};

export default App;
