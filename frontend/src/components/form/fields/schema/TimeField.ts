import z from "zod";
import type { TimeFieldProps } from "../../types";

export function buildTimeFieldSchema(props: TimeFieldProps) {
    let schema = z.object(
        {
            hours: z.number().min(0).max(23),
            minutes: z.number().min(0).max(59),
            seconds: z.number().min(0).max(59).optional(),
            meridian: z.enum(["am", "pm"]).optional(),
        },
        {
            error: props.required ? "This field is required" : "Invalid time",
        },
    );

    schema = schema.refine(
        (v) => {
            return (
                v.hours !== undefined &&
                v.hours >= 1 &&
                v.hours <= 12 &&
                v.meridian !== undefined
            );
        },
        { error: "Invalid time" },
    );

    if (props.required) {
        schema = schema.refine(
            (v) => v.hours !== undefined && v.minutes !== undefined,
            { error: "Time is required" },
        );
    }

    if (!props.required) {
        return schema.optional();
    }

    return schema;
}

export function getTimeFieldDefaultValue(props: TimeFieldProps) {
    return props.defaultValue ?? undefined;
}
