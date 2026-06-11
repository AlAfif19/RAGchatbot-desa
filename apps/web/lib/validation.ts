import { z } from "zod";

const phonePattern = /^[+\d\s-]+$/;

const supportedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime"
];

export const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().trim().min(1, "Password wajib diisi")
});

export const chatbotNumberSchema = z.object({
  botName: z.string().trim().min(1, "Nama bot wajib diisi"),
  phoneNumber: z
    .string()
    .trim()
    .min(8, "Nomor WhatsApp terlalu pendek")
    .regex(phonePattern, "Nomor hanya boleh berisi angka, plus, spasi, atau strip"),
  provider: z.string().trim().min(1, "Provider wajib diisi"),
  webhookSecret: z.string().trim().min(6, "Webhook secret minimal 6 karakter"),
  status: z.enum(["active", "inactive"])
});

export const dataSourceSchema = z
  .object({
    title: z.string().trim().min(1, "Judul wajib diisi"),
    category: z.string().trim().min(1, "Kategori wajib diisi"),
    sourceType: z.enum(["text", "file", "url"]),
    contentText: z.string().optional(),
    fileName: z.string().optional(),
    mimeType: z.string().optional(),
    originalSize: z.coerce.number().min(0).default(0)
  })
  .superRefine((value, ctx) => {
    if (value.sourceType === "text" && !value.contentText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Konten teks wajib diisi",
        path: ["contentText"]
      });
    }

    if (value.sourceType === "file") {
      if (!value.fileName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File wajib dipilih",
          path: ["fileName"]
        });
      }

      if (!value.mimeType || !supportedMimeTypes.includes(value.mimeType)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tipe file tidak didukung",
          path: ["mimeType"]
        });
      }
    }
  });

export const faqSchema = z.object({
  question: z.string().trim().min(1, "Pertanyaan wajib diisi"),
  answer: z.string().trim().min(1, "Jawaban wajib diisi"),
  keywords: z.string().trim().optional().default(""),
  threshold: z.coerce.number().min(0, "Threshold minimal 0").max(1, "Threshold maksimal 1"),
  isActive: z.boolean()
});

export const aiSettingsSchema = z.object({
  provider: z.string().trim().min(1, "Provider wajib diisi"),
  modelName: z.string().trim().min(1, "Nama model wajib diisi"),
  systemPrompt: z.string().trim().min(1, "System prompt wajib diisi"),
  topK: z.coerce.number().int().min(1, "Top K minimal 1"),
  faqThreshold: z.coerce.number().min(0, "Threshold minimal 0").max(1, "Threshold maksimal 1"),
  apiKey: z.string().trim().optional().default(""),
  fallbackAnswer: z.string().trim().min(1, "Jawaban fallback wajib diisi")
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ChatbotNumberFormValues = z.infer<typeof chatbotNumberSchema>;
export type DataSourceFormValues = z.infer<typeof dataSourceSchema>;
export type FaqFormValues = z.infer<typeof faqSchema>;
export type AiSettingsFormValues = z.infer<typeof aiSettingsSchema>;
