import { useState } from "react";
import NewComplaintForm from "./new-complaint-form";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Eye, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import OptionsButton from "@/components/options-button";
import type { Complaint, ComplaintAction } from "@/types/complaint";
import { useDeleteComplaint, useGetStudentComplaints } from "@/api/complaint";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function Complaints() {
    const [open, setOpen] = useState(false);

    const [selectedComplaint, setSelectedComplaint] =
        useState<Complaint | null>(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const { data, isLoading, isError, refetch } = useGetStudentComplaints();
    const deleteMutation = useDeleteComplaint();

    return (
        <div className="flex flex-col p-5 space-y-5">
            {open && <NewComplaintForm open={open} setOpen={setOpen} />}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-poppins">Users</h1>
                <Button onClick={() => setOpen(true)}>New Complaint</Button>
            </div>

            <Dialog
                open={openViewDialog}
                onOpenChange={(open) => !open && setOpenViewDialog(false)}
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
                                        {new Date(
                                            selectedComplaint.createdAt,
                                        ).toLocaleString()}
                                    </p>
                                    <p>
                                        <span className="font-semibold">
                                            Last Updated:{" "}
                                        </span>
                                        {new Date(
                                            selectedComplaint.updatedAt,
                                        ).toLocaleString()}
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
                                                    {selectedComplaint.meta &&
                                                        Object.entries(
                                                            selectedComplaint.meta,
                                                        ).map(
                                                            ([key, value]) => (
                                                                <TableRow
                                                                    key={key}
                                                                >
                                                                    <TableCell className="font-semibold w-1/3">
                                                                        {key}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {typeof value ===
                                                                            "object" &&
                                                                        value !==
                                                                            null
                                                                            ? JSON.stringify(
                                                                                  value,
                                                                              )
                                                                            : (value as React.ReactNode)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ),
                                                        )}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setOpenViewDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={openDeleteDialog}
                onOpenChange={(open) => !open && setOpenDeleteDialog(false)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Complaint</DialogTitle>
                    </DialogHeader>
                    <p>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">
                            {selectedComplaint?.title}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpenDeleteDialog(false)}
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                selectedComplaint &&
                                deleteMutation.mutate(selectedComplaint.id, {
                                    onSuccess: () => {
                                        setOpenDeleteDialog(false);
                                        refetch();
                                    },
                                    onError: () => {
                                        setOpenDeleteDialog(false);
                                        toast.error(
                                            "Failed to delete complaint.",
                                        );
                                    },
                                })
                            }
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && (
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                            )}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="w-full py-0">
                <Table>
                    <TableHeader className="bg-primary rounded-t-2xl">
                        <TableRow className="hover:bg-primary">
                            <TableHead className="text-primary-foreground font-bold">
                                Title
                            </TableHead>
                            <TableHead className="text-primary-foreground font-bold">
                                Description
                            </TableHead>
                            <TableHead className="text-primary-foreground font-bold">
                                Status
                            </TableHead>
                            <TableHead className="text-primary-foreground font-bold">
                                Created At
                            </TableHead>
                            <TableHead className="text-primary-foreground font-bold text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-secondary">
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-6 text-center"
                                >
                                    <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-6 text-center text-red-500"
                                >
                                    Something went wrong!{" "}
                                    <Button onClick={() => refetch()} size="sm">
                                        Retry
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ) : !data || data?.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    rowSpan={3}
                                    className="py-8 text-muted-foreground text-center"
                                >
                                    No complaints found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.map((complaint: Complaint) => (
                                <TableRow key={complaint.id}>
                                    <TableCell>{complaint.title}</TableCell>
                                    <TableCell>
                                        {complaint.description}
                                    </TableCell>
                                    <TableCell>{complaint.status}</TableCell>
                                    <TableCell>
                                        {new Date(
                                            complaint.createdAt,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <OptionsButton
                                            options={[
                                                {
                                                    name: "View Details",
                                                    icon: (
                                                        <Eye className="w-4 h-4" />
                                                    ),
                                                    handler: () => {
                                                        setSelectedComplaint(
                                                            complaint,
                                                        );
                                                        setOpenViewDialog(true);
                                                    },
                                                },
                                                {
                                                    name: "Delete",
                                                    icon: (
                                                        <Trash2 className="w-4 h-4" />
                                                    ),
                                                    handler: () => {
                                                        setSelectedComplaint(
                                                            complaint,
                                                        );
                                                        setOpenDeleteDialog(
                                                            true,
                                                        );
                                                    },
                                                },
                                            ]}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
export default Complaints;
