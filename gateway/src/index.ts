import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 8080);

// Routes by domain prefix to each backing service. In production this

app.get("/health", (_req, res) => res.json({ status: "ok", service: "gateway" }));

app.listen(port, () => console.log(`gateway listening on ${port}`));
