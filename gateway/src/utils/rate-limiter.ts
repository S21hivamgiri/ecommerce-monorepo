import { Request, Response, NextFunction } from "express";
// Object to store request counts for each IP address
const requestStore = new Map<string, number>();
const interval = 60 * 1000; // Time window in milliseconds (1 minute)
const rateLimit = 13; // Max requests per minute

// Reset request count for each IP address every 'interval' milliseconds
const timer = setInterval(() => {
  for (const [ip, _] of requestStore.entries()) {
    requestStore.delete(ip); // Reset request count for each IP address
  }
}, interval);
timer.unref();
// Middleware function for rate limiting and timeout handling using Fixed Window Counter
export function rateLimitAndTimeout(
  req: Request,
  res: Response,
  next: NextFunction,
) {
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
