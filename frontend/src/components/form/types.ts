import * as Icons from "lucide-react";
import { z } from "zod";

export type LucideIconName = keyof typeof Icons;

interface ValidationTest<TTest = unknown> {
    test: TTest;
    error: string;
}

export const validationTestSchema = z
    .object({
        test: z.any().optional(),
        error: z.string().optional(),
    })
    .superRefine(({ test, error }, ctx) => {
        if (test && !error) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Test and error are required",
                path: ["error"],
            });
        }
    });

interface BaseFormElement {
    id: string;
    elementType: string;
}

interface BaseFieldProps<TValue = unknown> extends BaseFormElement {
    elementType: "field";

    fieldType: string;

    name: string;

    label?: string;
    description?: string;

    required?: boolean;
    defaultValue?: TValue;

    disabled?: boolean;
}

export const baseFieldSchema = z.object({
    name: z
        .string({ error: "Name is required" })
        .min(1, { message: "Name is required" })
        .max(32, { message: "Name must be less than 32 characters" })
        .regex(/^[a-zA-Z0-9_-]+$/, {
            error: "Name must contain only letters, numbers, underscores, and dashes",
        }),
    label: z.string().optional(),
    description: z.string().optional(),
    required: z.boolean().optional(),
    defaultValue: z.any().optional(),
    disabled: z.boolean().optional(),
});

interface BaseViewProps extends BaseFormElement {
    elementType: "view";
    viewType: string;

    mt?: number;
    mb?: number;
}

export interface TextFieldProps extends BaseFieldProps<string> {
    fieldType: "text-field";

    type: "text" | "password" | "email";

    placeholder?: string;
    icon?: LucideIconName;

    minLength?: ValidationTest<number>;
    maxLength?: ValidationTest<number>;
    regexes?: ValidationTest<RegExp>[];
}

export const textFieldSchema = baseFieldSchema
    .extend({
        type: z.enum(["text", "password", "email"], {
            error: "Type is required",
        }),
        placeholder: z.string().optional(),
        icon: z
            .enum(Object.keys(Icons) as [string, ...string[]], {
                error: "Invalid icon",
            })
            .optional(),
        minLength: validationTestSchema.safeExtend({
            test: z
                .number()
                .min(1, { message: "Min length must be greater than 0" })
                .nullish(),
        }),
        maxLength: validationTestSchema.safeExtend({
            test: z
                .number()
                .min(1, { message: "Max length must be greater than 0" })
                .nullish(),
        }),
        regexes: z
            .array(
                validationTestSchema.safeExtend({
                    test: z.union([z.instanceof(RegExp), z.string()]).nullish(),
                }),
            )
            .optional(),
    })
    .superRefine((data, ctx) => {
        const min = data.minLength?.test;
        const max = data.maxLength?.test;

        if (typeof min === "number" && typeof max === "number") {
            if (min > max) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Min length must be less than max",
                    path: ["minLength", "test"],
                });
            }
        }
    });

export interface TextAreaProps extends BaseFieldProps<string> {
    fieldType: "text-area";

    placeholder?: string;

    maxLength?: ValidationTest<number>;
    minLength?: ValidationTest<number>;
}

export const textAreaSchema = baseFieldSchema
    .extend({
        placeholder: z.string().optional(),
        minLength: validationTestSchema.safeExtend({
            test: z
                .number()
                .min(1, { message: "Min length must be greater than 0" })
                .nullish(),
        }),
        maxLength: validationTestSchema.safeExtend({
            test: z
                .number()
                .min(1, { message: "Max length must be greater than 0" })
                .nullish(),
        }),
    })
    .superRefine((data, ctx) => {
        const min = data.minLength?.test;
        const max = data.maxLength?.test;

        if (typeof min === "number" && typeof max === "number") {
            if (min > max) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Min length must be less than max",
                    path: ["minLength", "test"],
                });
            }
        }
    });

export interface NumberFieldProps extends BaseFieldProps<number> {
    fieldType: "number-field";

    placeholder?: string;
    icon?: LucideIconName;

    gt?: ValidationTest<number>;
    gte?: ValidationTest<number>;
    lt?: ValidationTest<number>;
    lte?: ValidationTest<number>;
}

export const numberFieldSchema = baseFieldSchema
    .extend({
        placeholder: z.string().optional(),
        gt: validationTestSchema.safeExtend({
            test: z.number().nullish(),
        }),
        gte: validationTestSchema.safeExtend({
            test: z.number().nullish(),
        }),
        lt: validationTestSchema.safeExtend({
            test: z.number().nullish(),
        }),
        lte: validationTestSchema.safeExtend({
            test: z.number().nullish(),
        }),
    })
    .superRefine((data, ctx) => {
        const gt = data.gt?.test ?? undefined;
        const gte = data.gte?.test ?? undefined;
        const lt = data.lt?.test ?? undefined;
        const lte = data.lte?.test ?? undefined;

        const effectiveMin = gte !== undefined ? gte : gt;
        const effectiveMax = lte !== undefined ? lte : lt;

        if (effectiveMin !== undefined && effectiveMax !== undefined) {
            if (effectiveMin > effectiveMax) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                        "Minimum value constraint cannot be greater than maximum value constraint",
                    path: [gte !== undefined ? "gte" : "gt", "test"],
                });
            }
        }

        if (gt !== undefined && gte !== undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "Please provide either 'Greater Than' or 'Greater Than or Equal To', not both",
                path: ["gte", "test"],
            });
        }

        if (lt !== undefined && lte !== undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "Please provide either 'Less Than' or 'Less Than or Equal To', not both",
                path: ["lte", "test"],
            });
        }
    });

export interface SelectFieldProps extends BaseFieldProps<string> {
    fieldType: "select-field";

    placeholder?: string;

    options: {
        value: string;
        label: string;
    }[];
}

export const selectFieldSchema = baseFieldSchema.extend({
    placeholder: z.string().optional(),
    options: z
        .array(
            z.object({
                label: z.string().min(1, "Label is required"),
                value: z.string().min(1, "Value is required"),
            }),
        )
        .min(1, "At least one option is required"),
});

export interface RadioFieldProps extends BaseFieldProps<string> {
    fieldType: "radio-field";

    layout: "row" | "column";

    options: {
        value: string;
        label: string;
    }[];
}

export const radioFieldSchema = baseFieldSchema.extend({
    placeholder: z.string().optional(),
    options: z
        .array(
            z.object({
                label: z.string().min(1, "Label is required"),
                value: z.string().min(1, "Value is required"),
            }),
        )
        .min(1, "At least one option is required"),
    layout: z.literal("row").or(z.literal("column")),
});

export interface CheckboxFieldProps extends BaseFieldProps<boolean> {
    fieldType: "checkbox-field";
}

export const checkboxFieldSchema = baseFieldSchema;

export interface DateFieldProps extends BaseFieldProps<Date> {
    fieldType: "date-field";

    placeholder?: string;
    before?: ValidationTest<Date>;
    after?: ValidationTest<Date>;
}

export const dateFieldSchema = baseFieldSchema
    .extend({
        placeholder: z.string().optional(),
        before: validationTestSchema.safeExtend({
            test: z.date().nullish(),
        }),
        after: validationTestSchema.safeExtend({
            test: z.date().nullish(),
        }),
    })
    .superRefine((data, ctx) => {
        const beforeDate = data.before?.test;
        const afterDate = data.after?.test;
        const defaultDate = data.defaultValue;

        if (beforeDate instanceof Date && afterDate instanceof Date) {
            if (afterDate > beforeDate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                        "The 'After' date must be earlier than the 'Before' date",
                    path: ["after", "test"],
                });
            }
        }

        if (defaultDate instanceof Date && beforeDate instanceof Date) {
            if (defaultDate >= beforeDate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Default value must be before the 'Before' date",
                    path: ["defaultValue"],
                });
            }
        }

        if (defaultDate instanceof Date && afterDate instanceof Date) {
            if (defaultDate <= afterDate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Default value must be after the 'After' date",
                    path: ["defaultValue"],
                });
            }
        }
    });

export interface Time {
    hours?: number;
    minutes?: number;
    seconds?: number;

    meridian?: "am" | "pm";
}

export interface TimeFieldProps extends BaseFieldProps<Time> {
    fieldType: "time-field";

    secondsInput?: boolean;
    meridian?: Time["meridian"];

    placeholder?: string;
}

export const timeSchema = z.object({
    hours: z
        .number()
        .int()
        .min(1)
        .max(12, { message: "Hours must be 1-12" })
        .nullish(),
    minutes: z.number().int().min(0).max(59).nullish(),
    seconds: z.number().int().min(0).max(59).nullish(),
    meridian: z.enum(["am", "pm"]),
});
export const timeFieldSchema = baseFieldSchema.extend({
    placeholder: z.string().optional(),
    secondsInput: z.boolean().optional(),
});

export interface DateTimeFieldProps extends BaseFieldProps<Date> {
    fieldType: "date-time-field";

    placeholder?: string;

    secondsInput?: boolean;

    before?: ValidationTest<Date>;
    after?: ValidationTest<Date>;
}

export const dateTimeFieldSchema = baseFieldSchema
    .extend({
        placeholder: z.string().optional(),
        secondsInput: z.boolean().optional(),
        defaultValue: z.date().optional(),
        before: validationTestSchema.safeExtend({
            test: z.date().nullish(),
        }),
        after: validationTestSchema.safeExtend({
            test: z.date().nullish(),
        }),
    })
    .superRefine((data, ctx) => {
        const { before, after, defaultValue } = data;
        const b = before?.test ? new Date(before.test) : null;
        const a = after?.test ? new Date(after.test) : null;
        const d = defaultValue ? new Date(defaultValue) : null;

        if (a && b && a > b) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "The 'After' date must be earlier than the 'Before' date",
                path: ["after", "test"],
            });
        }

        if (d && b && d >= b) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Default value must be before the limit",
                path: ["defaultValue"],
            });
        }

        if (d && a && d <= a) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Default value must be after the limit",
                path: ["defaultValue"],
            });
        }
    });

export interface FileInputFieldProps extends BaseFieldProps<File[] | string[]> {
    fieldType: "file-input-field";

    placeholder?: string;
    accept?: "image" | "video" | "audio" | "all";
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
}

export const fileInputFieldSchema = baseFieldSchema.extend({
    placeholder: z.string().optional(),
    accept: z.enum(["image", "video", "audio", "all"]).optional(),
    multiple: z.boolean().optional(),
    maxSize: z
        .number()
        .min(1, { message: "Max size must be greater than 0" })
        .nullish(),
    maxFiles: z
        .number()
        .min(1, { message: "Max files must be greater than 0" })
        .nullish(),
});

export interface HeadingProps extends BaseViewProps {
    viewType: "heading";

    level: 1 | 2 | 3 | 4 | 5 | 6;
    align?: "left" | "center" | "right";
    text: string;
}

export interface ParagraphProps extends BaseViewProps {
    viewType: "paragraph";
    text: string;
}

export interface ImageProps extends BaseViewProps {
    viewType: "image";
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fit?: "contain" | "cover";
    rounded?: number;
    align?: "left" | "center" | "right";
}

export type FieldProps =
    | TextFieldProps
    | TextAreaProps
    | NumberFieldProps
    | SelectFieldProps
    | CheckboxFieldProps
    | DateFieldProps
    | TimeFieldProps
    | DateTimeFieldProps
    | FileInputFieldProps
    | RadioFieldProps;

export type ViewProps = HeadingProps | ParagraphProps | ImageProps;

export type FormElement = FieldProps | ViewProps;

export interface Form {
    title: string;
    description: string;
    fields: FormElement[];
    onSubmit?: (data: Record<string, unknown>) => void;
    isSubmitting?: boolean;
    error?: string;
}

export function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

export const headingSchema = z.object({
    level: z.coerce.number().min(1).max(6),
    text: z.string().min(1, "Text is required"),
    align: z.enum(["left", "center", "right"]),
    mt: z.coerce.number().optional(),
    mb: z.coerce.number().optional(),
});

export const paragraphSchema = z.object({
    text: z.string().min(1, "Text is required"),
    mt: z.coerce.number().optional(),
    mb: z.coerce.number().optional(),
});

export const imageSchema = z.object({
    src: z.string().url("Must be a valid image URL"),
    alt: z.string().min(1, "Alt text is required"),
    width: z.coerce.number().optional(),
    height: z.coerce.number().optional(),
    fit: z.enum(["contain", "cover"]),
    align: z.enum(["left", "center", "right"]),
    rounded: z.coerce.number().optional(),
    mt: z.coerce.number().optional(),
    mb: z.coerce.number().optional(),
});
