import { z } from "zod";
import type { DateFieldProps } from "../../types";

export function buildDateFieldSchema(props: DateFieldProps) {
    let dateSchema = z.date({
        error: props.required
            ? "This field is required"
            : "Invalid date format",
    });

    if (props.before?.test) {
        const limit = new Date(props.before.test);
        dateSchema = dateSchema.max(limit, {
            message:
                props.before.error ||
                `Must be before ${limit.toLocaleDateString()}`,
        });
    }

    if (props.after?.test) {
        const limit = new Date(props.after.test);
        dateSchema = dateSchema.min(limit, {
            message:
                props.after.error ||
                `Must be after ${limit.toLocaleDateString()}`,
        });
    }

    const finalSchema = z.preprocess(
        (val) => {
            if (!val || val === "") return undefined;
            const date = new Date(val as string | number | Date);
            return isNaN(date.getTime()) ? val : date;
        },
        props.required ? dateSchema : dateSchema.optional(),
    );

    return finalSchema;
}

export function getDateFieldDefaultValue(props: DateFieldProps) {
    return props.defaultValue ?? undefined;
}
