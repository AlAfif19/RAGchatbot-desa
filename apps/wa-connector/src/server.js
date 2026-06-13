const express = require("express");

function createApp({ sessionManager }) {
  const app = express();
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "wa-connector" });
  });

  app.post("/sessions/:chatbotNumberId/start", async (request, response, next) => {
    try {
      response.json(await sessionManager.startSession(request.params.chatbotNumberId));
    } catch (error) {
      next(error);
    }
  });

  app.get("/sessions/:chatbotNumberId/status", (request, response) => {
    response.json(sessionManager.getSessionStatus(request.params.chatbotNumberId));
  });

  app.get("/sessions/:chatbotNumberId/qr", (request, response) => {
    response.json(sessionManager.getSessionStatus(request.params.chatbotNumberId));
  });

  app.post("/sessions/:chatbotNumberId/logout", async (request, response, next) => {
    try {
      response.json(await sessionManager.logoutSession(request.params.chatbotNumberId));
    } catch (error) {
      next(error);
    }
  });

  app.post("/sessions/:chatbotNumberId/send", async (request, response, next) => {
    try {
      const { to, message } = request.body;
      response.json(await sessionManager.sendMessage(request.params.chatbotNumberId, to, message));
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _request, response, _next) => {
    response.status(500).json({
      status: "error",
      message: error.message || "WA connector error",
    });
  });

  return app;
}

module.exports = { createApp };
