# 🔩 Forge-Deploy Demo App

A lightweight TypeScript + Express service that acts as the target workload for the **Forge-Deploy** reliability control plane. It exposes deliberately simple endpoints for health checking, failure simulation, latency injection, and Prometheus metrics scraping — everything the control plane needs to observe, evaluate, and govern.

---

## Endpoints

| Route | Behaviour |
|---|---|
| `GET /health` | Returns a healthy response — used for readiness/liveness probes |
| `GET /slow` | Artificially delays ~3 seconds to simulate a sluggish dependency |
| `GET /error` | Returns HTTP 500 — used to exercise failure-path handling |
| `GET /sum` | Increments and returns an in-memory counter |
| `GET /metrics` | Exposes Prometheus metrics for scraping |

---

## Tech Stack

- **Runtime:** Node.js 20+ · TypeScript · Express
- **Metrics:** prom-client
- **Testing:** Vitest · Supertest
- **Container:** Docker (image published to GHCR)

---

## Local Development

**Install and run:**

```bash
npm install
npm run build
npm start
```

The server listens on `http://0.0.0.0:3000`.

**Dev mode (with watch):**

```bash
npm run dev
```

**Run tests:**

```bash
npm test
```

---

## CI/CD Pipeline

On every push, the pipeline:

1. Installs dependencies (`npm ci`)
2. Runs the test suite (`npm test -- --run`)
3. Compiles TypeScript (`npm run build`)
4. Builds and pushes a Docker image to **GHCR**

The published image is then referenced by the [Forge-Deploy-Environment](https://github.com/Buthsaraa/Forge-Deploy-Environment) repo, where Argo CD reconciles the change into the cluster through a GitOps flow.

---

## Kubernetes Usage

This app is intended to run as a Kubernetes workload — typically as both a stable and canary pod behind split services managed by Argo Rollouts.

Once deployed, the endpoints serve their intended roles:

- `/health` — liveness and readiness probes
- `/metrics` — Prometheus scrape target
- `/slow` — synthetic latency for burn rate testing
- `/error` — intentional 500s for error budget consumption

---

## Manual Slow Deployment Test

> Forge-Deploy is still under active development. Until automated canary analysis is wired up, slow rollout behavior can be verified manually.

Spin up a temporary curl pod inside the cluster:

```bash
kubectl run curltest \
  --rm -it \
  --image=curlimages/curl \
  --restart=Never -- sh
```

Then hit the canary's slow endpoint repeatedly:

```bash
for i in {1..20}; do
  curl http://demo-app-canary:3000/slow
done
```

This generates the latency signal that Forge-Deploy uses to calculate burn rate and trigger proposals.

---

## API Reference

### `GET /health`

```json
{ "status": "ok - Application reached" }
```

### `GET /slow`

```json
{ "status": "slow", "delayMs": 3000 }
```

### `GET /error`

```json
{ "status": "error", "message": "Intentional error for SafeDeploy demo" }
```

### `GET /sum`

```json
{ "status": "sum", "sum": 1 }
```

### `GET /metrics`

Returns Prometheus text-format metrics, including:

- `http_request_duration_seconds` — request latency histogram
- `http_requests_total{status="..."}` — request count by status
- Default Node.js process metrics via prom-client

---

## Related Repositories

| Repo | Role |
|---|---|
| [Forge-Deploy](https://github.com/Buthsaraa/Forge-Deploy) | Control plane — SLO evaluation, incident management, proposals |
| [Forge-Deploy-Environment](https://github.com/Buthsaraa/Forge-Deploy-Environment) | GitOps manifests — Argo CD + Argo Rollouts configuration |
| **Forge-Deploy-Demo-App** | This repo — the observable target workload |

---

## License

ISC