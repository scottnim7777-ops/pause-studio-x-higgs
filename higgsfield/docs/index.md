> ## Documentation Index
> Fetch the complete documentation index at: https://docs.higgsfield.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Higgsfield API

> Generate images and videos through one authenticated, asynchronous API.

Higgsfield provides one integration point for generative media models. Submit a request to a model endpoint, then poll for the result or receive a webhook when processing finishes.

<CardGroup cols={2}>
  <Card title="Run your first request" icon="rocket" href="/docs/quickstart">
    Create credentials and complete a generation from submission to result.
  </Card>

  <Card title="Get an API key" icon="key" href="https://console.higgsfield.ai">
    Create and manage server-side credentials in Higgsfield Console.
  </Card>
</CardGroup>

## Make a request

Every model uses the same authentication and asynchronous request lifecycle. The JSON body depends on the selected model.

Start with [Genjutsu motion transfer](/docs/models/genjutsu/motion-transfer). Replace the example media URLs with publicly accessible URLs for your own video and reference image. The source video must be at least 4 seconds long.

<CodeGroup>
  ```bash Genjutsu theme={"theme":{"light":"github-light","dark":"github-dark"}}
  curl --request POST \
    --url https://api.higgsfield.ai/higgsfield/genjutsu/motion-transfer/v1.0 \
    --header "Authorization: Key ${HF_API_KEY_ID}:${HF_API_KEY_SECRET}" \
    --header "Content-Type: application/json" \
    --data '{
      "video_url": "https://example.com/input.mp4",
      "image_urls": ["https://example.com/input.jpg"]
    }'
  ```

  ```bash SOUL V2 theme={"theme":{"light":"github-light","dark":"github-dark"}}
  curl --request POST \
    --url https://api.higgsfield.ai/higgsfield-ai/soul/v2/standard \
    --header "Authorization: Key ${HF_API_KEY_ID}:${HF_API_KEY_SECRET}" \
    --header "Content-Type: application/json" \
    --data '{
      "prompt": "Editorial portrait in soft daylight"
    }'
  ```
</CodeGroup>

The API immediately returns a request identifier and links for checking or canceling the request.

```json theme={"theme":{"light":"github-light","dark":"github-dark"}}
{
  "status": "queued",
  "request_id": "d7e6c0f3-6699-4f6c-bb45-2ad7fd9158ff",
  "status_url": "https://api.higgsfield.ai/requests/d7e6c0f3-6699-4f6c-bb45-2ad7fd9158ff/status",
  "cancel_url": "https://api.higgsfield.ai/requests/d7e6c0f3-6699-4f6c-bb45-2ad7fd9158ff/cancel"
}
```

## Choose your path

<CardGroup cols={3}>
  <Card title="Build a prototype" icon="code" href="/docs/how-to/sdk">
    Use the Python or TypeScript SDK to submit a request and wait for its result.
  </Card>

  <Card title="Ship to production" icon="server" href="/docs/concepts/requests">
    Learn the request lifecycle, polling, webhooks, errors, and limits.
  </Card>

  <Card title="Upload media" icon="upload" href="/docs/concepts/file-uploads">
    Upload input files to Higgsfield storage before generation.
  </Card>
</CardGroup>

<Note>
  Output files are available for at least seven days. Download completed output to your own storage for long-term retention.
</Note>


## Related topics

- [Support](/docs/help/support.md)
- [FAQ](/docs/help/faq.md)
- [How the API works](/docs/how-to/introduction.md)
- [Managing members](/docs/organizations/managing-members.md)
- [Model API Reference](/docs/models.md)
