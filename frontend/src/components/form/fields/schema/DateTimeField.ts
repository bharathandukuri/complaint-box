import { z } from "zod";
import type { DateTimeFieldProps } from "../../types";

export function buildDateTimeFieldSchema(props: DateTimeFieldProps) {
    let schema = z.date({
        error: props.required
            ? "This field is required"
            : "Invalid date & time",
    });
    if (props.before?.test) {
        const limit = new Date(props.before.test);
        schema = schema.max(limit, {
            message:
                props.before.error ||
                `Must be before ${limit.toLocaleString()}`,
        });
    }

    if (props.after?.test) {
        const limit = new Date(props.after.test);
        schema = schema.min(limit, {
            message:
                props.after.error || `Must be after ${limit.toLocaleString()}`,
        });
    }

    return z.preprocess(
        (val) => {
            if (!val || val === "") return undefined;
            const date = new Date(val as string | number | Date);
            return isNaN(date.getTime()) ? val : date;
        },
        props.required ? schema : schema.optional(),
    );
}

export function getDateTimeFieldDefaultValue(props: DateTimeFieldProps) {
    return props.defaultValue ?? undefined;
}
