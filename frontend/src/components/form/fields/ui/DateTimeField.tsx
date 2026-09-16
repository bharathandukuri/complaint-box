import { useState } from "react";
import {
    Controller,
    FormProvider,
    useForm,
    useFormContext,
} from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import {
    dateTimeFieldSchema,
    generateId,
    type DateTimeFieldProps,
    type FormElement,
} from "../../types";
import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextField } from "./TextField";
import { TextArea } from "./Textarea";
import { DateField } from "./DateField";
import { CheckboxField } from "./CheckboxField";
import { Separator } from "@/components/ui/separator";

function pad(n?: number) {
    return String(n ?? 0).padStart(2, "0");
}

function dateToTimeString(date?: Date, seconds?: boolean) {
    if (!date) return "";

    const h = pad(date.getHours());
    const m = pad(date.getMinutes());
    const s = pad(date.getSeconds());

    return seconds ? `${h}:${m}:${s}` : `${h}:${m}`;
}

function mergeDateAndTime(date: Date, value: string) {
    const [h, m, s] = value.split(":").map(Number);

    const d = new Date(date);
    d.setHours(h ?? 0);
    d.setMinutes(m ?? 0);
    d.setSeconds(s ?? 0);
    d.setMilliseconds(0);

    return d;
}

export function DateTimeField(props: DateTimeFieldProps) {
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

                    <div className="flex gap-2">
                        <Popover
                            open={open}
                            onOpenChange={(o) => {
                                setOpen(o);
                                if (!o) field.onBlur();
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
                                    className="w-44 justify-between font-normal"
                                >
                                    {field.value
                                        ? field.value.toLocaleDateString()
                                        : (props.placeholder ?? "Select date")}
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
                                        if (!date) return;

                                        const base = field.value ?? new Date();

                                        const merged = new Date(date);
                                        merged.setHours(base.getHours());
                                        merged.setMinutes(base.getMinutes());
                                        merged.setSeconds(base.getSeconds());

                                        field.onChange(merged);
                                        setOpen(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>

                        <Input
                            aria-invalid={fieldState.invalid}
                            id={props.name}
                            type="time"
                            step={props.secondsInput ? 1 : 60}
                            disabled={props.disabled}
                            className="w-32 bg-background appearance-none 
                              [&::-webkit-calendar-picker-indicator]:hidden 
                              [&::-webkit-calendar-picker-indicator]:appearance-none"
                            value={dateToTimeString(
                                field.value,
                                props.secondsInput,
                            )}
                            onBlur={field.onBlur}
                            onChange={(e) => {
                                const baseDate = field.value ?? new Date();
                                const merged = mergeDateAndTime(
                                    baseDate,
                                    e.target.value,
                                );
                                field.onChange(merged);
                            }}
                        />
                    </div>

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

export function DateTimeFieldOptions({
    element,
    formElements,
    onSave,
    onCancel,
}: {
    element: DateTimeFieldProps;
    formElements: FormElement[];
    onSave: (element: DateTimeFieldProps) => void;
    onCancel: () => void;
}) {
    const optionsSchema = dateTimeFieldSchema.superRefine((data, ctx) => {
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
        } as DateTimeFieldProps);
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

                        <DateTimeField
                            id={generateId()}
                            elementType="field"
                            fieldType="date-time-field"
                            name="defaultValue"
                            label="Default Value"
                            placeholder="Select a date"
                            secondsInput={form.watch("secondsInput")}
                        />

                        <CheckboxField
                            id={generateId()}
                            elementType="field"
                            fieldType="checkbox-field"
                            name="required"
                            label="Required Field"
                        />
                        <CheckboxField
                            id={generateId()}
                            elementType="field"
                            fieldType="checkbox-field"
                            name="secondsInput"
                            label="Seconds Input"
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
