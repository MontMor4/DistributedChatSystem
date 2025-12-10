import { authClient } from "@/lib/api.ts";

type RegisterRequest = {
	username: string;
	password: string;
	fullName: string;
};

type LoginRequest = {
	username: string;
	password: string;
};

type RegisterResponse = {
	token: string;
	userId: string;
	username: string;
};

export async function registerUser(data: RegisterRequest) {
	const response = await authClient.post("/auth/register", data);
	return response.data as RegisterResponse;
}

export async function login(data: LoginRequest) {
	const response = await authClient.post("/auth/login", data);
	return response.data as RegisterResponse;
}
