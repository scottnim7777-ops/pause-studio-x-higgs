> ## Documentation Index
> Fetch the complete documentation index at: https://docs.higgsfield.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Rate limits

> Design integrations for account and model concurrency limits.

Rate limits depend on the account and the selected model. View the limits assigned to your account in [Higgsfield Console](https://console.higgsfield.ai).

The primary generation limit is concurrency: the number of requests that may be queued or processing at the same time. Some models can also have model-specific limits.

## When concurrency is reached

The API currently returns `400 Bad Request` with a message similar to:

```json theme={"theme":{"light":"github-light","dark":"github-dark"}}
{
  "detail": "Maximum number of concurrent requests (4) has been reached"
}
```

Wait for an existing request to reach a terminal status before submitting more work.

## Client recommendations

* Limit generation submissions with a worker pool or semaphore.
* Track each accepted `request_id` until it becomes terminal.
* Use backoff and jitter instead of retrying in a tight loop.
* Keep polling traffic separate from generation submission concurrency.
* Let us know in [Discord](https://discord.gg/BEea92KeR9) before a planned traffic increase if you need higher limits.

<Note>
  The API does not currently publish standard rate-limit response headers or `Retry-After`. Treat the limits shown in your dashboard as the authoritative values for your account.
</Note>


## Related topics

- [FAQ](/docs/help/faq.md)
- [HappyHorse 1.1 — Reference to video API](/docs/models/happy-horse-1-1/reference-to-video.md)
- [Happy Horse 1.0 — Reference to video API](/docs/models/happy-horse-1/reference-to-video.md)
- [Wan 2.7 — Reference to video API](/docs/models/wan-2-7/reference-to-video.md)
- [Higgsfield API](/docs/index.md)
