import {
    generateId,
    numberFieldSchema,
    type FormElement,
    type NumberFieldProps,
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
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { FieldIcon } from "../../FieldIcon";
import { InputGroupNumberInput } from "@/components/ui/number-input";
import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextField } from "./TextField";
import { TextArea } from "./Textarea";
import { CheckboxField } from "./CheckboxField";
import { Separator } from "@/components/ui/separator";

export function NumberField({
    name,
    label,
    description,
    disabled,
    placeholder,
    icon,
}: NumberFieldProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

                    <InputGroup>
                        {icon && (
                            <InputGroupAddon>
                                <FieldIcon name={icon} />
                            </InputGroupAddon>
                        )}
                        <InputGroupNumberInput
                            {...field}
                            id={name}
                            disabled={disabled}
                            placeholder={placeholder}
                            aria-invalid={fieldState.invalid}
                        />
                    </InputGroup>
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

export function NumberFieldOptions({
    element,
    formElements,
    onSave,
    onCancel,
}: {
    element: NumberFieldProps;
    formElements: FormElement[];
    onSave: (element: NumberFieldProps) => void;
    onCancel: () => void;
}) {
    const optionsSchema = numberFieldSchema
        .extend({})
        .superRefine((data, ctx) => {
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
        } as NumberFieldProps);
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

                        <NumberField
                            id={generateId()}
                            elementType="field"
                            fieldType="number-field"
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
                            <FieldLegend>Less Than</FieldLegend>

                            <FieldGroup>
                                <NumberField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="number-field"
                                    name="lt.test"
                                    label="Test"
                                    placeholder="Enter the Test"
                                />
                                <TextField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="text-field"
                                    name="lt.error"
                                    type="text"
                                    label="Error Message"
                                    placeholder="Enter the error message"
                                />
                            </FieldGroup>
                        </FieldSet>
                        <Separator />
                        <FieldSet>
                            <FieldLegend>Less Than Equals</FieldLegend>

                            <FieldGroup>
                                <NumberField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="number-field"
                                    name="lte.test"
                                    label="Test"
                                    placeholder="Enter the Test"
                                />
                                <TextField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="text-field"
                                    name="lte.error"
                                    type="text"
                                    label="Error Message"
                                    placeholder="Enter the error message"
                                />
                            </FieldGroup>
                        </FieldSet>
                        <Separator />
                        <FieldSet>
                            <FieldLegend>Greater Than</FieldLegend>

                            <FieldGroup>
                                <NumberField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="number-field"
                                    name="gt.test"
                                    label="Test"
                                    placeholder="Enter the Test"
                                />
                                <TextField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="text-field"
                                    name="gt.error"
                                    type="text"
                                    label="Error Message"
                                    placeholder="Enter the error message"
                                />
                            </FieldGroup>
                        </FieldSet>
                        <Separator />
                        <FieldSet>
                            <FieldLegend>Greater Than Equals</FieldLegend>

                            <FieldGroup>
                                <NumberField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="number-field"
                                    name="gte.test"
                                    label="Test"
                                    placeholder="Enter the Test"
                                />
                                <TextField
                                    id={generateId()}
                                    elementType="field"
                                    fieldType="text-field"
                                    name="gte.error"
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
