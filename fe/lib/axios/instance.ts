import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/', // Replace with your API base URL
    timeout: 10000, // Request timeout in milliseconds
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;