import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    message?: string;
};

export default function ErrorDialog({
    open,
    onOpenChange,
    title,
    message,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-red-600">
                        {title ?? "Error"}
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    {message ?? "Something went wrong."}
                </p>
                <div className="flex justify-end mt-4">
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

type ErrorContextType = {
    showError: (message: string, title?: string) => void;
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("Error");

    const showError = useCallback((msg: string, ttl?: string) => {
        setMessage(msg);
        setTitle(ttl || "Error");
        setOpen(true);
    }, []);

    return (
        <ErrorContext.Provider value={{ showError }}>
            {children}
            <ErrorDialog
                open={open}
                onOpenChange={setOpen}
                title={title}
                message={message || ""}
            />
        </ErrorContext.Provider>
    );
}

export function useError() {
    const ctx = useContext(ErrorContext);
    if (!ctx) throw new Error("useError must be used within an ErrorProvider");
    return ctx;
}
