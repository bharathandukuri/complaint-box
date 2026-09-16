import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff, Loader2, LockKeyhole, LogIn, User2 } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";

import { useIsMobile } from "@/hooks/use-mobile";
import type { JwtPayload } from "@/types/jwt-payload";
import { useLogin } from "@/api/login";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { setJWT } from "@/store/jwt";

const loginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const isMobile = useIsMobile();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: "", password: "" },
        mode: "onSubmit",
    });

    const {
        mutate: login,
        isPending: isLoggingIn,
        error: loginError,
    } = useLogin();

    async function onSubmit(values: LoginFormData) {
        login(values, {
            onSuccess: (r) => {
                if (!r.data?.token) throw new Error("Missing JWT Token");
                const token = r.data.token;
                const decoded = jwtDecode<JwtPayload>(token);
                const expiry = decoded.exp
                    ? new Date(decoded.exp * 1000)
                    : new Date(Date.now() + 86400000);

                setJWT(token, expiry);
            },
        });
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-background to-muted flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-5 gap-0 rounded-2xl overflow-hidden shadow-xl bg-card">
                {!isMobile && (
                    <div className="relative hidden md:block md:col-span-3">
                        <img
                            src="/college.png"
                            alt="College"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 backdrop-blur-[1px] text-card-foreground flex flex-col items-center justify-center p-6 text-center">
                            <div className="bg-[#fefefe] rounded-md p-2 shadow-md mb-5">
                                <img
                                    src="/rce-banner.png"
                                    alt="RCE Logo"
                                    className="h-16 object-contain"
                                />
                            </div>
                            <h2 className="text-3xl font-bold mb-2 text-muted dark:text-card-foreground">
                                Complaint Box
                            </h2>
                            <p className="text-sm max-w-sm text-muted/60 dark:text-muted-foreground/90">
                                A centralized platform for students to raise
                                concerns securely and efficiently.
                            </p>
                        </div>
                    </div>
                )}

                <div className="md:col-span-2 flex items-center justify-center p-4 sm:p-8">
                    <Card className="w-full sm:max-w-md border-0 shadow-none">
                        <CardHeader className="space-y-1 text-center">
                            {isMobile && (
                                <div className="bg-[#fefefe] rounded-md p-2 shadow-md mb-5 mx-auto w-fit">
                                    <img
                                        src="/rce-banner.png"
                                        alt="RCE Logo"
                                        className="h-16 object-contain"
                                    />
                                </div>
                            )}
                            <CardTitle className="text-3xl font-bold text-foreground ">
                                Login
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Login and manage your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loginError && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertDescription>
                                        {loginError?.response?.data.message ??
                                            loginError?.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-5"
                                >
                                    <FieldGroup>
                                        <Controller
                                            control={form.control}
                                            name="username"
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="username">
                                                        Username
                                                    </FieldLabel>
                                                    <InputGroup>
                                                        <InputGroupAddon>
                                                            <User2 className="w-8 h-8" />
                                                        </InputGroupAddon>
                                                        <InputGroupInput
                                                            {...field}
                                                            id="username"
                                                            placeholder="Enter your username"
                                                            autoComplete="username"
                                                        />
                                                    </InputGroup>
                                                    {fieldState.error && (
                                                        <FieldError>
                                                            {
                                                                fieldState.error
                                                                    .message
                                                            }
                                                        </FieldError>
                                                    )}
                                                </Field>
                                            )}
                                        />

                                        <Controller
                                            control={form.control}
                                            name="password"
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="password">
                                                        Password
                                                    </FieldLabel>
                                                    <InputGroup>
                                                        <InputGroupAddon>
                                                            <LockKeyhole className="w-8 h-8" />
                                                        </InputGroupAddon>
                                                        <InputGroupInput
                                                            {...field}
                                                            id="password"
                                                            type={
                                                                showPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            placeholder="••••••••"
                                                            autoComplete="current-password"
                                                            className="pr-10"
                                                        />
                                                        <InputGroupButton
                                                            onClick={() =>
                                                                setShowPassword(
                                                                    !showPassword
                                                                )
                                                            }
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff />
                                                            ) : (
                                                                <Eye />
                                                            )}
                                                        </InputGroupButton>
                                                    </InputGroup>
                                                    {fieldState.error && (
                                                        <FieldError>
                                                            {
                                                                fieldState.error
                                                                    .message
                                                            }
                                                        </FieldError>
                                                    )}
                                                </Field>
                                            )}
                                        />
                                    </FieldGroup>

                                    <div className="text-right -mt-2">
                                        <button
                                            type="button"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Forgot your password?
                                        </button>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoggingIn}
                                        className="w-full gap-2"
                                    >
                                        {isLoggingIn ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Logging in...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="h-5 w-5" />
                                                Login
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
