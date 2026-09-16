import { BACKEND_URL } from "@/config/api_config";
import { getJWT } from "@/store/jwt";
import { type ApiResponse } from "@/types/api-response";
import type { Department } from "@/types/department";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type GetAllDepartmentsResult = Department[];
export async function getAllDeparments() {
    const jwt = getJWT();
    const res = await axios.get<ApiResponse<GetAllDepartmentsResult>>(
        BACKEND_URL + "/departments",
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        }
    );
    return res.data.data ?? [];
}

export function useGetAllDepartments() {
    return useQuery<
        GetAllDepartmentsResult,
        AxiosError<ApiResponse<GetAllDepartmentsResult>>
    >({
        queryKey: ["departments"],
        queryFn: getAllDeparments,
        retry: false,
    });
}

type AddDepartmentResult = ApiResponse<Department>;

export async function addDepartment(department: Department) {
    const jwt = getJWT();
    const res = await axios.post<AddDepartmentResult>(
        BACKEND_URL + "/departments",
        department,
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        }
    );
    return res.data;
}

export function useAddDepartment() {
    return useMutation<
        AddDepartmentResult,
        AxiosError<AddDepartmentResult>,
        Department
    >({ mutationFn: addDepartment });
}

interface UpdateDepartmentPayload {
    oldDepartment: Department;
    newDepartment: Department;
}
type UpdateDepartmentResult = ApiResponse<Department>;

export async function updateDepartment({
    oldDepartment,
    newDepartment,
}: UpdateDepartmentPayload) {
    const jwt = getJWT();
    const res = await axios.put<UpdateDepartmentResult>(
        BACKEND_URL + "/departments/" + oldDepartment.code,
        newDepartment,
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        }
    );
    return res.data;
}

export function useUpdateDepartment() {
    return useMutation<
        UpdateDepartmentResult,
        AxiosError<UpdateDepartmentResult>,
        UpdateDepartmentPayload
    >({ mutationFn: updateDepartment });
}

export async function deleteDepartment(code: string) {
    const jwt = getJWT();
    const res = await axios.delete<ApiResponse>(
        BACKEND_URL + "/departments/" + code,
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        }
    );
    return res.data;
}

export function useDeleteDepartment() {
    return useMutation<ApiResponse, AxiosError<ApiResponse>, string>({
        mutationFn: deleteDepartment,
    });
}
