export type ComplaintStatus =
    | "PENDING"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "REJECTED"
    | "ESCALATED";

export interface ComplaintAction {
    complaintID: number;
    actionType: string;
    performedBy: string;
    performedAt: Date;
    remarks: string;
}

export interface Complaint {
    id: number;
    raisedBy: string;
    raisedFromDepartment: string;
    raisedFromSection: string;
    complaintTypeId: number;

    title: string;
    description: string;

    status: ComplaintStatus;

    actions: ComplaintAction[];

    meta: Record<string, unknown>;

    createdAt: Date;
    updatedAt: Date;
}
