import type { JSX } from "react";
import { generateId, headingSchema, type HeadingProps } from "../types";
import clsx from "clsx";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextArea } from "../fields/ui/Textarea";
import { SelectField } from "../fields/ui/SelectField";
import { NumberField } from "../fields/ui/NumberField";
import { Button } from "@/components/ui/button";
import type z from "zod";

export function HeadingView({
    level,
    text,
    align = "left",
    mt,
    mb,
}: HeadingProps) {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    const sizeClass = clsx(
        {
            1: "text-4xl font-bold",
            2: "text-3xl font-semibold",
            3: "text-2xl font-semibold",
            4: "text-xl font-medium",
            5: "text-lg font-medium",
            6: "text-base font-medium",
        }[level],
    );

    const alignClass =
        align === "center"
            ? "text-center"
            : align === "right"
              ? "text-right"
              : "text-left";

    return (
        <Tag
            className={`${sizeClass} ${alignClass}`}
            style={{
                marginTop: mt ? `${mt}px` : "",
                marginBottom: mb ? `${mb}px` : "",
            }}
        >
            {text}
        </Tag>
    );
}
export function HeadingOptions({
    element,
    onSave,
    onCancel,
}: {
    element: HeadingProps;
    onSave: (el: HeadingProps) => void;
    onCancel: () => void;
}) {
    type FormValues = z.infer<typeof headingSchema>;

    const form = useForm<FormValues>({
        defaultValues: {
            ...element,

            //@ts-expect-error("ignored")
            level: (element.level as unknown as number) + "",
        },
        //@ts-expect-error("ignored")
        resolver: zodResolver(headingSchema),
    });

    function onSubmit(data: FormValues) {
        onSave({
            ...element,
            ...data,
        } as HeadingProps);
    }

    return (
        //@ts-expect-error("ignored")
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
            <FormProvider {...form}>
                <TextArea
                    id={generateId()}
                    elementType="field"
                    fieldType="text-area"
                    name="text"
                    label="Heading Text"
                />
                <SelectField
                    elementType="field"
                    fieldType="select-field"
                    id={generateId()}
                    name="level"
                    label="Level"
                    options={[
                        { label: "Heading 1", value: "1" },
                        { label: "Heading 2", value: "2" },
                        { label: "Heading 3", value: "3" },
                        { label: "Heading 4", value: "4" },
                        { label: "Heading 5", value: "5" },
                        { label: "Heading 6", value: "6" },
                    ]}
                />
                <SelectField
                    elementType="field"
                    fieldType="select-field"
                    id={generateId()}
                    name="align"
                    label="Alignment"
                    options={[
                        { label: "Left", value: "left" },
                        { label: "Center", value: "center" },
                        { label: "Right", value: "right" },
                    ]}
                />
                <NumberField
                    elementType="field"
                    fieldType="number-field"
                    id={generateId()}
                    name="mt"
                    label="Margin Top (px)"
                />
                <NumberField
                    elementType="field"
                    fieldType="number-field"
                    id={generateId()}
                    name="mb"
                    label="Margin Bottom (px)"
                />
            </FormProvider>
            <div className="flex justify-end gap-2">
                <Button onClick={onCancel} variant="outline" type="button">
                    Cancel
                </Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
}
