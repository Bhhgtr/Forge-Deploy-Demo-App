import express from 'express';
import { httpRequestDuration, httpRequestsTotal, register } from './metrics.js';

const app = express();

app.use(express.json());

app.use((_req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end();
    httpRequestsTotal.inc({ status: res.statusCode.toString() });
  });
  next();
});

let count = 0;

app.get('/health', async (_req, res) => {
  res.status(200).json({ status: 'ok - Application reached' });
});

app.get('/slow', async (_req, res) => {
  const delayMs = Number(3000);

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  res.status(200).json({
    status: 'slow',
    delayMs,
  });
});

app.get('/error', (_req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Intentional error for SafeDeploy demo',
  });
});

app.get('/sum', (_req, res) => {
  res.status(200).json({
    status: 'sum',
    sum: ++count,
  });
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

export {app, count};