import {
    generateId,
    textAreaSchema,
    type FormElement,
    type TextAreaProps,
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
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "./CheckboxField";
import { Separator } from "@/components/ui/separator";
import { NumberField } from "./NumberField";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "./TextField";

export function TextArea({
    name,
    label,
    description,
    disabled,
    placeholder,
}: TextAreaProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

                    <Textarea
                        {...field}
                        id={name}
                        disabled={disabled}
                        placeholder={placeholder}
                        className="min-h-25 resize-y"
                        aria-invalid={fieldState.invalid}
                    />

                    {description && (
                        <FieldDescription>{description}</FieldDescription>
                    )}
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}

export function TextAreaOptions({
    element,
    formElements,
    onSave,
    onCancel,
}: {
    element: TextAreaProps;
    formElements: FormElement[];
    onSave: (element: TextAreaProps) => void;
    onCancel: () => void;
}) {
    const optionsSchema = textAreaSchema.extend({}).superRefine((data, ctx) => {
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
        } as TextAreaProps);
    }

    return (
        <ScrollArea className="h-[80vh]">
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4 px-5"
            >
                <FormProvider {...form}>
                    <FieldGroup>
                        <TextField
                            id={""}
                            elementType="field"
                            fieldType="text-field"
                            name="name"
                            type="text"
                            label="Name"
                            placeholder="Enter the name of the field"
                        />

                        <TextField
                            id={generateId()}
                            elementType="field"
                            fieldType="text-field"
                            name="label"
                            type="text"
                            label="Label"
                            placeholder="Enter the label of the field"
                        />

                        <TextField
                            id={generateId()}
                            elementType="field"
                            fieldType="text-field"
                            name="placeholder"
                            type="text"
                            label="Placeholder"
                            placeholder="Enter the placeholder of the field"
                        />

                        <TextArea
                            id={generateId()}
                            elementType="field"
                            fieldType="text-area"
                            name="description"
                            label="Description"
                            placeholder="Enter the description of the field"
                        />

                        <TextArea
                            id={generateId()}
                            elementType="field"
                            fieldType="text-area"
                            name="defaultValue"
                            label="Default Value"
                            placeholder="Enter the default value of the field"
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
                            name="disabled"
                            label="Disabled"
                        />

                        <Separator />
                        <FieldSet>
                            <FieldLegend>Min Length</FieldLegend>

                            <FieldGroup>
                                <NumberField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="number-field"
                                    name="minLength.test"
                                    label="Test"
                                    placeholder="Enter the Test"
                                />
                                <TextField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="text-field"
                                    name="minLength.error"
                                    type="text"
                                    label="Error Message"
                                    placeholder="Enter the error message"
                                />
                            </FieldGroup>
                        </FieldSet>
                        <Separator />
                        <FieldSet>
                            <FieldLegend>Max Length</FieldLegend>

                            <FieldGroup>
                                <NumberField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="number-field"
                                    name="maxLength.test"
                                    label="Test"
                                    placeholder="Enter the Test"
                                />
                                <TextField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="text-field"
                                    name="maxLength.error"
                                    type="text"
                                    label="Error Message"
                                    placeholder="Enter the error message"
                                />
                            </FieldGroup>
                        </FieldSet>
                    </FieldGroup>
                </FormProvider>
                <div className="flex justify-end gap-4">
                    <Button onClick={onCancel} variant={"outline"}>
                        Cancel
                    </Button>
                    <Button>Save</Button>
                </div>
            </form>
        </ScrollArea>
    );
}
