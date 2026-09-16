import type { ReactNode } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { EllipsisVertical, Loader2 } from "lucide-react";

export interface Option {
    icon: ReactNode;
    name: string;
    handler: () => void;
}

export interface OptionsButtonProps {
    options: Option[];
    loading?: boolean;
}

function OptionsButton({ options, loading = false }: OptionsButtonProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    disabled={loading}
                    className="rounded-full"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <EllipsisVertical className="w-5 h-5" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-[160px]">
                {options.map((opt, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={opt.handler}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        {opt.icon}
                        <span>{opt.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default OptionsButton;
