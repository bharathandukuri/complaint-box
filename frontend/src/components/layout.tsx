import React, { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { PanelLeft, Sun, Moon, Loader2, LogOut, UserIcon } from "lucide-react";

import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCookies } from "react-cookie";
import { CookieTypes } from "@/config/cookie_config";
import { useTheme } from "./theme-provider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {useGetUserData} from "@/api/user.ts";

interface UserData {
    name: string;
    email: string;
    profilePic?: string;
}

export function ProfileMenu({
    user,
    isLoading,
}: {
    user?: UserData;
    isLoading: boolean;
}) {
    const [, , removeCookie] = useCookies(CookieTypes);

    const handleLogout = () => {
        removeCookie("token", { path: "/" });
        window.location.reload();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    {user?.profilePic ? (
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={user.profilePic}
                                alt={user.name}
                            />
                            <AvatarFallback>
                                {user.name ? (
                                    user.name.charAt(0)
                                ) : (
                                    <UserIcon className="h-4 w-4" />
                                )}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <UserIcon className="h-5 w-5" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-72 p-2">
                {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : user ? (
                    <>
                        <DropdownMenuLabel className="flex items-center gap-3 p-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage
                                    src={user.profilePic}
                                    alt={user.name}
                                />
                                <AvatarFallback className="text-lg font-semibold">
                                    {user.name ? user.name.charAt(0) : "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-semibold text-base">
                                    {user.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {user.email}
                                </span>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </DropdownMenuItem>
                    </>
                ) : (
                    <DropdownMenuItem disabled>No user data</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function ThemeSwitch() {
    const { setTheme, theme } = useTheme();
    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:block" />
        </Button>
    );
}

export interface SidebarLink {
    name: string;
    icon: React.ReactNode;
    path: string;
    element: React.ReactNode;
}

export function SidebarLinks({ links }: { links: SidebarLink[] }) {
    const location = useLocation();
    const currentPath = location.pathname.endsWith("/")
        ? location.pathname.slice(0, -1)
        : location.pathname;

    return (
        <div className="flex flex-col px-3 pt-2 pb-6 grow overflow-auto scrollbar">
            <nav className="flex flex-col gap-1">
                {links.map((link) => {
                    const normalizedPath = link.path.endsWith("/")
                        ? link.path.slice(0, -1)
                        : link.path;

                    const active = currentPath === normalizedPath;

                    return (
                        <Link
                            key={normalizedPath}
                            to={normalizedPath}
                            aria-current={active ? "page" : undefined}
                            className={`relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium
                                ${
                                    active
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-primary"
                                }`}
                        >
                            <span
                                aria-hidden
                                className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-primary transition-opacity
                                    ${
                                        active
                                            ? "opacity-100"
                                            : "opacity-0 hover:opacity-60"
                                    }`}
                            />

                            <span
                                className={`flex items-center justify-center w-5 h-5 transition-colors
                                    ${
                                        active
                                            ? "text-primary"
                                            : "text-muted-foreground"
                                    }`}
                                aria-hidden
                            >
                                {link.icon}
                            </span>

                            <span
                                className={`${
                                    active
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {link.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export interface LayoutProps {
    name: string;
    rootPath: string;
    links: SidebarLink[];
    children?: ReactNode;
    footer?: ReactNode;
}

export default function Layout({
    name,
    rootPath,
    links,
    children,
    footer,
}: LayoutProps) {

    const { data, isLoading } = useGetUserData();
    const location = useLocation();

    const getMobileLinkClasses = (currentPath: string, linkPath: string) =>
        cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm font-medium",
            currentPath === linkPath
                ? "text-sidebar-primary"
                : "text-sidebar-foreground hover:text-sidebar-accent"
        );

    const footerContent = footer && (
        <footer className="border-t border-muted/30 bg-muted/20 px-4 py-3 text-sm text-muted-foreground text-center lg:px-6">
            {footer}
        </footer>
    );

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
            <Sidebar className="hidden md:flex flex-col border-r border-sidebar-border bg-sidebar">
                <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
                    <Link
                        to={rootPath}
                        className="flex items-baseline gap-2 font-poppins"
                    >
                        <span className="text-2xl font-bold tracking-tight text-sidebar-primary">
                            Complaint
                        </span>
                        <span className="text-2xl font-bold tracking-tight text-sidebar-foreground">
                            Box
                        </span>
                    </Link>
                    <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                        {name}
                    </div>
                </SidebarHeader>

                <SidebarLinks links={links} />

                <SidebarFooter className="p-0">{footerContent}</SidebarFooter>
            </Sidebar>

            <div className="flex flex-col">
                <header className="flex h-14 items-center justify-between border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <div className="flex items-center gap-2">
                        <Sheet>
                            <SheetTrigger asChild className="md:hidden">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0"
                                >
                                    <PanelLeft className="h-5 w-5" />
                                    <span className="sr-only">
                                        Toggle navigation menu
                                    </span>
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="left"
                                className="flex flex-col w-64 bg-sidebar text-sidebar-foreground"
                            >
                                <Link
                                    to={rootPath}
                                    className="flex items-center gap-2 text-lg font-semibold mb-4 font-poppins"
                                >
                                    <span className="text-xl font-bold text-sidebar-primary">
                                        Complaint
                                    </span>
                                    <span className="text-xl font-bold text-sidebar-foreground">
                                        Box
                                    </span>
                                </Link>

                                <nav className="grid gap-2 text-lg font-medium">
                                    {links.map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            className={getMobileLinkClasses(
                                                location.pathname,
                                                link.path
                                            )}
                                        >
                                            <span className="flex items-center justify-center w-5 h-5">
                                                {link.icon}
                                            </span>
                                            <span>{link.name}</span>
                                        </Link>
                                    ))}
                                </nav>

                                <SheetFooter>{footerContent}</SheetFooter>
                            </SheetContent>
                        </Sheet>

                        <h1
                            className="text-lg font-semibold truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-xs"
                            title={data ? "Hello! " + data.name : name}
                        >
                            {data ? "Hello! " + data.name : name}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeSwitch />
                        <ProfileMenu user={data} isLoading={isLoading} />
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
