"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/app-store";
import { setApiAccessToken } from "@/lib/api-client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch } = useAppStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!state.isAuthenticated) {
      router.replace("/login");
    }
  }, [router, state.isAuthenticated]);

  const logout = () => {
    setApiAccessToken(undefined);
    dispatch({ type: "logout" });
    router.push("/login");
  };

  const nav = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "focus-ring flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition",
              active ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card px-4 py-5 lg:block">
        <div className="mb-6">
          <p className="text-sm font-semibold text-primary">Chatbot Warga</p>
          <p className="text-xs text-muted-foreground">Dashboard admin</p>
        </div>
        {nav}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-card px-4 py-5 transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Chatbot Warga</p>
            <p className="text-xs text-muted-foreground">Dashboard admin</p>
          </div>
          <button className="focus-ring rounded-md p-2 hover:bg-muted" onClick={() => setOpen(false)} aria-label="Tutup menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        {nav}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
          <div className="flex min-h-14 items-center justify-between gap-3 px-4 lg:px-6">
            <button className="focus-ring rounded-md p-2 hover:bg-muted lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Layanan Desa Sukamaju</p>
              <p className="truncate text-xs text-muted-foreground">
                {state.apiStatus === "connected"
                  ? "Terhubung ke FastAPI"
                  : state.apiStatus === "loading"
                    ? "Menghubungkan API..."
                    : state.apiMessage ?? "Menunggu koneksi API"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{state.adminName}</p>
                <p className="text-xs text-muted-foreground">{state.isAuthenticated ? "Session aktif" : "Belum login"}</p>
              </div>
              <button className="focus-ring rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={logout}>
                <LogOut className="mr-2 inline h-4 w-4" />
                Keluar
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
