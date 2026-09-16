import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CookiesProvider } from "react-cookie";
import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { ErrorProvider } from "./components/error-dialog.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
    <ThemeProvider defaultTheme="dark" key={"complaint-box-theme"}>
        <QueryClientProvider client={queryClient}>
            <CookiesProvider>
                <BrowserRouter>
                    <SidebarProvider>
                        <ErrorProvider>
                            <App />
                        </ErrorProvider>
                    </SidebarProvider>
                </BrowserRouter>
            </CookiesProvider>
        </QueryClientProvider>
    </ThemeProvider>
);
