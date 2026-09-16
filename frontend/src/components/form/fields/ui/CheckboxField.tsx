import {
    checkboxFieldSchema,
    generateId,
    type CheckboxFieldProps,
    type FormElement,
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
import { Checkbox } from "@/components/ui/checkbox";
import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextField } from "./TextField";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TextArea } from "./Textarea";

export function CheckboxField({
    name,
    label,
    disabled,
    description,
}: CheckboxFieldProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <div className="flex flex-row items-center gap-2">
                        <Checkbox
                            id={name}
                            checked={field.value}
                            disabled={disabled}
                            aria-invalid={fieldState.invalid}
                            onCheckedChange={(checked) =>
                                field.onChange(checked === true)
                            }
                        />

                        {label && (
                            <FieldLabel htmlFor={name}>{label}</FieldLabel>
                        )}
                    </div>
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

export function CheckboxFieldOptions({
    element,
    formElements,
    onSave,
    onCancel,
}: {
    element: CheckboxFieldProps;
    formElements: FormElement[];
    onSave: (element: CheckboxFieldProps) => void;
    onCancel: () => void;
}) {
    const optionsSchema = checkboxFieldSchema.superRefine((data, ctx) => {
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
        } as CheckboxFieldProps);
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

                        <TextArea
                            id={generateId()}
                            elementType="field"
                            fieldType="text-area"
                            name="description"
                            label="Description"
                            placeholder="Enter description"
                        />

                        <CheckboxField
                            id={generateId()}
                            elementType="field"
                            fieldType="checkbox-field"
                            name="required"
                            label="Required Field"
                        />

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
