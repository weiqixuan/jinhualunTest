import { createApp } from "./app";
import { loadConfig } from "./config/env";

const config = loadConfig();
const app = createApp(config);

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Auth server listening on http://0.0.0.0:${config.port}`);
  console.log(`Auth storage mode: ${config.authStorageMode}`);
});
