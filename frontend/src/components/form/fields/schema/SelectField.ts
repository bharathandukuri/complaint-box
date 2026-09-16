import z from "zod";
import type { SelectFieldProps } from "../../types";

export function buildSelectFieldSchema(props: SelectFieldProps) {
    const values = props.options.map((o) => o.value);

    let schema = z
        .string({
            error: "This field is required",
        })
        .refine((v) => v === undefined || values.includes(v), {
            error: "Invalid selection",
        });

    if (props.required) {
        schema = schema.refine((v) => v !== undefined && v !== "", {
            error: "This field is required",
        });
    }

    if (!props.required) {
        return schema.optional();
    }

    return schema;
}

export function getSelectFieldDefaultValue(props: SelectFieldProps) {
    return props.defaultValue ?? undefined;
}
