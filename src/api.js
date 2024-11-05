import axios from 'axios';

// Spring Boot API의 기본 URL을 설정합니다.
const api = axios.create({
    baseURL: 'http://54.180.136.198:8282', // 여기에 Spring Boot API URL을 넣습니다.
    timeout: 10000, // 필요에 따라 요청 타임아웃을 설정할 수 있습니다.
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
