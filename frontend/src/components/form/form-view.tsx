import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldSet, FieldGroup } from "../ui/field";
import { Button } from "../ui/button";

import type { Form, FieldProps } from "./types";

import { TextField } from "./fields/ui/TextField";
import { NumberField } from "./fields/ui/NumberField";
import { CheckboxField } from "./fields/ui/CheckboxField";
import { SelectField } from "./fields/ui/SelectField";
import { TimeField } from "./fields/ui/TimeField";
import { DateTimeField } from "./fields/ui/DateTimeField";
import { RadioField } from "./fields/ui/RadioField";

import { HeadingView } from "./views/HeadingView";
import { ParagraphView } from "./views/ParagraphView";
import { ImageView } from "./views/ImageView";
import { toast } from "sonner";
import { Loader2, RefreshCcw, Upload } from "lucide-react";
import { Alert } from "../ui/alert";
import {
    buildTextFieldSchema,
    getTextFieldDefaultValue,
} from "./fields/schema/TextField";
import {
    buildNumberFieldSchema,
    getNumberFieldDefaultValue,
} from "./fields/schema/NumberField";
import {
    buildCheckboxFieldSchema,
    getCheckboxFieldDefaultValue,
} from "./fields/schema/CheckboxField";
import {
    buildSelectFieldSchema,
    getSelectFieldDefaultValue,
} from "./fields/schema/SelectField";
import {
    buildDateFieldSchema,
    getDateFieldDefaultValue,
} from "./fields/schema/DateField";
import {
    buildFileInputFieldSchema,
    getFileInputFieldDefaultValue,
} from "./fields/schema/FileInputField";
import {
    buildTimeFieldSchema,
    getTimeFieldDefaultValue,
} from "./fields/schema/TimeField";
import {
    buildDateTimeFieldSchema,
    getDateTimeFieldDefaultValue,
} from "./fields/schema/DateTimeField";
import {
    buildRadioFieldSchema,
    getRadioFieldDefaultValue,
} from "./fields/schema/RadioField";
import { DateField } from "./fields/ui/DateField";
import { FileInputField } from "./fields/ui/FileInputField";
import {
    buildTextAreaSchema,
    getTextAreaDefaultValue,
} from "./fields/schema/Textarea";
import { TextArea } from "./fields/ui/Textarea";

function serializeForDebug(data: Record<string, unknown>) {
    const obj: Record<string, unknown> = {};

    const getFileMetadata = (file: File) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
    });

    for (const key in data) {
        const value = data[key];

        if (value instanceof File) {
            obj[key] = getFileMetadata(value);
        } else if (value instanceof FileList) {
            obj[key] = Array.from(value).map(getFileMetadata);
        } else if (
            Array.isArray(value) &&
            value.every((item) => item instanceof File)
        ) {
            obj[key] = value.map(getFileMetadata);
        } else if (value instanceof Date) {
            obj[key] = value.toISOString();
        } else {
            obj[key] = value;
        }
    }
    return obj;
}

function FormView({
    mode,
    form: { title, description, fields, onSubmit, isSubmitting, error },
}: {
    mode: "debug" | "production";
    form: Form;
}) {
    const [submittedData, setSubmittedData] = useState<null | object>(null);

    const fieldSchema = Object.fromEntries(
        fields
            .filter((f): f is FieldProps => f.elementType === "field")
            .map((field) => {
                switch (field.fieldType) {
                    case "text-field":
                        return [field.name, buildTextFieldSchema(field)];
                    case "number-field":
                        return [field.name, buildNumberFieldSchema(field)];
                    case "checkbox-field":
                        return [field.name, buildCheckboxFieldSchema(field)];
                    case "select-field":
                        return [field.name, buildSelectFieldSchema(field)];
                    case "date-field":
                        return [field.name, buildDateFieldSchema(field)];
                    case "file-input-field":
                        return [field.name, buildFileInputFieldSchema(field)];
                    case "time-field":
                        return [field.name, buildTimeFieldSchema(field)];
                    case "date-time-field":
                        return [field.name, buildDateTimeFieldSchema(field)];
                    case "radio-field":
                        return [field.name, buildRadioFieldSchema(field)];
                    case "text-area":
                        return [field.name, buildTextAreaSchema(field)];
                }
            }),
    );

    const fieldValues = Object.fromEntries(
        fields
            .filter((f): f is FieldProps => f.elementType === "field")
            .map((field) => {
                switch (field.fieldType) {
                    case "text-field":
                        return [field.name, getTextFieldDefaultValue(field)];
                    case "number-field":
                        return [field.name, getNumberFieldDefaultValue(field)];
                    case "checkbox-field":
                        return [
                            field.name,
                            getCheckboxFieldDefaultValue(field),
                        ];
                    case "select-field":
                        return [field.name, getSelectFieldDefaultValue(field)];
                    case "date-field":
                        return [field.name, getDateFieldDefaultValue(field)];
                    case "file-input-field":
                        return [
                            field.name,
                            getFileInputFieldDefaultValue(field),
                        ];
                    case "time-field":
                        return [field.name, getTimeFieldDefaultValue(field)];
                    case "date-time-field":
                        return [
                            field.name,
                            getDateTimeFieldDefaultValue(field),
                        ];
                    case "radio-field":
                        return [field.name, getRadioFieldDefaultValue(field)];
                    case "text-area":
                        return [field.name, getTextAreaDefaultValue(field)];
                }
            }),
    );

    const formSchema = z.object(fieldSchema);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: fieldValues,
        mode: "all",
    });

    function handleSubmit(values: z.infer<typeof formSchema>) {
        if (isSubmitting) return;

        if (mode === "debug") {
            setSubmittedData(serializeForDebug(values));
            console.log(values);
            return;
        }

        if (onSubmit) {
            onSubmit(values);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4">
            <FormProvider {...form}>
                <div className="mb-8 space-y-2 text-left">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-muted-foreground text-sm">
                            {description}
                        </p>
                    )}
                </div>
                <FieldSet>
                    <FieldGroup>
                        {fields.map((element, idx) => {
                            if (element.elementType === "field") {
                                switch (element.fieldType) {
                                    case "text-field":
                                        return (
                                            <TextField key={idx} {...element} />
                                        );
                                    case "text-area":
                                        return (
                                            <TextArea key={idx} {...element} />
                                        );
                                    case "number-field":
                                        return (
                                            <NumberField
                                                key={idx}
                                                {...element}
                                            />
                                        );
                                    case "checkbox-field":
                                        return (
                                            <CheckboxField
                                                key={idx}
                                                {...element}
                                            />
                                        );
                                    case "select-field":
                                        return (
                                            <SelectField
                                                key={idx}
                                                {...element}
                                            />
                                        );
                                    case "date-field":
                                        return (
                                            <DateField key={idx} {...element} />
                                        );
                                    case "file-input-field":
                                        return (
                                            <FileInputField
                                                key={idx}
                                                {...element}
                                            />
                                        );
                                    case "time-field":
                                        return (
                                            <TimeField key={idx} {...element} />
                                        );
                                    case "date-time-field":
                                        return (
                                            <DateTimeField
                                                key={idx}
                                                {...element}
                                            />
                                        );
                                    case "radio-field":
                                        return (
                                            <RadioField
                                                key={idx}
                                                {...element}
                                            />
                                        );
                                }
                            }

                            if (element.elementType === "view") {
                                switch (element.viewType) {
                                    case "heading":
                                        return (
                                            <HeadingView
                                                key={idx}
                                                {...element}
                                            />
                                        );
                                    case "paragraph":
                                        return (
                                            <ParagraphView
                                                key={idx}
                                                {...element}
                                            />
                                        );
                                    case "image":
                                        return (
                                            <ImageView key={idx} {...element} />
                                        );
                                }
                            }

                            return null;
                        })}
                    </FieldGroup>
                </FieldSet>

                {error && <Alert variant={"destructive"}>{error}</Alert>}

                <div className="w-full flex flex-col gap-2 mt-4 font-mono">
                    {mode === "debug" && submittedData && (
                        <div className="bg-muted p-4 rounded-lg border border-border overflow-x-auto">
                            <pre className="text-sm">
                                {JSON.stringify(submittedData, undefined, 2)}
                            </pre>
                        </div>
                    )}

                    {fields.find(
                        (f): f is FieldProps => f.elementType === "field",
                    ) && (
                        <div className="flex justify-end gap-2 mt-2">
                            {mode === "debug" && (
                                <Button
                                    type="reset"
                                    variant={"outline"}
                                    onClick={() => {
                                        form.reset(fieldValues);
                                        setSubmittedData(null);
                                        toast.info("Form reset success!");
                                    }}
                                >
                                    <RefreshCcw />
                                    Reset
                                </Button>
                            )}
                            <Button type="submit">
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Upload />
                                        Submit
                                    </span>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </FormProvider>
        </form>
    );
}

export default FormView;
