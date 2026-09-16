import z from "zod";
import type { TextFieldProps } from "../../types";

export function buildTextFieldSchema(props: TextFieldProps) {
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

    if (props.regexes && Array.isArray(props.regexes)) {
        for (const regexObj of props.regexes) {
            if (regexObj.test) {
                try {
                    const pattern =
                        typeof regexObj.test === "string"
                            ? new RegExp(regexObj.test)
                            : regexObj.test;

                    schema = schema.regex(pattern, {
                        message: regexObj.error || "Invalid format",
                    });
                } catch {
                    console.error(
                        "Invalid Regex pattern provided:",
                        regexObj.test,
                    );
                }
            }
        }
    }

    if (!props.required) {
        return schema.optional().or(z.literal(""));
    }

    return schema;
}

export function getTextFieldDefaultValue(props: TextFieldProps) {
    return props.defaultValue !== undefined ? props.defaultValue : "";
}
