import type { FormElement } from "@/components/form/types";

export type ComplaintType = {
    id: number;
    title: string;
    description: string;
    fields: FormElement[];
};
