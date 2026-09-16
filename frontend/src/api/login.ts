import { BACKEND_URL } from "@/config/api_config";
import type { ApiResponse } from "@/types/api-response";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export interface LoginPayload {
    username: string;
    password: string;
}

export type LoginResult = ApiResponse<{ token: string }>;

export async function login(payload: LoginPayload) {
    const res = await axios.post<LoginResult>(
        BACKEND_URL + "/users/login",
        payload
    );
    return res.data;
}

export function useLogin() {
    return useMutation<LoginResult, AxiosError<LoginResult>, LoginPayload>({
        mutationFn: login,
    });
}
