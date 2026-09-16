import { BACKEND_URL } from "@/config/api_config";
import { getJWT } from "@/store/jwt";
import type { ApiResponse } from "@/types/api-response";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type UploadFileResult = ApiResponse<{ url: string }>;

export async function uploadFile(file: File) {
    const token = getJWT();
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post<UploadFileResult>(
        BACKEND_URL + "/file/upload",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return res.data.data?.url;
}

export function useUploadFile() {
    return useMutation<string | undefined, AxiosError<UploadFileResult>, File>({
        mutationFn: uploadFile,
    });
}
