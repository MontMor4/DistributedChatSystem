import axios from "axios";

const AUTH_BASE = import.meta.env.VITE_API_AUTH;

export const authClient = axios.create({
	baseURL: AUTH_BASE,
});
