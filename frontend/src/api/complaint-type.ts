import { BACKEND_URL } from "@/config/api_config";
import { getJWT } from "@/store/jwt";
import type { ApiResponse } from "@/types/api-response";
import type { ComplaintType } from "@/types/complaint-type";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type GetComplaintTypesResult = ComplaintType[];

async function getComplaintTypes() {
    const token = getJWT();
    const res = await axios.get<ApiResponse<GetComplaintTypesResult>>(
        `${BACKEND_URL}/complaint-types`,
        {
            headers: { Authorization: `Bearer ${token}` },
        },
    );
    let types = res.data.data ?? [];
    types = types.map((t) => {
        t.fields = JSON.parse(t.fields as unknown as string);
        return t;
    });
    return types;
}

export function useGetComplaintTypes() {
    return useQuery<
        GetComplaintTypesResult,
        AxiosError<ApiResponse<GetComplaintTypesResult>>
    >({
        queryKey: ["complaint-types"],
        queryFn: getComplaintTypes,
        retry: false,
    });
}

async function addComplaintType(complaintType: Omit<ComplaintType, "id">) {
    const token = getJWT();
    const res = await axios.post<ApiResponse<Omit<ComplaintType, "id">>>(
        `${BACKEND_URL}/complaint-types`,
        complaintType,
        {
            headers: { Authorization: `Bearer ${token}` },
        },
    );
    return res.data;
}

export function useAddComplaintType() {
    return useMutation<
        ApiResponse<Omit<ComplaintType, "id">>,
        AxiosError<ApiResponse<Omit<ComplaintType, "id">>>,
        Omit<ComplaintType, "id">
    >({
        mutationFn: addComplaintType,
    });
}

async function deleteComplaintType(id: number) {
    const token = getJWT();
    const res = await axios.delete<ApiResponse>(
        `${BACKEND_URL}/complaint-types`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                id: id,
            },
        },
    );
    return res.data;
}

export function useDeleteComplaintType() {
    return useMutation<ApiResponse, AxiosError<ApiResponse>, number>({
        mutationFn: deleteComplaintType,
    });
}

export async function updateComplaintType(complaintType: ComplaintType) {
    const token = getJWT();
    const res = await axios.put<ApiResponse<ComplaintType>>(
        `${BACKEND_URL}/complaint-types`,
        complaintType,
        {
            headers: { Authorization: `Bearer ${token}` },
        },
    );
    return res.data;
}

export function useUpdateComplaintType() {
    return useMutation<
        ApiResponse<ComplaintType>,
        AxiosError<ApiResponse<ComplaintType>>,
        ComplaintType
    >({
        mutationFn: updateComplaintType,
    });
}
