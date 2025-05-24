let API_BASE_URL
switch (window.location.hostname) {
    case 'localhost':
        API_BASE_URL = 'http://localhost:8080';
        break
    case '192.168.0.15':
        API_BASE_URL = 'http://192.168.0.15:8080';
        break
    default:
        API_BASE_URL = 'https://ar-united.onrender.com';
}

export { API_BASE_URL };