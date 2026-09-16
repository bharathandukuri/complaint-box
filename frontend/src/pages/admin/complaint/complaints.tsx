import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { BACKEND_URL } from "@/config/api_config";
import { CookieTypes } from "@/config/cookie_config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import {
    Search,
    Loader2,
    Eye,
    ChevronDown,
    Trash2,
    Pencil,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { ComplaintType } from "@/types/complaint-type";
import ComplaintActionForm from "./complaint-action-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useDeleteComplaint, useGetComplaints } from "@/api/complaint";
import type { Complaint, ComplaintAction } from "@/types/complaint";
import type { Department } from "@/types/department";
import OptionsButton from "@/components/options-button";
import { toast } from "sonner";

const ComplaintStatus = [
    "PENDING",
    "IN_PROGRESS",
    "RESOLVED",
    "REJECTED",
    "ESCALATED",
];
function ComplaintsPage() {
    const [cookies] = useCookies(CookieTypes);
    const token = cookies.token;
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [size, setSize] = useState("20");

    const [department, setDepartment] = useState("ALL");
    const [section, setSection] = useState("ALL");
    const [complaintType, setComplaintType] = useState("ALL");
    const [showComplaintTypeModal, setShowComplaintTypeModal] = useState(false);
    const [selectedComplaintType, setSelectedComplaintType] =
        useState<ComplaintType | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] =
        useState<Complaint | null>(null);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
        return () => clearTimeout(id);
    }, [searchTerm]);

    const {
        data: departments,
        isLoading: isDepartmentsLoading,
        isError: isDepartmentsError,
        refetch: refetchDepartments,
    } = useQuery<Department[]>({
        queryKey: ["departments"],
        queryFn: async () => {
            const res = await axios.get(`${BACKEND_URL}/departments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.data;
        },
        enabled: !!token,
        staleTime: 5 * 60_000,
    });

    const { data: complaintTypes } = useQuery<ComplaintType[]>({
        queryKey: ["complaint-types"],
        queryFn: async () => {
            const res = await axios.get(`${BACKEND_URL}/complaint-types`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.data;
        },
        enabled: !!token,
        staleTime: 5 * 60_000,
    });

    const {
        data,
        status,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useGetComplaints({
        studentRollNumber: debouncedSearchTerm,
        studentDepartment: department,
        studentSection: department ? section : undefined,
        size: size,
        type: Number.parseInt(complaintType) || undefined,
        status: statusFilter,
    });

    const complaints: Complaint[] = useMemo(
        () => data?.pages.flat() || [],
        [data],
    );

    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                )
                    fetchNextPage();
            },
            { root: null, rootMargin: "400px", threshold: 0.01 },
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingComplaint, setDeletingComplaint] =
        useState<Complaint | null>(null);

    const { mutate: deleteComplaintMutate, isPending: isDeleting } =
        useDeleteComplaint();

    const [showViewDialog, setShowViewDialog] = useState(false);

    if (isDepartmentsLoading)
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading
                departments...
            </div>
        );

    if (isDepartmentsError)
        return (
            <div className="flex flex-col items-center justify-center h-full gap-2">
                <span className="text-red-500">
                    Failed to load departments. Please try again.
                </span>
                <Button onClick={() => refetchDepartments()}>Retry</Button>
            </div>
        );

    if (!departments || departments.length === 0)
        return (
            <div className="flex flex-col items-center justify-center h-full gap-2">
                <span className="text-red-500">
                    No departments found. Please add a department first.
                </span>
                <Button onClick={() => navigate("/admin/departments")}>
                    Add Department
                </Button>
            </div>
        );

    return (
        <div className="flex flex-col p-5 space-y-5 py-8">
            <div className="text-3xl font-bold font-poppins px-5">
                Complaint Management
            </div>

            <Card className="p-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by student roll number..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                        Department:
                    </span>
                    <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All departments</SelectItem>
                            {departments?.map((dept) => (
                                <SelectItem key={dept.name} value={dept.code}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {department !== "ALL" && (
                        <>
                            <span className="text-sm font-medium text-muted-foreground">
                                Section:
                            </span>
                            <Select value={section} onValueChange={setSection}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">
                                        All sections
                                    </SelectItem>
                                    {departments
                                        ?.find((d) => d.name === department)
                                        ?.sections.map((sec) => (
                                            <SelectItem
                                                key={sec.name}
                                                value={sec.name}
                                            >
                                                {sec.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </>
                    )}

                    <div className="flex gap-2 items-center">
                        <span className="text-sm font-medium text-muted-foreground">
                            Complaint Type:
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setShowComplaintTypeModal(true)}
                            className="px-3 py-1 text-sm"
                        >
                            {selectedComplaintType ? (
                                selectedComplaintType.title
                            ) : (
                                <span className="flex items-center gap-1">
                                    All types <ChevronDown />
                                </span>
                            )}
                        </Button>
                    </div>

                    <Dialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                    >
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Delete Complaint</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete this
                                    complaint? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="text-sm space-y-2">
                                <p>
                                    <span className="font-semibold">
                                        Title:
                                    </span>{" "}
                                    {deletingComplaint?.title}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Raised By:
                                    </span>{" "}
                                    {deletingComplaint?.raisedBy}
                                </p>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteDialog(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="destructive"
                                    disabled={isDeleting}
                                    onClick={() => {
                                        if (!deletingComplaint) return;

                                        deleteComplaintMutate(
                                            deletingComplaint.id,
                                            {
                                                onSuccess: () => {
                                                    toast.success(
                                                        "Complaint deleted successfully",
                                                    );
                                                    setShowDeleteDialog(false);
                                                    setDeletingComplaint(null);
                                                    refetch();
                                                },
                                                onError: () => {
                                                    toast.error(
                                                        "Failed to delete complaint",
                                                    );
                                                },
                                            },
                                        );
                                    }}
                                >
                                    {isDeleting && (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    )}
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {showComplaintTypeModal && (
                        <Dialog open onOpenChange={setShowComplaintTypeModal}>
                            <DialogContent className="max-w-lg w-full p-5">
                                <DialogHeader>
                                    <DialogTitle>
                                        Select Complaint Type
                                    </DialogTitle>
                                    <DialogDescription>
                                        Select a complaint type to filter
                                        complaints.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-3 max-h-96 overflow-y-auto mt-4">
                                    {complaintTypes?.map((type) => (
                                        <div
                                            key={type.id}
                                            className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                                            onClick={() => {
                                                setSelectedComplaintType(type);
                                                setComplaintType(
                                                    type.id.toString(),
                                                );
                                                setShowComplaintTypeModal(
                                                    false,
                                                );
                                            }}
                                        >
                                            <h3 className="font-semibold">
                                                {type.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {type.description}
                                            </p>
                                        </div>
                                    ))}
                                    <div
                                        className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer text-center font-medium"
                                        onClick={() => {
                                            setSelectedComplaintType(null);
                                            setComplaintType("ALL");
                                            setShowComplaintTypeModal(false);
                                        }}
                                    >
                                        All Types
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        onClick={() =>
                                            setShowComplaintTypeModal(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    <div className="flex gap-2 items-center">
                        <span className="text-sm font-medium text-muted-foreground">
                            Status:
                        </span>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">
                                    All statuses
                                </SelectItem>
                                {ComplaintStatus.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status.replace("_", " ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <span className="text-sm font-medium text-muted-foreground">
                        Size:
                    </span>
                    <Select value={size} onValueChange={setSize}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>
            {showActionModal && selectedComplaint && (
                <Dialog open onOpenChange={setShowActionModal}>
                    <DialogContent className="max-w-lg w-full p-0">
                        <ComplaintActionForm
                            complaint={selectedComplaint}
                            onClose={() => setShowActionModal(false)}
                            onActionTaken={() => refetch()}
                        />
                    </DialogContent>
                </Dialog>
            )}
            <Dialog
                open={showViewDialog}
                onOpenChange={(open) => !open && setShowViewDialog(false)}
            >
                <DialogContent className="w-full max-w-none sm:max-w-5xl h-full max-h-[90vh] overflow-auto scrollbar">
                    <DialogHeader>
                        <DialogTitle>Complaint Details</DialogTitle>
                    </DialogHeader>

                    {selectedComplaint && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>
                                        <span className="font-semibold">
                                            Title:{" "}
                                        </span>
                                        {selectedComplaint.title}
                                    </p>
                                    <p>
                                        <span className="font-semibold">
                                            Description:{" "}
                                        </span>
                                        {selectedComplaint.description}
                                    </p>
                                    <p>
                                        <span className="font-semibold">
                                            Status:{" "}
                                        </span>
                                        <Badge
                                            variant={
                                                selectedComplaint.status ===
                                                "RESOLVED"
                                                    ? "default"
                                                    : selectedComplaint.status ===
                                                        "REJECTED"
                                                      ? "destructive"
                                                      : "outline"
                                            }
                                        >
                                            {selectedComplaint.status}
                                        </Badge>
                                    </p>
                                    <p>
                                        <span className="font-semibold">
                                            Created At:{" "}
                                        </span>
                                        {selectedComplaint.createdAt
                                            ? new Date(
                                                  selectedComplaint.createdAt,
                                              ).toLocaleString()
                                            : "-"}
                                    </p>
                                    <p>
                                        <span className="font-semibold">
                                            Last Updated:{" "}
                                        </span>
                                        {selectedComplaint.updatedAt
                                            ? new Date(
                                                  selectedComplaint.updatedAt,
                                              ).toLocaleString()
                                            : "-"}
                                    </p>
                                </CardContent>
                            </Card>

                            {selectedComplaint.actions?.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Actions Taken</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="max-h-60">
                                            <div className="space-y-3">
                                                {selectedComplaint.actions.map(
                                                    (
                                                        action: ComplaintAction,
                                                        idx: number,
                                                    ) => (
                                                        <Card key={idx}>
                                                            <CardContent className="space-y-1">
                                                                <p>
                                                                    <span className="font-semibold">
                                                                        Action:{" "}
                                                                    </span>
                                                                    {
                                                                        action.actionType
                                                                    }
                                                                </p>
                                                                <p>
                                                                    <span className="font-semibold">
                                                                        Remarks:{" "}
                                                                    </span>
                                                                    {action.remarks ||
                                                                        "-"}
                                                                </p>
                                                                <p>
                                                                    <span className="font-semibold">
                                                                        By User
                                                                        ID:{" "}
                                                                    </span>
                                                                    {
                                                                        action.performedBy
                                                                    }
                                                                </p>
                                                                <p>
                                                                    <span className="font-semibold">
                                                                        Timestamp:{" "}
                                                                    </span>
                                                                    {new Date(
                                                                        action.performedAt,
                                                                    ).toLocaleString()}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    ),
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            )}

                            {selectedComplaint.meta && (
                                <Card className="overflow-auto">
                                    <CardHeader>
                                        <CardTitle>Metadata</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="max-h-48">
                                            <Table>
                                                <TableBody>
                                                    {Object.entries(
                                                        selectedComplaint.meta,
                                                    ).map(([key, value]) => (
                                                        <TableRow key={key}>
                                                            <TableCell className="font-semibold w-1/3">
                                                                {key}
                                                            </TableCell>
                                                            <TableCell>
                                                                {value !==
                                                                    null &&
                                                                typeof value ===
                                                                    "object"
                                                                    ? JSON.stringify(
                                                                          value,
                                                                      )
                                                                    : (value?.toString() ??
                                                                      "-")}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setShowViewDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="w-full py-0">
                <Table>
                    <TableHeader className="bg-primary rounded-2xl">
                        <TableRow>
                            {[
                                "ID",
                                "Raised By",
                                "Dept/Section",
                                "Title",
                                "Status",
                                "Actions",
                            ].map((header) => (
                                <TableHead
                                    key={header}
                                    className="text-primary-foreground font-bold font-poppins"
                                >
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {status === "pending" ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-6"
                                >
                                    <Loader2 className="animate-spin w-4 h-4" />{" "}
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : status === "error" ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-6 flex flex-col items-center gap-2"
                                >
                                    <span className="text-red-500">
                                        Failed to load complaints.
                                    </span>
                                    <Button onClick={() => refetch()}>
                                        Retry
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ) : complaints.length > 0 ? (
                            complaints.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell>{c.id}</TableCell>
                                    <TableCell>{c.raisedBy}</TableCell>
                                    <TableCell>
                                        {c.raisedFromDepartment}-
                                        {c.raisedFromSection}
                                    </TableCell>
                                    <TableCell>{c.title}</TableCell>
                                    <TableCell>{c.status}</TableCell>
                                    <TableCell>
                                        <OptionsButton
                                            options={[
                                                {
                                                    icon: <Eye />,
                                                    name: "View",
                                                    handler: () => {
                                                        setSelectedComplaint(c);
                                                        setShowViewDialog(true);
                                                    },
                                                },
                                                {
                                                    icon: <Pencil />,
                                                    name: "Take Action",
                                                    handler: () => {
                                                        setSelectedComplaint(c);
                                                        setShowActionModal(
                                                            true,
                                                        );
                                                    },
                                                },
                                                {
                                                    icon: <Trash2 />,
                                                    name: "Delete",
                                                    handler: () => {
                                                        setDeletingComplaint(c);
                                                        setShowDeleteDialog(
                                                            true,
                                                        );
                                                    },
                                                },
                                            ]}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-6"
                                >
                                    No complaints found.
                                </TableCell>
                            </TableRow>
                        )}

                        {complaints.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-6">
                                    <div
                                        ref={sentinelRef}
                                        className="flex items-center justify-center"
                                    >
                                        {isFetchingNextPage ? (
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <Loader2 className="animate-spin w-4 h-4" />{" "}
                                                Loading more…
                                            </div>
                                        ) : hasNextPage ? (
                                            <div className="h-4" />
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                No more results
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

export default ComplaintsPage;
