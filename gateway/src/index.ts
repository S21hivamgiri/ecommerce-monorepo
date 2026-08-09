import express, { Request, Response, NextFunction, Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { serviceMap } from "./util.js";

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

// Object to store request counts for each IP address
const requestStore = new Map<string, number>();
const interval = 60 * 1000; // Time window in milliseconds (1 minute)
const rateLimit = 15; // Max requests per minute

// Reset request count for each IP address every 'interval' milliseconds
setInterval(() => {
  for (const [ip, timestamps] of requestStore.entries()){
    requestStore.delete(ip);// Reset request count for each IP address
  }
}, interval);

// Middleware function for rate limiting and timeout handling using Fixed Window Counter
function rateLimitAndTimeout(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip; // Get client IP address
  if (ip) {
    // Update request count for the current IP
    requestStore.set(ip, (requestStore.get(ip) || 0) + 1);

    // Check if request count exceeds the rate limit
    if ((requestStore.get(ip) || 0) > rateLimit) {
      // Respond with a 429 Too Many Requests status code
      return res.status(429).json({
        code: 429,
        status: "Error",
        message: "Rate limit exceeded. Try after sometime",
        data: null,
      });
    }

    next(); // Continue to the next middleware
  }
}

// Apply the rate limit and timeout middleware to the proxy
app.use(rateLimitAndTimeout);

app.use(
  "/auth",
  createProxyMiddleware({
    target: serviceMap.get("auth"),
    changeOrigin: true,
  }),
);
app.use((_req, res) => {
  res.status(404).json({
    code: 404,
    status: "Error",
    message: "Route not found.",
  });
});

app.listen(port, () => console.log(`gateway listening on ${port}`));
