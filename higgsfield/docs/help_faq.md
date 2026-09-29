> ## Documentation Index
> Fetch the complete documentation index at: https://docs.higgsfield.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# FAQ

> Answers about Higgsfield API authentication, asynchronous requests, model selection, billing, limits, and output retention.

# Frequently Asked Questions

<AccordionGroup>
  <Accordion title="What base URL and authentication header should I use?">
    Send requests to `https://api.higgsfield.ai` and authenticate server-side with `Authorization: Key YOUR_KEY_ID:YOUR_KEY_SECRET`. Do not use a Bearer token or expose the secret in browser or mobile code. See [Authentication](/docs/authentication).
  </Accordion>

  <Accordion title="Why does a generation request not return the media immediately?">
    Generation is asynchronous. A successful submission returns `request_id`, `status_url`, and `cancel_url`. Poll `status_url` or configure a webhook, then read the output URL after the status becomes `completed`. See [Requests and lifecycle](/docs/concepts/requests).
  </Accordion>

  <Accordion title="Which model or endpoint should I use?">
    Choose by input and output workflow: text-to-image, image editing, text-to-video, image-to-video, or frame-controlled video. Model availability depends on your account. Not sure which endpoint fits your case? Ask in our [Discord](https://discord.gg/BEea92KeR9).
  </Accordion>

  <Accordion title="What is the retention policy for generated output files?">
    Generated output files are stored and accessible for a minimum of 7 days from the time of creation. We strongly recommend downloading and storing files in your own infrastructure for long-term retention. Files may be removed from our servers at any time after the 7-day retention period.
  </Accordion>

  <Accordion title="Are failed requests charged?">
    No. Failed generation requests are not charged to your account. You are only billed for successful completions. In the event of a failure, any credits or costs associated with that request are automatically refunded.
  </Accordion>

  <Accordion title="What does NSFW status mean?">
    NSFW (Not Safe For Work) indicates that either your input parameters or the generated output did not pass our content moderation system due to content policy violations. Content policy rules and restrictions may vary depending on the specific model being used.
  </Accordion>

  <Accordion title="Are NSFW-flagged requests charged?">
    No. Requests flagged as NSFW are not charged to your account. When content is rejected by our moderation system, any associated credits or costs are automatically refunded.
  </Accordion>

  <Accordion title="Do you offer invoice-based billing?">
    The API runs on pay-as-you-go by default: you top up a balance and pay per generation. Invoice-based billing is available for customers on a committed-use contract. To discuss one, [contact sales](https://open.higgsfield.ai/contact-sales).
  </Accordion>

  <Accordion title="What are the API rate limits?">
    Rate limits depend on your account and the selected model. You can view your current limits and usage in your [dashboard](https://console.higgsfield.ai). Need a higher limit? Let us know in our [Discord](https://discord.gg/BEea92KeR9).
  </Accordion>

  <Accordion title="How do I monitor my API usage?">
    You can monitor your API usage, credit consumption, and request history through the [Higgsfield Console dashboard](https://console.higgsfield.ai). The dashboard provides real-time analytics and detailed usage reports.
  </Accordion>

  <Accordion title="Which programming languages are supported?">
    We provide official Python and Node.js/TypeScript SDKs. You can also integrate directly through the REST API from any language with an HTTP client. See [Client libraries](/docs/how-to/sdk).
  </Accordion>

  <Accordion title="How do I get started with the API?">
    To get started:

    1. Create an account at [console.higgsfield.ai](https://console.higgsfield.ai)

    2. Generate your API credentials from the dashboard

    3. Follow our [Quickstart](/docs/quickstart) for your first integration

    4. Read [How the API works](/docs/how-to/introduction), then use a generation endpoint available to your account
  </Accordion>

  <Accordion title="What happens if a generation takes too long?">
    Generation requests have model-specific timeout limits. If a request exceeds the timeout, it will be marked as failed and you will not be charged. You can resubmit the request. If timeouts keep happening, reach out in our [Discord](https://discord.gg/BEea92KeR9) with your `request_id`.
  </Accordion>
</AccordionGroup>

## Still have questions?

If you didn't find your answer, here is where to go next:

* **Discord community**: [Join the Higgsfield Discord](https://discord.gg/BEea92KeR9) and ask your question there
* **Account and billing**: email [support@higgsfield.ai](mailto:support@higgsfield.ai)
* **Documentation**: [Read the Quickstart](/docs/quickstart)
* **API Reference**: [Request endpoint reference](/docs/api-reference/overview)
