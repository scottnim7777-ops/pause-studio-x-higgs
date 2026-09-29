> ## Documentation Index
> Fetch the complete documentation index at: https://docs.higgsfield.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# How the API works

> Learn the common authentication and asynchronous request lifecycle shared by Higgsfield image and video models.

The Higgsfield API uses an asynchronous request lifecycle:

1. Submit JSON parameters to a model endpoint.
2. Store the returned `request_id`.
3. Poll `status_url` or wait for a webhook.
4. Download output when the request becomes `completed`.

<CardGroup cols={2}>
  <Card title="Start with the Quickstart" icon="rocket" href="/docs/quickstart">
    Run a complete request using cURL.
  </Card>

  <Card title="Understand requests" icon="rotate" href="/docs/concepts/requests">
    Learn statuses, output shapes, cancellation, and retention.
  </Card>
</CardGroup>

**Base URL:** `https://api.higgsfield.ai`

Every request requires server-side [authentication](/docs/authentication). For production integrations, read the [polling](/docs/concepts/polling), [webhook](/docs/how-to/webhooks), and [error handling](/docs/concepts/errors) guides.


## Related topics

- [FAQ](/docs/help/faq.md)
- [Model API Reference](/docs/models.md)
- [Support](/docs/help/support.md)
- [Ideogram 4.0 — Generate API](/docs/models/ideogram-4/generate.md)
- [Genjutsu API](/docs/models/genjutsu.md)
