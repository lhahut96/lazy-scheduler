import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://192.168.137.1:5000', // Replace with your API base URL
    timeout: 60000, // Request timeout in milliseconds
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;