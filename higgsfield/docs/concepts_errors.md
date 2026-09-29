> ## Documentation Index
> Fetch the complete documentation index at: https://docs.higgsfield.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Errors and retries

> Handle synchronous API errors and terminal generation failures.

Errors can occur before a request is accepted or later during generation.

## Synchronous errors

Most HTTP errors use the FastAPI error envelope:

```json theme={"theme":{"light":"github-light","dark":"github-dark"}}
{
  "detail": "Invalid credentials"
}
```

Validation errors may return a list in `detail`. Do not parse human-readable messages to make permanent business decisions.

| Status | Typical meaning | Retry? |
| - | - | :-: |
| `400` | Invalid parameters, rejected input, or concurrency reached | After correcting the request or waiting |
| `401` | Missing or invalid credentials | No |
| `403` | Insufficient credits | After funding the account |
| `404` | Request or model not found for this account | No |
| `422` | Request body validation failed | No |
| `423` | Model is temporarily blocked | Later |
| `500` | Unexpected server error | Yes, with backoff |
| `503` | Model is disabled or not ready | Later |

## Terminal failures

An accepted request can later finish with `failed` or `nsfw`:

```json theme={"theme":{"light":"github-light","dark":"github-dark"}}
{
  "status": "failed",
  "request_id": "d7e6c0f3-6699-4f6c-bb45-2ad7fd9158ff",
  "error": "Generation failed"
}
```

Failed and NSFW requests are not charged; any reserved credits are refunded.

## Safe retry policy

* Retry `GET` status requests after network failures and `5xx` responses.
* Do not retry authentication or validation failures without changing the request.
* Use exponential backoff with jitter.
* Set maximum attempts and a total retry deadline.
* Do not automatically repeat a generation `POST` after an ambiguous timeout because submissions do not currently accept an idempotency key.

Every API response includes an `X-Correlation-ID` header. Record it with the `request_id` and include both when contacting support.


## Related topics

- [Support](/docs/help/support.md)
- [Polling](/docs/concepts/polling.md)
- [Webhooks](/docs/how-to/webhooks.md)
- [Client libraries](/docs/how-to/sdk.md)
- [Rate limits](/docs/concepts/rate-limits.md)
