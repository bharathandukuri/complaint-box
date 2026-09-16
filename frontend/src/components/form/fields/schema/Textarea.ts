import z from "zod";
import type { TextAreaProps } from "../../types";

export function buildTextAreaSchema(props: TextAreaProps) {
    let schema: z.ZodString | z.ZodOptional<z.ZodString> = z.string();

    if (props.required) {
        schema = schema.min(1, {
            message: "This field is required",
        });
    }

    if (props.minLength && typeof props.minLength.test === "number") {
        schema = schema.min(props.minLength.test, {
            message:
                props.minLength.error ||
                `Must be at least ${props.minLength.test} characters`,
        });
    }

    if (props.maxLength && typeof props.maxLength.test === "number") {
        schema = schema.max(props.maxLength.test, {
            message:
                props.maxLength.error ||
                `Must be at most ${props.maxLength.test} characters`,
        });
    }

    if (!props.required) {
        return schema.optional().or(z.literal(""));
    }

    return schema;
}

export function getTextAreaDefaultValue(props: TextAreaProps) {
    return props.defaultValue !== undefined ? props.defaultValue : "";
}
