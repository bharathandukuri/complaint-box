import type { Complaint } from "./complaint";
import type { MentorDetails } from "./mentor-details";
import type { StudentDetails } from "./student-details";

export const Roles = ["ADMIN", "MENTOR", "STUDENT"] as const;
export type Role = (typeof Roles)[number];

export const Genders = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof Genders)[number];

export interface ComplaintDetails {
    totalComplaints: number;
    totalPending: number;
    totalInProgress: number;
    totalResolved: number;
    totalRejected: number;
    totalEscalated: number;

    recentComplaints: Complaint[];
}

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: Role;
    gender?: Gender;
    mobile?: string;
    dob?: Date | string;
    profilePic?: string;
    banned: boolean;
    studentDetails?: StudentDetails;
    mentorDetails?: MentorDetails;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    complaintDetails?: ComplaintDetails;
}
