import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
axios.interceptors.request.use((configInfo) => {
  const config = configInfo;
  return config;
});

export default axios;
