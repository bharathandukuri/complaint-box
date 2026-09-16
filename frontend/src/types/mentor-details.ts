import type { AssignedDepartments } from "./department";

export interface MentorDetails {
    employeeID?: string;
    designation?: string;
    department?: string;
    section?: string;
    assignedDepartments: AssignedDepartments[];
}
