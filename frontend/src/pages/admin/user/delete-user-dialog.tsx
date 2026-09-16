import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Dialog from "@/components/dialog";

import { useDeleteUser } from "@/api/user";
import { queryClient } from "@/main";
import type { User } from "@/types/user";

interface Props {
    user: User | null;
    setUser: (user: User | null) => void;
    open: boolean;
    setOpen: (v: boolean) => void;
}

function DeleteUserDialog({ user, setUser, open, setOpen }: Props) {
    const {
        mutate: deleteUser,
        isPending,
        error,
        reset: resetMutation,
    } = useDeleteUser();

    const handleDelete = () => {
        if (!user || user.id === undefined) return;

        deleteUser(user.id, {
            onSuccess: () => {
                toast.success("User deleted successfully");
                queryClient.invalidateQueries({ queryKey: ["users"] });
                setOpen(false);
                setUser(null);
            },
            onError: () => toast.error("Failed to delete user"),
        });
    };

    const handleOpenChange = (v: boolean) => {
        setOpen(v);
        if (!v) {
            setUser(null);
            resetMutation();
        }
    };

    if (!user) return null;

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
            header="Delete User"
            className="max-w-md"
            body={
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">
                            {user.name}
                        </span>
                        ? This action cannot be undone and will permanently
                        remove their account data.
                    </p>

                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle className="flex gap-2 items-center">
                                <AlertTriangle className="w-4 h-4" />
                                Delete failed
                            </AlertTitle>
                            <AlertDescription>
                                {error?.response?.data.message ?? error.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            }
            footer={
                <div className="flex justify-end gap-3 w-full">
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
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Deleting...
                            </>
                        ) : (
                            "Delete User"
                        )}
                    </Button>
                </div>
            }
        />
    );
}

export default DeleteUserDialog;
