import { useState, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import Dialog from "@/components/dialog";
import OptionsButton from "@/components/options-button";

import type { ComplaintType } from "@/types/complaint-type";
import {
    useAddComplaintType,
    useDeleteComplaintType,
    useUpdateComplaintType,
} from "@/api/complaint-type";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetComplaintTypes } from "@/api/complaint-type";
import FormBuilder from "@/components/form/form-builder";
import FormView from "@/components/form/form-view";

const ComplaintList = memo(
    ({
        complaints,
        onEdit,
        onDelete,
        onView,
    }: {
        complaints: ComplaintType[];
        onEdit: (c: ComplaintType) => void;
        onDelete: (c: ComplaintType) => void;
        onView: (c: ComplaintType) => void;
    }) => {
        if (!complaints.length) {
            return (
                <div className="text-center text-muted-foreground py-10">
                    No complaint types found.
                </div>
            );
        }

        return (
            <ul className="space-y-3">
                {complaints.map((c: ComplaintType) => (
                    <li
                        key={c.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 flex justify-between"
                    >
                        <div>
                            <h3 className="font-semibold">{c.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                {c.description}
                            </p>
                        </div>

                        <OptionsButton
                            options={[
                                {
                                    name: "View",
                                    icon: <Eye className="w-4 h-4" />,
                                    handler: () => onView(c),
                                },
                                {
                                    name: "Edit",
                                    icon: <Pencil className="w-4 h-4" />,
                                    handler: () => onEdit(c),
                                },
                                {
                                    name: "Delete",
                                    icon: (
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    ),
                                    handler: () => onDelete(c),
                                },
                            ]}
                        />
                    </li>
                ))}
            </ul>
        );
    },
);

export default function ComplaintTypes() {
    const [search, setSearch] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<ComplaintType | null>(
        null,
    );

    const queryClient = useQueryClient();
    const {
        data: complaints = [],
        isLoading,
        isError,
        error,
        refetch: refetchComplaints,
    } = useGetComplaintTypes();
    const { mutate: deleteComplaint, isPending: isDeleting } =
        useDeleteComplaintType();

    const { mutate: addComplaintType, isPending: isAdding } =
        useAddComplaintType();

    const { mutate: updateComplaintType, isPending: isUpdating } =
        useUpdateComplaintType();
    const filtered = useMemo(
        () =>
            complaints.filter(
                (c) =>
                    c.title.toLowerCase().includes(search.toLowerCase()) ||
                    c.description.toLowerCase().includes(search.toLowerCase()),
            ),
        [complaints, search],
    );
    const [editingComplaint, setEditingComplaint] =
        useState<ComplaintType | null>(null);
    const [formBuilderMode, setFormBuilderMode] = useState<"edit" | "add">(
        "add",
    );
    const [showFormBuilder, setShowFormBuilder] = useState(false);
    const [viewing, setViewing] = useState<ComplaintType | null>(null);

    return (
        <div className="p-6 space-y-5">
            <Dialog
                open={!!viewing}
                onOpenChange={() => setViewing(null)}
                className="max-h-[95vh] overflow-auto"
                header="View Complaint Form"
                body={viewing && <FormView mode="debug" form={viewing} />}
            />

            {showFormBuilder && (
                <FormBuilder
                    show={showFormBuilder}
                    setShow={(v) => {
                        setShowFormBuilder(v);
                        if (!v) setEditingComplaint(null);
                    }}
                    form={
                        formBuilderMode === "edit"
                            ? (editingComplaint ?? undefined)
                            : undefined
                    }
                    onSave={(e) => {
                        if (editingComplaint) {
                            updateComplaintType(
                                {
                                    id: editingComplaint.id,
                                    title: e.title,
                                    description: e.description,
                                    //@ts-expect-error("This is inserted as string for backend")
                                    fields: JSON.stringify(e.fields),
                                },
                                {
                                    onSuccess: () => {
                                        toast.success("Complaint type updated");
                                        refetchComplaints();
                                        setShowFormBuilder(false);
                                        setEditingComplaint(null);
                                    },
                                    onError: (err) => {
                                        toast.error(
                                            "Failed to update: " +
                                                (err.response?.data.message ??
                                                    err.message),
                                        );
                                    },
                                },
                            );
                        } else {
                            addComplaintType(
                                {
                                    title: e.title,
                                    description: e.description,
                                    //@ts-expect-error("This is inserted as string for backend")
                                    fields: JSON.stringify(e.fields),
                                },
                                {
                                    onSuccess: () => {
                                        toast.success("Complaint type added");
                                        refetchComplaints();
                                        setShowFormBuilder(false);
                                    },
                                    onError: (err) => {
                                        toast.error(
                                            "Failed to add: " +
                                                (err.response?.data.message ??
                                                    err.message),
                                        );
                                    },
                                },
                            );
                        }
                    }}
                    isSubmitting={isAdding || isUpdating}
                />
            )}

            <div className="flex justify-between">
                <h2 className="text-3xl font-bold">Complaint Types</h2>
                <Button
                    onClick={() => {
                        setFormBuilderMode("add");
                        setShowFormBuilder(true);
                    }}
                >
                    <Plus />
                    New Complaint Type
                </Button>
            </div>

            <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <Card className="p-5">
                {isLoading && <Loader2 className="animate-spin" />}
                {isError && (
                    <Alert
                        variant={"destructive"}
                        className="flex flex-col items-center justify-center"
                    >
                        <AlertTitle>Failed to load complaint types</AlertTitle>
                        <AlertDescription>
                            {error.response?.data.message ?? error.message}
                            <Button onClick={() => refetchComplaints()}>
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
                {!isLoading && !isError && (
                    <ComplaintList
                        complaints={filtered}
                        onEdit={(c: ComplaintType) => {
                            setEditingComplaint(c);
                            setFormBuilderMode("edit");
                            setShowFormBuilder(true);
                        }}
                        onView={setViewing}
                        onDelete={setDeleteTarget}
                    />
                )}
            </Card>

            <Dialog
                open={!!deleteTarget}
                onOpenChange={() => setDeleteTarget(null)}
                header="Delete Complaint Type?"
                body={
                    <p className="text-sm text-muted-foreground">
                        This action cannot be undone.
                    </p>
                }
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() =>
                                deleteTarget &&
                                deleteComplaint(deleteTarget.id, {
                                    onSuccess: () => {
                                        toast.success("Deleted");
                                        queryClient.invalidateQueries({
                                            queryKey: ["complaint-types"],
                                        });
                                        setDeleteTarget(null);
                                    },
                                })
                            }
                        >
                            {isDeleting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete
                        </Button>
                    </>
                }
            />
        </div>
    );
}
