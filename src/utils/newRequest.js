import axios from "axios";

const API = import.meta.env.VITE_API_URL;  // From Vite env

const newRequest = axios.create({
  baseURL: API,   // No need to add /api unless your backend is prefixed
  withCredentials: true,
});

export default newRequest;
