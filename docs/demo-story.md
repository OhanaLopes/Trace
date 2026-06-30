# Demo Story — Webhook Delivery System

Use this text as the input when demoing Trace.

---

## Story text (paste this into the input)

**Title:** Implement webhook delivery with automatic retry

As a platform developer, I want the system to deliver webhook events to customer-registered endpoints so that external systems can react to events in real time.

**Acceptance Criteria:**

- When an event occurs, the system sends a POST request to all registered webhook URLs for that event type
- If the delivery fails (non-2xx response or timeout), the system retries up to 5 times using exponential backoff (1s, 2s, 4s, 8s, 16s)
- After 5 failed attempts, the delivery is marked as `failed` and the customer is notified via email
- Each delivery attempt is logged with timestamp, HTTP status, and response body (truncated to 1KB)
- The webhook payload includes: event type, event ID, timestamp, and the resource data
- Deliveries are processed asynchronously via a background job queue
- The system reuses the same `event_id` across all retry attempts for the same event

**Out of scope:** webhook signature verification, payload encryption, customer self-service endpoint management.

---

## What Trace should find

Expected findings for this story (use to validate prompt quality):

1. **[safety / critical]** Retry assumed idempotent — reusing `event_id` implies the receiving endpoint must handle duplicate deliveries, but idempotency on the receiver side is never confirmed or enforced.

2. **[missing_constraint / high]** No timeout defined — the story mentions "timeout" as a failure condition but never specifies the timeout value. A missing or too-long timeout blocks worker threads.

3. **[race_condition / high]** Concurrent retries possible — the story doesn't define whether retries are exclusive. Two workers could pick up the same failed delivery simultaneously.

4. **[observability / medium]** No alerting threshold — logging is defined but there's no mention of when ops should be alerted (e.g. after N failures in X minutes across all webhooks).

5. **[missing_constraint / insufficient_evidence]** No rate limiting on delivery attempts per customer endpoint — a misbehaving or slow endpoint could starve the worker queue, but no constraint is stated.
