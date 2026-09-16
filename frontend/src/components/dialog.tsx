import { type ReactNode } from "react";
import {
    Dialog as ShadDialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DialogProps {
    trigger?: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    header?: ReactNode;
    body?: ReactNode;
    footer?: ReactNode;
    className?: string;
    showCloseButton?: boolean;
}

function Dialog({
    trigger,
    open,
    onOpenChange,
    header,
    body,
    footer,
    className,
    showCloseButton = true,
}: DialogProps) {
    return (
        <ShadDialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent
                className={cn(className)}
                showCloseButton={showCloseButton}
            >
                {header && (
                    <DialogHeader>
                        <DialogTitle>{header}</DialogTitle>
                    </DialogHeader>
                )}

                {body}

                {footer && <DialogFooter>{footer}</DialogFooter>}
            </DialogContent>
        </ShadDialog>
    );
}

export default Dialog;
