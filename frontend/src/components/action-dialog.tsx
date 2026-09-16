import Dialog from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface ActionDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmContent?: ReactNode;
    cancelContent?: ReactNode;
    loading?: boolean;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function ActionDialog({
    open,
    title,
    description,
    confirmContent = "Confirm",
    cancelContent = "Cancel",
    loading = false,
    destructive = false,
    onConfirm,
    onCancel,
}: ActionDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(v) => !v && onCancel()}
            header={title}
            body={
                <p className="text-sm text-muted-foreground mt-2">
                    {description}
                </p>
            }
            footer={
                <>
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelContent}
                    </Button>

                    <Button
                        variant={destructive ? "destructive" : "default"}
                        onClick={onConfirm}
                        disabled={loading}
                        className="min-w-[120px]"
                    >
                        {loading && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {confirmContent}
                    </Button>
                </>
            }
        />
    );
}

export default ActionDialog;
