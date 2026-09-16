import { BACKEND_URL } from "@/config/api_config";
import { getJWT } from "@/store/jwt";
import type { ApiResponse } from "@/types/api-response";
import type { AssignedDepartments } from "@/types/department";
import type { User } from "@/types/user";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type GetUsersPayload = {
    lastID?: number;
    size?: string;
    searchKey?: string;
    searchProperty?: string;
    role?: "ALL" | string;
    department?: "ALL" | string;
    section?: "ALL" | string;
    academicYear?: string;
};

export type GetUsersResult = User[];

async function getUsers(payload: GetUsersPayload) {
    const token = getJWT();
    const res = await axios.get<GetUsersResult>(BACKEND_URL + "/users", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            ...payload,
        },
    });

    return res.data ?? [];
}

export function useGetUsers(filters: Omit<GetUsersPayload, "lastID">) {
    return useInfiniteQuery<GetUsersResult, AxiosError<GetUsersResult>>({
        queryKey: ["users", filters],
        initialPageParam: null,

        queryFn: ({ pageParam }) =>
            getUsers({
                ...filters,
                lastID: pageParam as number | undefined,
            }),

        getNextPageParam: (lastPage) => {
            if (!lastPage || lastPage.length < Number(filters.size || 20))
                return undefined;
            return lastPage[lastPage.length - 1].id;
        },

        staleTime: 30_000,
    });
}

type AddUserPayload = Omit<User, "id">;
type AddUserResult = ApiResponse<User>;

export async function addUser(user: AddUserPayload) {
    const token = getJWT();
    const res = await axios.post<AddUserResult>(BACKEND_URL + "/users", user, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
}

export function useAddUser() {
    return useMutation<
        AddUserResult,
        AxiosError<AddUserResult>,
        AddUserPayload
    >({
        mutationFn: addUser,
    });
}

type UpdateUserPayload = User;
type UpdateUserResult = ApiResponse<User>;

export async function updateUser(user: UpdateUserPayload) {
    const token = getJWT();
    const res = await axios.put<UpdateUserResult>(
        BACKEND_URL + "/users",
        user,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    return res.data;
}

export function useUpdateUser() {
    return useMutation<
        UpdateUserResult,
        AxiosError<UpdateUserResult>,
        UpdateUserPayload
    >({
        mutationFn: updateUser,
    });
}

export async function deleteUser(id: number) {
    const jwt = getJWT();
    const res = await axios.delete<ApiResponse>(BACKEND_URL + "/users", {
        headers: { Authorization: `Bearer ${jwt}` },
        params: {
            id,
        },
    });
    return res.data;
}

export function useDeleteUser() {
    return useMutation<ApiResponse, AxiosError<ApiResponse>, number>({
        mutationFn: deleteUser,
    });
}

type GetAssignedDepartmentsResult = ApiResponse<AssignedDepartments[]>;

export async function getMentorAssignedDepartments(user: User) {
    const jwt = getJWT();
    const res = await axios.get<GetAssignedDepartmentsResult>(
        BACKEND_URL + "/users/mentor/departments/" + user.username,
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        },
    );

    return res.data;
}

export function useGetMentorAssignedDepartments(user: User | null) {
    return useQuery<
        GetAssignedDepartmentsResult,
        AxiosError<GetAssignedDepartmentsResult>
    >({
        queryKey: ["assigned-departments", user?.username],
        queryFn: () => getMentorAssignedDepartments(user!),
        enabled: !!user,
    });
}

interface MentorAssignmentPayload {
    department: string;
    section: string;
    user: User;
}

type MentorAssignmentResult = ApiResponse<User>;

export async function addMentorAssignment(payload: MentorAssignmentPayload) {
    const jwt = getJWT();
    const res = await axios.post<MentorAssignmentResult>(
        BACKEND_URL + "/users/mentor/assign/" + payload.user.username,
        undefined,
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
            params: {
                department: payload.department,
                section: payload.section,
            },
        },
    );
    return res.data;
}

export function useAddMentorAssignment() {
    return useMutation<
        MentorAssignmentResult,
        AxiosError<MentorAssignmentResult>,
        MentorAssignmentPayload
    >({ mutationFn: addMentorAssignment });
}

export async function deleteMentorAssignment(payload: MentorAssignmentPayload) {
    const jwt = getJWT();
    const res = await axios.delete<MentorAssignmentResult>(
        BACKEND_URL + "/users/mentor/assign/" + payload.user.username,
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
            params: {
                department: payload.department,
                section: payload.section,
            },
        },
    );
    return res.data;
}

export function useDeleteMentorAssignment() {
    return useMutation<
        MentorAssignmentResult,
        AxiosError<MentorAssignmentResult>,
        MentorAssignmentPayload
    >({ mutationFn: deleteMentorAssignment });
}

async function getUserData() {
    const jwt = getJWT();
    const res = await axios.get<ApiResponse<User>>(BACKEND_URL + "/users/me", {
        headers: { Authorization: "Bearer " + jwt },
    });
    if (!res.data.data) {
        throw new Error("User data not found");
    }
    return res.data.data;
}

export function useGetUserData() {
    return useQuery<User, AxiosError<ApiResponse>>({
        queryKey: ["users", "me"],
        queryFn: getUserData,
        retry: false,
    });
}
