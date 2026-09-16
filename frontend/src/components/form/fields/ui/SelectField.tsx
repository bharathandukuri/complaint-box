import type { SelectFieldProps } from "../../types";
import { Controller, useFormContext } from "react-hook-form";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { selectFieldSchema, type FormElement, generateId } from "../../types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "./TextField";
import { CheckboxField } from "./CheckboxField";
import type z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TextArea } from "./Textarea";

export function SelectField({
    name,
    label,
    disabled,
    options,
    placeholder,
    description,
}: SelectFieldProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
                    <Select
                        disabled={disabled}
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                        onOpenChange={(o) => {
                            if (!o) {
                                field.onBlur();
                            }
                        }}
                    >
                        <SelectTrigger
                            data-invalid={fieldState.invalid}
                            aria-invalid={fieldState.invalid}
                        >
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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

export function SelectFieldOptions({
    element,
    formElements,
    onSave,
    onCancel,
}: {
    element: SelectFieldProps;
    formElements: FormElement[];
    onSave: (element: SelectFieldProps) => void;
    onCancel: () => void;
}) {
    const optionsSchema = selectFieldSchema.superRefine((data, ctx) => {
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
        fields: optionFields,
        append,
        remove,
    } = useFieldArray({
        control: form.control,
        name: "options",
    });

    function handleSubmit(values: z.infer<typeof optionsSchema>) {
        const validOptions = values.options.filter(
            (opt) => opt.label && opt.value,
        );

        onSave({
            ...element,
            ...values,
            options: validOptions,
        } as SelectFieldProps);
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

                        <CheckboxField
                            id={generateId()}
                            elementType="field"
                            fieldType="checkbox-field"
                            name="required"
                            label="Required Field"
                        />

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold">
                                    Dropdown Options
                                </h3>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] gap-1"
                                onClick={() =>
                                    append({
                                        label: "",
                                        value: "value" + optionFields.length,
                                    })
                                }
                            >
                                <Plus className="w-3 h-3" />
                                Add Option
                            </Button>
                        </div>

                        <div className="space-y-3 mt-2">
                            {optionFields.length === 0 && (
                                <Alert
                                    className="text-[10px] text-muted-foreground italic text-center py-4 border border-dashed rounded border-destructive"
                                    variant={"destructive"}
                                >
                                    <AlertDescription>
                                        Add at least one option for the
                                        dropdown.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {optionFields.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="flex gap-2 items-start bg-muted/20 p-2 rounded-md border relative"
                                >
                                    <div className="grid grid-cols-2 gap-2 flex-1 pt-4">
                                        <TextField
                                            id={generateId()}
                                            elementType="field"
                                            fieldType="text-field"
                                            name={`options.${index}.label`}
                                            label="Display Label"
                                            placeholder="Option text"
                                            type="text"
                                        />
                                        <TextField
                                            id={generateId()}
                                            elementType="field"
                                            fieldType="text-field"
                                            name={`options.${index}.value`}
                                            label="Stored Value"
                                            placeholder="value"
                                            type="text"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive absolute right-1 top-1"
                                        onClick={() => remove(index)}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Separator />

                        <SelectField
                            id={generateId()}
                            elementType="field"
                            fieldType="select-field"
                            name="defaultValue"
                            label="Default value"
                            placeholder="Select option"
                            options={optionFields}
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
