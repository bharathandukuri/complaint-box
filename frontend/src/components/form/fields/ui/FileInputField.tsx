import { Controller, useFormContext } from "react-hook-form";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { Trash2, UploadCloud } from "lucide-react";
import { useRef } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import type { FileInputFieldProps } from "../../types";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    fileInputFieldSchema,
    generateId,
    type FormElement,
} from "../../types";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TextField } from "./TextField";
import { CheckboxField } from "./CheckboxField";
import { NumberField } from "./NumberField";
import { SelectField } from "./SelectField";
import type z from "zod";

export function FileInputField({
    name,
    accept,
    label,
    disabled,
    description,
    maxFiles,
    maxSize,
    multiple,
    placeholder,
}: FileInputFieldProps) {
    const { control } = useFormContext();
    const fileRef = useRef<HTMLInputElement>(null);

    const inputFileTypes = () => {
        switch (accept) {
            case "image":
                return "image/*";
            case "audio":
                return "audio/*";
            case "video":
                return "video/*";
            default:
                return "*";
        }
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, onBlur, value }, fieldState }) => {
                const currentFiles = (value as File[] | string[]) || [];

                const handleFileChange = (
                    e: React.ChangeEvent<HTMLInputElement>,
                ) => {
                    const selected = Array.from(e.target.files ?? []);
                    if (!selected.length) return;

                    const validFiles: File[] = [];
                    for (const file of selected) {
                        if (maxSize) {
                            const sizeMb = file.size / 1024 / 1024;
                            if (sizeMb > maxSize) {
                                toast.error(
                                    `${file.name} exceeds ${maxSize}MB limit`,
                                );
                                continue;
                            }
                        }
                        validFiles.push(file);
                    }

                    const totalCount = multiple
                        ? currentFiles.length + validFiles.length
                        : validFiles.length;
                    if (maxFiles && totalCount > maxFiles) {
                        toast.error(`Maximum ${maxFiles} files allowed`);
                        return;
                    }

                    const updated = multiple
                        ? [...currentFiles, ...validFiles]
                        : validFiles;
                    onChange(updated);
                };

                return (
                    <Field data-invalid={fieldState.invalid}>
                        {label && (
                            <FieldLabel htmlFor={name}>{label}</FieldLabel>
                        )}

                        <input
                            ref={fileRef}
                            type="file"
                            className="hidden"
                            accept={inputFileTypes()}
                            multiple={multiple}
                            onChange={handleFileChange}
                        />

                        <div
                            onBlur={onBlur}
                            tabIndex={0}
                            onClick={() =>
                                !disabled && fileRef.current?.click()
                            }
                            className={clsx(
                                "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-muted/30 px-6 py-10 text-center transition",
                                fieldState.invalid
                                    ? "border-destructive"
                                    : "border-muted-foreground/30 hover:border-primary",
                            )}
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <UploadCloud className="h-7 w-7" />
                            </div>
                            <p className="text-sm font-semibold">
                                {placeholder ?? "Upload your file"}
                            </p>
                        </div>

                        {currentFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {currentFiles.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-xl border bg-background px-4 py-2 text-sm"
                                    >
                                        <span className="truncate max-w-55">
                                            {typeof file === "string"
                                                ? file
                                                : file.name}
                                        </span>
                                        <Button
                                            variant={"destructive"}
                                            type="button"
                                            onClick={() => {
                                                const updated =
                                                    currentFiles.filter(
                                                        (_, i) => i !== idx,
                                                    );
                                                onChange(updated);
                                            }}
                                        >
                                            <Trash2 className="w-8 h-8" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {description && (
                            <FieldDescription>{description}</FieldDescription>
                        )}

                        {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                        )}
                    </Field>
                );
            }}
        />
    );
}

export function FileInputFieldOptions({
    element,
    formElements,
    onSave,
    onCancel,
}: {
    element: FileInputFieldProps;
    formElements: FormElement[];
    onSave: (element: FileInputFieldProps) => void;
    onCancel: () => void;
}) {
    const optionsSchema = fileInputFieldSchema.superRefine((data, ctx) => {
        if (
            formElements.find(
                (e) =>
                    e.elementType === "field" &&
                    e.name === data.name &&
                    e.id !== element.id,
            )
        ) {
            ctx.addIssue({
                code: "custom",
                message: "Field name already exists",
                path: ["name"],
            });
        }
    });

    const form = useForm<z.infer<typeof optionsSchema>>({
        mode: "onChange",
        defaultValues: element,
        resolver: zodResolver(optionsSchema),
    });

    function handleSubmit(values: z.infer<typeof optionsSchema>) {
        onSave({
            ...element,
            ...values,
        } as FileInputFieldProps);
    }

    return (
        <ScrollArea className="h-[80vh]">
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4 px-5 pb-10"
            >
                <FormProvider {...form}>
                    <FieldGroup>
                        <TextField
                            type="text"
                            id={generateId()}
                            elementType="field"
                            fieldType="text-field"
                            name="name"
                            label="Field ID"
                            placeholder="e.g., resume_upload"
                        />
                        <TextField
                            type="text"
                            id={generateId()}
                            elementType="field"
                            fieldType="text-field"
                            name="label"
                            label="Label"
                            placeholder="e.g., Upload your CV"
                        />

                        <Separator />

                        <SelectField
                            id={generateId()}
                            elementType="field"
                            fieldType="select-field"
                            name="accept"
                            label="Allowed File Types"
                            options={[
                                { label: "All Files", value: "all" },
                                {
                                    label: "Images (PNG, JPG, etc)",
                                    value: "image",
                                },
                                { label: "Videos", value: "video" },
                                { label: "Audio", value: "audio" },
                            ]}
                        />

                        <NumberField
                            id={generateId()}
                            elementType="field"
                            fieldType="number-field"
                            name="maxSize"
                            label="Max Size (MB)"
                            placeholder="e.g., 5"
                        />
                        <CheckboxField
                            id={generateId()}
                            elementType="field"
                            fieldType="checkbox-field"
                            name="required"
                            label="Required"
                        />

                        <CheckboxField
                            id={generateId()}
                            elementType="field"
                            fieldType="checkbox-field"
                            name="multiple"
                            label="Allow Multiple Files"
                        />
                        {form.watch("multiple") && (
                            <NumberField
                                id={generateId()}
                                elementType="field"
                                fieldType="number-field"
                                name="maxFiles"
                                label="Max File Count"
                                placeholder="e.g., 3"
                            />
                        )}

                        <Separator />

                        <TextField
                            type="text"
                            id={generateId()}
                            elementType="field"
                            fieldType="text-field"
                            name="placeholder"
                            label="Dropzone Text"
                            placeholder="Upload your file"
                        />
                    </FieldGroup>
                </FormProvider>

                <div className="flex justify-end gap-4 mt-6">
                    <Button
                        onClick={onCancel}
                        variant={"outline"}
                        type="button"
                    >
                        Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </ScrollArea>
    );
}
