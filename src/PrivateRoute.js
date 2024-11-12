import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ userId, children }) => {
    if (!userId) {
        return <Navigate to="/" />;
    }
    return children;
};

export default PrivateRoute;
