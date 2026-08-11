import express, { Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { services } from "./utils/services.js";
import { rateLimitAndTimeout } from "./utils/rate-limiter.js";

const port = Number(process.env.PORT ?? 8080);
const app: Application = express();

app.use(cors()); // Enable CORS
app.use(helmet()); // Add security headers
app.use(morgan("combined")); // Log HTTP requests
app.disable("x-powered-by"); // Hide Express server information

// Routes by domain prefix to each backing service. In production this

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "gateway" }),
);

app.get("/", (_req, res) => {
  res.write("Welcome to my e-Commerce Shop.\n");
  res.write("This is Gateway to the e-Commerce Shop");
  res.end();
});

// Apply the rate limit and timeout middleware to the proxy
app.use(rateLimitAndTimeout);

for (const [path, target] of Object.entries(services)) {
  app.use(path, createProxyMiddleware({ target, changeOrigin: true }));
}

app.use((_req, res) => {
  res.status(404).json({
    code: 404,
    status: "Error",
    message: "Route not found.",
  });
});

app.listen(port, () => console.log(`gateway listening on ${port}`));
