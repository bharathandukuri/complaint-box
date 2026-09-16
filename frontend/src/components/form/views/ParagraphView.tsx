import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateId, paragraphSchema, type ParagraphProps } from "../types";
import { TextArea } from "../fields/ui/Textarea";
import { NumberField } from "../fields/ui/NumberField";
import { Button } from "@/components/ui/button";
import type z from "zod";

export function ParagraphView({ text, mt, mb }: ParagraphProps) {
    return (
        <p
            style={{
                marginTop: mt ? `${mt}px` : "",
                marginBottom: mb ? `${mb}px` : "",
                whiteSpace: "pre-wrap",
            }}
            className="text-muted-foreground leading-relaxed"
        >
            {text}
        </p>
    );
}

export function ParagraphOptions({
    element,
    onSave,
    onCancel,
}: {
    element: ParagraphProps;
    onSave: (el: ParagraphProps) => void;
    onCancel: () => void;
}) {
    type FormValues = z.infer<typeof paragraphSchema>;

    const form = useForm<FormValues>({
        defaultValues: element,
        //@ts-expect-error("ignored")
        resolver: zodResolver(paragraphSchema),
    });

    function onSubmit(data: FormValues) {
        onSave({
            ...element,
            ...data,
        } as ParagraphProps);
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
                    label="Paragraph Content"
                    placeholder="Enter your descriptive text here..."
                />

                <div className="grid grid-cols-2 gap-4">
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
