import {
    generateId,
    timeFieldSchema,
    type FormElement,
    type Time,
    type TimeFieldProps,
} from "../../types";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextField } from "./TextField";
import { Separator } from "@/components/ui/separator";
import { CheckboxField } from "./CheckboxField";
import { TextArea } from "./Textarea";
import { Button } from "@/components/ui/button";

function pad(n?: number) {
    return String(n ?? "").padStart(2, "0");
}

function timeToString(time?: Time, seconds?: boolean) {
    if (!time) return "";
    let h = time.hours ?? 0;

    if (time.meridian === "pm" && h < 12) h += 12;
    if (time.meridian === "am" && h === 12) h = 0;

    const base = `${pad(h)}:${pad(time.minutes)}`;
    return seconds ? `${base}:${pad(time.seconds)}` : base;
}

function stringToTime(
    value: string,
    secondsInput?: boolean,
    currentMeridian?: Time["meridian"],
): Time | undefined {
    if (!value) return undefined;
    const [h, m, s] = value.split(":").map(Number);

    const hours12 = h % 12 || 12;
    const mer = currentMeridian ?? (h >= 12 ? "pm" : "am");

    return {
        hours: hours12,
        minutes: m,
        seconds: secondsInput ? (s ?? 0) : undefined,
        meridian: mer,
    };
}
export function TimeField(props: TimeFieldProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={props.name}
            control={control}
            render={({ field, fieldState }) => {
                return (
                    <Field data-invalid={fieldState.invalid}>
                        {props.label && (
                            <FieldLabel htmlFor={props.name}>
                                {props.label}
                            </FieldLabel>
                        )}

                        <Input
                            id={props.name}
                            type="time"
                            step={props.secondsInput ? 1 : 60}
                            disabled={props.disabled}
                            placeholder={props.placeholder}
                            aria-invalid={fieldState.invalid}
                            className="bg-background appearance-none 
                          [&::-webkit-calendar-picker-indicator]:hidden 
                          [&::-webkit-calendar-picker-indicator]:appearance-none"
                            value={timeToString(
                                field.value,
                                props.secondsInput,
                            )}
                            onBlur={field.onBlur}
                            onChange={(e) => {
                                const t = stringToTime(
                                    e.target.value,
                                    props.secondsInput,
                                    props.meridian,
                                );
                                field.onChange(t);
                            }}
                        />

                        {props.description && (
                            <FieldDescription>
                                {props.description}
                            </FieldDescription>
                        )}

                        {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                        )}
                    </Field>
                );
            }}
        />
    );
}

export function TimeFieldOptions({
    element,
    formElements,
    onSave,
    onCancel,
}: {
    element: TimeFieldProps;
    formElements: FormElement[];
    onSave: (element: TimeFieldProps) => void;
    onCancel: () => void;
}) {
    const optionsSchema = timeFieldSchema.superRefine((data, ctx) => {
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
        } as TimeFieldProps);
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
                            placeholder="e.g., start_time"
                        />

                        <TextField
                            id={generateId()}
                            elementType="field"
                            fieldType="text-field"
                            name="label"
                            label="Label"
                            placeholder="e.g., Select Time"
                            type="text"
                        />

                        <Separator />

                        <CheckboxField
                            id={generateId()}
                            elementType="field"
                            fieldType="checkbox-field"
                            name="secondsInput"
                            label="Enable Seconds"
                        />
                        <CheckboxField
                            id={generateId()}
                            elementType="field"
                            fieldType="checkbox-field"
                            name="required"
                            label="Required Field"
                        />

                        <Separator />

                        <TextField
                            type="text"
                            id={generateId()}
                            elementType="field"
                            fieldType="text-field"
                            name="placeholder"
                            label="Placeholder text"
                        />
                        <TextArea
                            id={generateId()}
                            elementType="field"
                            fieldType="text-area"
                            name="description"
                            label=" Description"
                        />
                        <TimeField
                            id={generateId()}
                            elementType="field"
                            fieldType="time-field"
                            name="defaultValue"
                            label="Default Value"
                            secondsInput={form.watch("secondsInput")}
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
