"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Database, HelpCircle, MessageSquareText, ShieldCheck } from "lucide-react";
import { loginSchema } from "@/lib/validation";
import { useMockStore } from "@/lib/mock-store";

export default function LoginPage() {
  const router = useRouter();
  const { actions } = useMockStore();
  const [email, setEmail] = useState("admin@desa.id");
  const [password, setPassword] = useState("password");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    const ok = await actions.login(result.data.email, result.data.password);
    if (!ok) {
      setErrors({ password: "Email atau password salah" });
      return;
    }
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7faf9_0%,#eef6f4_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-md border bg-card p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary p-2 text-primary-foreground shadow-[0_8px_24px_rgba(25,115,109,0.22)]">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Chatbot Warga</p>
              <h1 className="text-2xl font-semibold text-balance sm:text-3xl">Dashboard layanan WhatsApp desa</h1>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Frontend mock untuk memvalidasi alur admin: pantau chat warga, kelola FAQ, sumber data RAG, nomor chatbot,
            dan pengaturan AI sebelum backend dibuat.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <PreviewMetric icon={MessageSquareText} label="Chat hari ini" value="24" />
            <PreviewMetric icon={HelpCircle} label="FAQ aktif" value="18" />
            <PreviewMetric icon={Database} label="Sumber data" value="32" />
          </div>

          <div className="mt-6 rounded-md bg-muted p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Mode presentasi frontend-only</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Login ini tidak memanggil API. Email valid dan password apa pun yang tidak kosong akan masuk ke
                  dashboard mock.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-md border bg-card p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Masuk admin</h2>
            <p className="mt-1 text-sm text-muted-foreground">Gunakan akun demo untuk membuka dashboard operasional.</p>
          </div>

          <div className="mb-4 rounded-md border bg-background p-3 text-sm">
            <p className="font-medium">Akun demo</p>
            <p className="mt-1 text-muted-foreground">admin@desa.id / password</p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                className="field mt-1"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
              />
              {errors.email ? <span className="mt-1 block text-xs text-destructive">{errors.email}</span> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium">Password</span>
              <input
                className="field mt-1"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
              />
              {errors.password ? <span className="mt-1 block text-xs text-destructive">{errors.password}</span> : null}
            </label>

            <button className="focus-ring min-h-11 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_8px_24px_rgba(25,115,109,0.22)] transition-transform active:scale-[0.96]">
              Masuk ke dashboard
            </button>
            <Link
              href="/dashboard"
              className="focus-ring flex min-h-11 w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Lewati login dan lihat demo
            </Link>
          </form>
        </section>
      </section>
    </main>
  );
}

function PreviewMetric({
  icon: Icon,
  label,
  value
}: {
  icon: typeof MessageSquareText;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
