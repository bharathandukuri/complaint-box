import * as Icons from "lucide-react";
import type { LucideIconName } from "./types";

export function FieldIcon({ name }: { name?: LucideIconName }) {
    if (!name) return null;
    const Icon = Icons[name] as React.ElementType;
    return <Icon className="w-4 h-4" />;
}
