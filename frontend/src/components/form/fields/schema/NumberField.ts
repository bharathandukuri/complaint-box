import z from "zod";
import type { NumberFieldProps } from "../../types";

export function buildNumberFieldSchema(props: NumberFieldProps) {
    let numberSchema = z.number({
        error: props.required ? "This field is required" : "Invalid number",
    });

    if (props.gt?.test !== undefined && props.gt?.test !== null) {
        numberSchema = numberSchema.gt(props.gt.test, {
            message: props.gt.error,
        });
    }
    if (props.gte?.test !== undefined && props.gte?.test !== null) {
        numberSchema = numberSchema.gte(props.gte.test, {
            message: props.gte.error,
        });
    }
    if (props.lt?.test !== undefined && props.lt?.test !== null) {
        numberSchema = numberSchema.lt(props.lt.test, {
            message: props.lt.error,
        });
    }
    if (props.lte?.test !== undefined && props.lte?.test !== null) {
        numberSchema = numberSchema.lte(props.lte.test, {
            message: props.lte.error,
        });
    }

    const schema = z.preprocess(
        (val) => (val === "" || val === undefined ? undefined : Number(val)),
        props.required ? numberSchema : numberSchema.optional(),
    );

    return schema;
}

export function getNumberFieldDefaultValue(props: NumberFieldProps) {
    return props.defaultValue ?? undefined;
}
