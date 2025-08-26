let API_BASE_URL;
switch (window.location.hostname) {
  case "localhost":
    API_BASE_URL = "http://localhost:8080";
    break;
  case /\d+\.\d+\.\d\.\d+/:
    API_BASE_URL = `http://${window.location.hostname}:8080`;
    break;
  default:
    API_BASE_URL = "https://ar-united.onrender.com";
}

export { API_BASE_URL };
