> ## Documentation Index
> Fetch the complete documentation index at: https://docs.higgsfield.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Billing and retention

> Understand charging, refunds, estimation, and output retention.

Higgsfield charges successful generation requests using account credits. The exact cost depends on the selected model and parameters.

## Credit expiration

Credits expire one year after they are added to your account balance. Plan purchases and usage with this expiration period in mind.

## Estimate a request

Use the estimate endpoint with the same model parameters before submitting generation:

```bash theme={"theme":{"light":"github-light","dark":"github-dark"}}
curl --request POST \
  --url https://api.higgsfield.ai/estimate/higgsfield-ai/soul/v2/standard \
  --header "Authorization: Key ${HF_API_KEY_ID}:${HF_API_KEY_SECRET}" \
  --header "Content-Type: application/json" \
  --data '{
    "prompt": "Editorial portrait in soft daylight"
  }'
```

```json theme={"theme":{"light":"github-light","dark":"github-dark"}}
{
  "credits": "1.500",
  "usd": "0.094"
}
```

<Note>
  The values above illustrate the response format. Use the estimate returned for your authenticated account as the authoritative amount.
</Note>

## Failed and moderated requests

Requests ending as `failed` or `nsfw` are not charged. If credits were reserved when the request was accepted, they are refunded automatically.

## Canceled requests

A request can be canceled only before processing starts. A successfully canceled queued request is refunded.

## Output retention

Generated output is accessible for at least seven days after creation and may be removed after that period. Download completed files to your own storage for long-term retention.


## Related topics

- [FAQ](/docs/help/faq.md)
- [Higgsfield API](/docs/index.md)
- [How the API works](/docs/how-to/introduction.md)
- [Support](/docs/help/support.md)
- [Kling 3.0 — Standard · Text to video API](/docs/models/kling-3/standard-text-to-video.md)
