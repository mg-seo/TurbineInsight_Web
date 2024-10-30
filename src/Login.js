import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import api from './api';

const Login = ({ setUserId }) => {
    const [inputUserId, setInputUserId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await api.post('/api/businesses/checkUserId', inputUserId);
            if (response.status === 200) {
                setUserId(inputUserId);
                navigate('/business-list');
            }
        } catch (error) {
            setErrorMessage('유효하지 않은 사용자 ID입니다.');
        }
    };

    return (
        <div className="login-container">
            <h2>로그인</h2>
            <input
                type="text"
                value={inputUserId}
                onChange={(e) => setInputUserId(e.target.value)}
                placeholder="10자리 사용자 ID를 입력하세요"
            />
            <button onClick={handleLogin}>로그인</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default Login;
