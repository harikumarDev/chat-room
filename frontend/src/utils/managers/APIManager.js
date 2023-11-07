import axios from "./AxiosManager";

class APIManager {
  getProvider() {
    return axios;
  }

  sendPost(url, data, config = {}) {
    return this.getProvider().post(url, data, config);
  }

  sendGet(url) {
    return this.getProvider().get(url);
  }
}

const instance = new APIManager();

export default instance;
