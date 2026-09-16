import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateId, imageSchema, type ImageProps } from "../types";
import { TextField } from "../fields/ui/TextField";
import { NumberField } from "../fields/ui/NumberField";
import { SelectField } from "../fields/ui/SelectField";
import { Button } from "@/components/ui/button";
import type z from "zod";

export function ImageView({
    src,
    alt,
    width,
    height,
    fit = "cover",
    rounded = 0,
    align = "left",
    mt,
    mb,
}: ImageProps) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent:
                    align === "center"
                        ? "center"
                        : align === "right"
                          ? "flex-end"
                          : "flex-start",
                width: "100%",
                marginTop: mt ? `${mt}px` : "",
                marginBottom: mb ? `${mb}px` : "",
            }}
        >
            <div
                style={{
                    borderRadius: rounded ? `${rounded}px` : 0,
                    width: width ? `${width}px` : "100%",
                    height: height ? `${height}px` : "auto",
                    overflow: "hidden",
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    style={{
                        objectFit: fit,
                        width: "100%",
                        height: "100%",
                    }}
                />
            </div>
        </div>
    );
}

export function ImageOptions({
    element,
    onSave,
    onCancel,
}: {
    element: ImageProps;
    onSave: (el: ImageProps) => void;
    onCancel: () => void;
}) {
    type FormValues = z.infer<typeof imageSchema>;

    const form = useForm<FormValues>({
        defaultValues: element,
        //@ts-expect-error("ignored")
        resolver: zodResolver(imageSchema),
    });

    return (
        //@ts-expect-error("ignored")
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 p-4">
            <FormProvider {...form}>
                <TextField
                    id={generateId()}
                    elementType="field"
                    fieldType="text-field"
                    name="src"
                    label="Image URL"
                    placeholder="https://example.com/image.jpg"
                    type="text"
                />
                <TextField
                    id={generateId()}
                    elementType="field"
                    fieldType="text-field"
                    name="alt"
                    label="Alt Text (Accessibility)"
                    placeholder="Describe the image"
                    type="text"
                />

                <div className="grid grid-cols-2 gap-4">
                    <NumberField
                        id={generateId()}
                        elementType="field"
                        fieldType="number-field"
                        name="width"
                        label="Width (px)"
                        placeholder="Auto"
                    />
                    <NumberField
                        id={generateId()}
                        elementType="field"
                        fieldType="number-field"
                        name="height"
                        label="Height (px)"
                        placeholder="Auto"
                    />
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <SelectField
                        id={generateId()}
                        elementType="field"
                        fieldType="select-field"
                        name="fit"
                        label="Object Fit"
                        options={[
                            { label: "Cover", value: "cover" },
                            { label: "Contain", value: "contain" },
                        ]}
                    />
                    <SelectField
                        id={generateId()}
                        elementType="field"
                        fieldType="select-field"
                        name="align"
                        label="Align"
                        options={[
                            { label: "Left", value: "left" },
                            { label: "Center", value: "center" },
                            { label: "Right", value: "right" },
                        ]}
                    />
                    <NumberField
                        id={generateId()}
                        elementType="field"
                        fieldType="number-field"
                        name="rounded"
                        label="Radius"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <NumberField
                        id={generateId()}
                        elementType="field"
                        fieldType="number-field"
                        name="mt"
                        label="Margin Top"
                    />
                    <NumberField
                        id={generateId()}
                        elementType="field"
                        fieldType="number-field"
                        name="mb"
                        label="Margin Bottom"
                    />
                </div>
            </FormProvider>

            <div className="flex justify-end gap-2 pt-4">
                <Button onClick={onCancel} variant="outline" type="button">
                    Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
}
