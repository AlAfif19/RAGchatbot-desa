const qrcode = require("qrcode");
const { Client, LocalAuth } = require("whatsapp-web.js");

const DEFAULT_SESSION_PATH = process.env.WA_SESSION_PATH || "./.wwebjs_auth";

class WhatsappSessionManager {
  constructor({ sessionPath = DEFAULT_SESSION_PATH, apiBaseUrl = process.env.API_BASE_URL } = {}) {
    this.sessionPath = sessionPath;
    this.apiBaseUrl = apiBaseUrl;
    this.internalApiToken = process.env.INTERNAL_API_TOKEN || "";
    this.sessions = new Map();
  }

  async startSession(chatbotNumberId) {
    const existing = this.sessions.get(chatbotNumberId);
    if (existing?.client) {
      return this.getSessionStatus(chatbotNumberId);
    }

    const state = {
      chatbotNumberId,
      client: this.createClient(chatbotNumberId),
      status: "connecting",
      qr: null,
      message: "Menghubungkan WhatsApp.",
    };
    this.sessions.set(chatbotNumberId, state);
    this.bindClientEvents(state);
    state.client.initialize();
    return this.formatState(state);
  }

  getSessionStatus(chatbotNumberId) {
    const state = this.sessions.get(chatbotNumberId);
    if (!state) {
      return {
        chatbot_number_id: chatbotNumberId,
        status: "disconnected",
        qr: null,
        message: "WhatsApp belum terhubung.",
      };
    }
    return this.formatState(state);
  }

  async logoutSession(chatbotNumberId) {
    const state = this.sessions.get(chatbotNumberId);
    if (state?.client) {
      await state.client.logout().catch(() => undefined);
      await state.client.destroy().catch(() => undefined);
    }
    this.sessions.delete(chatbotNumberId);
    return {
      chatbot_number_id: chatbotNumberId,
      status: "disconnected",
      qr: null,
      message: "WhatsApp diputuskan.",
    };
  }

  async sendMessage(chatbotNumberId, to, message) {
    const state = this.sessions.get(chatbotNumberId);
    if (!state?.client || state.status !== "connected") {
      throw new Error("WhatsApp belum terhubung.");
    }
    await state.client.sendMessage(this.toChatId(to), message);
    return { ok: true };
  }

  createClient(chatbotNumberId) {
    return new Client({
      authStrategy: new LocalAuth({
        clientId: `chatbot-${chatbotNumberId}`,
        dataPath: this.sessionPath,
      }),
      puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      },
    });
  }

  bindClientEvents(state) {
    state.client.on("qr", async (qrPayload) => {
      state.status = "pending_qr";
      state.qr = await qrcode.toDataURL(qrPayload);
      state.message = "Scan QR WhatsApp untuk menghubungkan nomor.";
    });

    state.client.on("authenticated", () => {
      state.status = "connecting";
      state.message = "WhatsApp berhasil diautentikasi.";
    });

    state.client.on("ready", () => {
      state.status = "connected";
      state.qr = null;
      state.message = "WhatsApp terhubung.";
    });

    state.client.on("auth_failure", (message) => {
      state.status = "error";
      state.qr = null;
      state.message = message || "Autentikasi WhatsApp gagal.";
    });

    state.client.on("disconnected", () => {
      state.status = "disconnected";
      state.qr = null;
      state.message = "WhatsApp terputus.";
    });

    state.client.on("message", async (message) => {
      await this.forwardInboundMessage(state.chatbotNumberId, message).catch(() => undefined);
    });
  }

  async forwardInboundMessage(chatbotNumberId, message) {
    if (!this.apiBaseUrl) {
      return;
    }
    await fetch(`${this.apiBaseUrl.replace(/\/$/, "")}/api/internal/whatsapp/inbound`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-internal-token": this.internalApiToken },
      body: JSON.stringify({
        chatbot_number_id: chatbotNumberId,
        from: message.from,
        message_id: message.id?._serialized || null,
        body: message.body || "",
      }),
    });
  }

  formatState(state) {
    return {
      chatbot_number_id: state.chatbotNumberId,
      status: state.status,
      qr: state.qr,
      message: state.message,
    };
  }

  toChatId(to) {
    return to.includes("@") ? to : `${to.replace(/\D/g, "")}@c.us`;
  }
}

module.exports = { WhatsappSessionManager };
