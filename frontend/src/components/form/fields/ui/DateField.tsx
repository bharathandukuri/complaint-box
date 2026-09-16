import { useState } from "react";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Controller, useForm, useFormContext } from "react-hook-form";
import {
    dateFieldSchema,
    type DateFieldProps,
    type FormElement,
} from "../../types";
import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextField } from "./TextField";
import { Separator } from "@/components/ui/separator";
import { CheckboxField } from "./CheckboxField";
import { generateId } from "../../types";
import { FormProvider } from "react-hook-form";
import { TextArea } from "./Textarea";

export function DateField(props: DateFieldProps) {
    const [open, setOpen] = useState(false);

    const { control } = useFormContext();

    return (
        <Controller
            name={props.name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    {props.label && (
                        <FieldLabel htmlFor={props.name}>
                            {props.label}
                        </FieldLabel>
                    )}
                    <Popover
                        open={open}
                        onOpenChange={(open) => {
                            setOpen(open);
                            if (!open) {
                                field.onBlur();
                            }
                        }}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant={
                                    fieldState.invalid
                                        ? "destructive"
                                        : "outline"
                                }
                                disabled={props.disabled}
                                aria-invalid={fieldState.invalid}
                                id={props.name}
                                className="w-48 justify-between font-normal"
                            >
                                {field.value
                                    ? field.value.toLocaleDateString()
                                    : (props.placeholder ?? "Select a date")}
                                <ChevronDownIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                        >
                            <Calendar
                                mode="single"
                                selected={field.value}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                    field.onChange(date);
                                    setOpen(false);
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    {props.description && (
                        <FieldDescription>{props.description}</FieldDescription>
                    )}
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}

export function DateFieldOptions({
    element,
    formElements,
    onSave,
    onCancel,
}: {
    element: DateFieldProps;
    formElements: FormElement[];
    onSave: (element: DateFieldProps) => void;
    onCancel: () => void;
}) {
    const optionsSchema = dateFieldSchema.superRefine((data, ctx) => {
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
        } as DateFieldProps);
    }

    return (
        <ScrollArea className="h-[80vh]">
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4 px-5 "
            >
                <FormProvider {...form}>
                    <FieldGroup>
                        <TextField
                            id={generateId()}
                            elementType="field"
                            fieldType="text-field"
                            name="name"
                            label="Field Name (ID)"
                            placeholder="e.g. user_role"
                            type="text"
                        />

                        <TextField
                            id={generateId()}
                            elementType="field"
                            fieldType="text-field"
                            name="label"
                            label="Label"
                            placeholder="e.g. Select Role"
                            type="text"
                        />

                        <TextField
                            id={generateId()}
                            elementType="field"
                            fieldType="text-field"
                            name="placeholder"
                            label="Placeholder"
                            placeholder="Select an option..."
                            type="text"
                        />
                        <TextArea
                            id={generateId()}
                            elementType="field"
                            fieldType="text-area"
                            name="description"
                            label="Description"
                            placeholder="Enter description"
                        />

                        <DateField
                            id={generateId()}
                            elementType="field"
                            fieldType="date-field"
                            name="defaultValue"
                            label="Default Value"
                            placeholder="Select a date"
                        />

                        <CheckboxField
                            id={generateId()}
                            elementType="field"
                            fieldType="checkbox-field"
                            name="required"
                            label="Required Field"
                        />

                        <Separator />
                        <FieldSet>
                            <FieldLegend>Before Date</FieldLegend>

                            <FieldGroup>
                                <DateField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="date-field"
                                    name="before.test"
                                    label="Test"
                                    placeholder="Enter the Test"
                                />
                                <TextField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="text-field"
                                    name="before.error"
                                    type="text"
                                    label="Error Message"
                                    placeholder="Enter the error message"
                                />
                            </FieldGroup>
                        </FieldSet>
                        <Separator />
                        <FieldSet>
                            <FieldLegend>After Date</FieldLegend>

                            <FieldGroup>
                                <DateField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="date-field"
                                    name="after.test"
                                    label="Test"
                                    placeholder="Enter the Test"
                                />
                                <TextField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="text-field"
                                    name="after.error"
                                    type="text"
                                    label="Error Message"
                                    placeholder="Enter the error message"
                                />
                            </FieldGroup>
                        </FieldSet>
                        <Separator />
                    </FieldGroup>
                </FormProvider>

                <div className="flex justify-end gap-4 pb-6">
                    <Button onClick={onCancel} variant="outline" type="button">
                        Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </ScrollArea>
    );
}
