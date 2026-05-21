import client from "prom-client";

export const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency",
  buckets: [0.1, 0.3, 0.5, 1, 2, 5], // seconds
});

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["status"],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);