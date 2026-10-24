import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:7000",
  withCredentials: true,
  timeout: 10000,
});
