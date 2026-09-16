import { BACKEND_URL } from "@/config/api_config";
import { getJWT } from "@/store/jwt";
import type { ApiResponse } from "@/types/api-response";
import type { Complaint, ComplaintAction } from "@/types/complaint";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { uploadFile } from "./file";

type GetStudentComplaints = Complaint[];

export async function getStudentComplaints() {
    const jwt = getJWT();
    const res = await axios.get<ApiResponse<GetStudentComplaints>>(
        BACKEND_URL + "/complaints/me",
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        },
    );

    return res.data.data ?? [];
}

export function useGetStudentComplaints() {
    return useQuery<
        GetStudentComplaints,
        AxiosError<ApiResponse<GetStudentComplaints>>
    >({
        queryKey: ["complaints", "student"],
        queryFn: getStudentComplaints,
        retry: false,
    });
}

export type SubmitComplaintPayload = Pick<
    Complaint,
    "complaintTypeId" | "title" | "description" | "meta"
>;

export async function submitComplaint(complaint: SubmitComplaintPayload) {
    const jwt = getJWT();
    const res = await axios.post<ApiResponse<Complaint>>(
        BACKEND_URL + "/complaints",
        complaint,
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        },
    );

    return res.data;
}

export function useSubmitComplaint() {
    return useMutation<
        ApiResponse<Complaint>,
        AxiosError<ApiResponse<SubmitComplaintPayload>>,
        SubmitComplaintPayload
    >({
        mutationFn: submitComplaint,
    });
}

export async function submitComplaintWithFileUpload(
    complaint: SubmitComplaintPayload,
) {
    const meta: Record<string, unknown> = { ...complaint.meta };

    await Promise.all(
        Object.keys(meta).map(async (key) => {
            const value = meta[key];

            if (value instanceof File) {
                meta[key] = await uploadFile(value);
            } else if (Array.isArray(value)) {
                const uploaded = await Promise.all(
                    value.map(async (item) => {
                        if (item instanceof File) {
                            return await uploadFile(item);
                        }
                        return item;
                    }),
                );

                meta[key] = uploaded;
            }
        }),
    );

    return submitComplaint({
        ...complaint,
        meta,
    });
}

export function useSubmitComplaintWithFileUpload() {
    return useMutation<
        ApiResponse<Complaint>,
        AxiosError<ApiResponse>,
        SubmitComplaintPayload
    >({
        mutationFn: submitComplaintWithFileUpload,
    });
}

export async function deleteComplaint(id: number) {
    const jwt = getJWT();
    const res = await axios.delete<ApiResponse<null>>(
        BACKEND_URL + `/complaints/${id}`,
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        },
    );

    return res.data;
}

export function useDeleteComplaint() {
    return useMutation<
        ApiResponse<null>,
        AxiosError<ApiResponse<null>>,
        number
    >({
        mutationFn: deleteComplaint,
    });
}

export async function takeComplaintAction({
    complaintId,
    action,
}: TakeActionPayload) {
    const jwt = getJWT();
    const res = await axios.post<ApiResponse<ComplaintAction>>(
        BACKEND_URL + `/complaints/${complaintId}/actions`,
        action,
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        },
    );

    return res.data;
}

type TakeActionPayload = {
    complaintId: number;
    action: Pick<ComplaintAction, "actionType" | "remarks">;
};

export function useTakeComplaintAction() {
    return useMutation<
        ApiResponse<ComplaintAction>,
        AxiosError<ApiResponse<ComplaintAction>>,
        TakeActionPayload
    >({
        mutationFn: ({ complaintId, action }) =>
            takeComplaintAction({ complaintId, action }),
    });
}

export async function getComplaintActions(complaintId: number) {
    const jwt = getJWT();
    const res = await axios.get<ComplaintAction[]>(
        BACKEND_URL + `/complaints/${complaintId}/actions`,
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        },
    );

    return res.data ?? [];
}

export function useGetComplaintActions(complaintId: number) {
    return useQuery<ComplaintAction[], AxiosError>({
        queryKey: ["complaints", complaintId, "actions"],
        queryFn: () => getComplaintActions(complaintId),
        enabled: !!complaintId,
        retry: false,
    });
}

export type GetComplaintsPayload = {
    lastID?: number;
    size?: string;

    studentRollNumber?: string;
    studentDepartment?: "ALL" | string;
    studentSection?: "ALL" | string;

    employeeID?: string;
    status?: "ALL" | string;
    type?: number | "ALL";
};

export type GetComplaintsResult = Complaint[];

async function getComplaints(payload: GetComplaintsPayload) {
    const token = getJWT();

    const res = await axios.get<GetComplaintsResult>(
        BACKEND_URL + "/complaints",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                studentRollNumber: payload.studentRollNumber || undefined,
                studentDepartment:
                    payload.studentDepartment !== "ALL"
                        ? payload.studentDepartment
                        : undefined,
                studentSection:
                    payload.studentSection !== "ALL"
                        ? payload.studentSection
                        : undefined,
                employeeID: payload.employeeID || undefined,
                status: payload.status !== "ALL" ? payload.status : undefined,
                type: payload.type !== "ALL" ? payload.type : undefined,
                lastID: payload.lastID || undefined,
                size: payload.size || undefined,
            },
        },
    );

    return res.data ?? [];
}

export function useGetComplaints(
    filters: Omit<GetComplaintsPayload, "lastID">,
) {
    return useInfiniteQuery<
        GetComplaintsResult,
        AxiosError<GetComplaintsResult>
    >({
        queryKey: ["complaints", filters],
        initialPageParam: null,

        queryFn: ({ pageParam }) =>
            getComplaints({
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
