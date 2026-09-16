import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Dialog from "@/components/dialog";

import { useDeleteDepartment } from "@/api/department";
import { queryClient } from "@/main";
import type { Department } from "@/types/department";

interface Props {
    department: Department | null;
    setDepartment: (department: Department | null) => void;
    open: boolean;
    setOpen: (v: boolean) => void;
}

function DeleteDepartmentDialog({
    department,
    open,
    setOpen,
    setDepartment,
}: Props) {
    const {
        mutate: deleteDepartment,
        isPending,
        error,
        reset: resetMutation,
    } = useDeleteDepartment();

    const handleDelete = () => {
        if (!department) return;

        deleteDepartment(department.code, {
            onSuccess: () => {
                toast.success("Department deleted");
                queryClient.invalidateQueries({ queryKey: ["departments"] });
                setOpen(false);
                setDepartment(null);
            },
            onError: () => toast.error("Failed to delete department"),
        });
    };

    const handleOpenChange = (v: boolean) => {
        setOpen(v);
        if (!v) {
            setDepartment(null);
            resetMutation();
        }
    };

    if (!department) return null;

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
            header="Delete Department"
            className="max-w-md"
            body={
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This action cannot be undone. All sections under
                        <span className="font-semibold">
                            {" "}
                            {department.name}
                        </span>{" "}
                        will be permanently removed.
                    </p>

                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle className="flex gap-2">
                                <AlertTriangle className="w-4 h-4" /> Delete
                                failed
                            </AlertTitle>
                            <AlertDescription>
                                {error?.response?.data.message ?? error.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            }
            footer={
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </div>
            }
        />
    );
}

export default DeleteDepartmentDialog;
