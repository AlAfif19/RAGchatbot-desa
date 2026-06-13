const assert = require("node:assert/strict");
const { test } = require("node:test");

const { createApp } = require("../src/server");

function request(app, method, path, body) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", async () => {
      const { port } = server.address();
      try {
        const response = await fetch(`http://127.0.0.1:${port}${path}`, {
          method,
          headers: body ? { "content-type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = await response.json();
        resolve({ status: response.status, json });
      } catch (error) {
        reject(error);
      } finally {
        server.close();
      }
    });
  });
}

function createFakeManager() {
  const calls = [];
  return {
    calls,
    async startSession(id) {
      calls.push(["start", id]);
      return {
        chatbot_number_id: id,
        status: "pending_qr",
        qr: "data:image/png;base64,qr-test",
        message: "Scan QR WhatsApp untuk menghubungkan nomor.",
      };
    },
    getSessionStatus(id) {
      calls.push(["status", id]);
      return {
        chatbot_number_id: id,
        status: "connected",
        qr: null,
        message: "WhatsApp terhubung.",
      };
    },
    async logoutSession(id) {
      calls.push(["logout", id]);
      return {
        chatbot_number_id: id,
        status: "disconnected",
        qr: null,
        message: "WhatsApp diputuskan.",
      };
    },
    async sendMessage(id, to, message) {
      calls.push(["send", id, to, message]);
      return { ok: true };
    },
  };
}

test("health endpoint returns ok", async () => {
  const app = createApp({ sessionManager: createFakeManager() });

  const response = await request(app, "GET", "/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.json, { status: "ok", service: "wa-connector" });
});

test("session endpoints proxy to the session manager", async () => {
  const sessionManager = createFakeManager();
  const app = createApp({ sessionManager });

  const start = await request(app, "POST", "/sessions/42/start");
  const status = await request(app, "GET", "/sessions/42/status");
  const logout = await request(app, "POST", "/sessions/42/logout");

  assert.equal(start.status, 200);
  assert.equal(start.json.status, "pending_qr");
  assert.equal(status.status, 200);
  assert.equal(status.json.status, "connected");
  assert.equal(logout.status, 200);
  assert.equal(logout.json.status, "disconnected");
  assert.deepEqual(sessionManager.calls, [
    ["start", "42"],
    ["status", "42"],
    ["logout", "42"],
  ]);
});

test("qr endpoint returns the current pairing QR", async () => {
  const sessionManager = createFakeManager();
  const app = createApp({ sessionManager });

  const response = await request(app, "GET", "/sessions/42/qr");

  assert.equal(response.status, 200);
  assert.equal(response.json.qr, null);
  assert.equal(response.json.status, "connected");
  assert.deepEqual(sessionManager.calls, [["status", "42"]]);
});

test("send endpoint sends outbound WhatsApp messages", async () => {
  const sessionManager = createFakeManager();
  const app = createApp({ sessionManager });

  const response = await request(app, "POST", "/sessions/42/send", {
    to: "6281299990000",
    message: "Halo warga",
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.json, { ok: true });
  assert.deepEqual(sessionManager.calls, [["send", "42", "6281299990000", "Halo warga"]]);
});
