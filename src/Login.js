import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import api from './api';

const Login = ({ setUserId }) => {
    const [inputUserId, setInputUserId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // 이미 로그인된 상태이면 business-list로 리디렉션
        if (sessionStorage.getItem('userId')) {
            navigate('/business-list');
        }
    }, [navigate]);

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
        <div className="login-container-wrapper">
            <div className="login-container">
                <h2 className="login-title">Turbine Insight</h2>
                <input
                    className="login-input"
                    type="text"
                    value={inputUserId}
                    onChange={(e) => setInputUserId(e.target.value)}
                    placeholder="10자리 사용자 ID를 입력하세요"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleLogin();
                        }
                    }}
                />
                <button className="login-button" onClick={handleLogin}>로그인</button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default Login;
