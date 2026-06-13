const { createApp } = require("./server");
const { WhatsappSessionManager } = require("./session-manager");

const port = Number(process.env.PORT || 3010);
const sessionManager = new WhatsappSessionManager();
const app = createApp({ sessionManager });

app.listen(port, "0.0.0.0", () => {
  console.log(`WA connector listening on ${port}`);
});
