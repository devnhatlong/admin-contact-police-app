import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
    const user = useSelector((state) => state.user);
    const location = useLocation();

    return user && user._id ? (
        <Outlet />
    ) : (
        <Navigate to="/login" state={{ from: location }} />
    );
};

export default PrivateRoute;