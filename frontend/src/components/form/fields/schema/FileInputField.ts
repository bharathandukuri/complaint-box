import z from "zod";
import type { FileInputFieldProps } from "../../types";

export function buildFileInputFieldSchema(props: FileInputFieldProps) {
    let schema = z.array(z.any());

    if (props.required) {
        schema = schema.min(1, {
            error: "At least one file is required",
        });
    }

    if (props.maxFiles) {
        schema = schema.max(props.maxFiles, {
            error: "File upload limit exceeded",
        });
    }

    if (!props.required) {
        return schema.optional();
    }

    return schema;
}

export function getFileInputFieldDefaultValue(props: FileInputFieldProps) {
    return props.defaultValue ?? [];
}
