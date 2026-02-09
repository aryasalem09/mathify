import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

function labApiDevPlugin() {
  return {
    name: "lab-api-dev",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url || !req.url.startsWith("/api/lab/")) {
          return next();
        }

        const url = new URL(req.url, "http://localhost");
        const route = url.pathname.replace("/api/lab/", "");
        if (!route) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }

        const filePath = path.resolve(
          process.cwd(),
          "api",
          "lab",
          `${route}.js`
        );

        if (!fs.existsSync(filePath)) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }

        try {
          if (req.method && req.method !== "GET" && req.method !== "HEAD") {
            const body = await new Promise((resolve, reject) => {
              let raw = "";
              req.on("data", (chunk: any) => {
                raw += chunk;
              });
              req.on("end", () => resolve(raw));
              req.on("error", reject);
            });
            const reqWithBody = req as typeof req & { body?: string };
            reqWithBody.body = body;
          }

          const moduleUrl = `${pathToFileURL(filePath).href}?t=${Date.now()}`;
          const mod = await import(moduleUrl);
          const handler = mod?.default;

          if (typeof handler !== "function") {
            res.statusCode = 500;
            res.end("Invalid API handler");
            return;
          }

          await handler(req, res);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(
            JSON.stringify({
              error:
                error instanceof Error ? error.message : "API handler error",
            })
          );
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return {
    plugins: [labApiDevPlugin(), react()],
  };
});
