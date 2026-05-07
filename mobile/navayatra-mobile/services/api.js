import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.3:8000/api",
//   timeout: 5000,
});

export default API;