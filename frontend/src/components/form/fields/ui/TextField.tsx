import {
    generateId,
    textFieldSchema,
    type FormElement,
    type TextFieldProps,
} from "../../types";
import {
    Controller,
    FormProvider,
    useFieldArray,
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
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { FieldIcon } from "../../FieldIcon";
import { useState } from "react";
import { Eye, EyeClosed, Plus, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import { Button } from "@/components/ui/button";
import { TextArea } from "./Textarea";
import { CheckboxField } from "./CheckboxField";
import { Separator } from "@/components/ui/separator";
import { NumberField } from "./NumberField";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectField } from "./SelectField";

export function TextField({
    name,
    label,
    description,
    type,
    disabled,
    placeholder,
    icon,
}: TextFieldProps) {
    const { control } = useFormContext();
    const [showPassword, setShowPassword] = useState(false);

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
                        <InputGroupInput
                            {...field}
                            id={name}
                            type={showPassword ? "text" : type}
                            disabled={disabled}
                            placeholder={placeholder}
                            aria-invalid={fieldState.invalid}
                        />

                        {type === "password" && (
                            <InputGroupButton
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeClosed className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </InputGroupButton>
                        )}
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

export function TextFieldOptions({
    element,
    formElements,
    onSave,
    onCancel,
}: {
    element: TextFieldProps;
    formElements: FormElement[];
    onSave: (element: TextFieldProps) => void;
    onCancel: () => void;
}) {
    const optionsSchema = textFieldSchema
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

    const {
        fields: regexFields,
        append,
        remove,
    } = useFieldArray({
        control: form.control,
        name: "regexes" as never,
    });
    function handleSubmit(values: z.infer<typeof optionsSchema>) {
        const cleanedRegexes = values.regexes
            ?.filter((r) => r.test && r.error)
            .map((r) => {
                if (typeof r.test === "string") {
                    try {
                        return { ...r, test: new RegExp(r.test) };
                    } catch {
                        return { ...r, test: /.*/ };
                    }
                }
                return r;
            });

        onSave({
            ...element,
            ...values,
            regexes: cleanedRegexes,
        } as TextFieldProps);

        console.log({
            ...element,
            ...values,
            regexes: cleanedRegexes,
        });
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

                        <TextField
                            id={generateId()}
                            elementType="field"
                            fieldType="text-field"
                            name="defaultValue"
                            label="Default Value"
                            placeholder="Enter the default value of the field"
                            type="text"
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

                        <SelectField
                            id={generateId()}
                            elementType="field"
                            fieldType="select-field"
                            name="type"
                            label="Input Type"
                            options={[
                                { value: "text", label: "Text" },
                                { value: "password", label: "Password" },
                                { value: "email", label: "Email" },
                            ]}
                            defaultValue="text"
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
                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold">
                                    Regex Patterns
                                </h3>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] gap-1"
                                onClick={() =>
                                    append({
                                        test: "",
                                        error: "Invalid format",
                                    })
                                }
                            >
                                <Plus className="w-3 h-3" />
                                Add Rule
                            </Button>
                        </div>

                        <div className="space-y-4 mt-2">
                            {regexFields.length === 0 && (
                                <p className="text-[10px] text-muted-foreground italic text-center py-2 border border-dashed rounded">
                                    No custom regex rules added.
                                </p>
                            )}

                            {regexFields.map((item, index) => (
                                <FieldSet
                                    key={item.id}
                                    className="relative border p-3 pt-6 rounded-md bg-muted/30"
                                >
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => remove(index)}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>

                                    <FieldGroup>
                                        <TextField
                                            type="text"
                                            id={generateId()}
                                            elementType="field"
                                            fieldType="text-field"
                                            name={`regexes.${index}.test`}
                                            label="Pattern"
                                            placeholder="e.g. ^[0-9]+$"
                                        />
                                        <TextField
                                            type="text"
                                            id={generateId()}
                                            elementType="field"
                                            fieldType="text-field"
                                            name={`regexes.${index}.error`}
                                            label="Error Message"
                                            placeholder="Must be numeric"
                                        />
                                    </FieldGroup>
                                </FieldSet>
                            ))}
                        </div>

                        <Separator />
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
