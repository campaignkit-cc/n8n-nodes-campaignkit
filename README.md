# n8n-nodes-campaignkit

This is an n8n community node for [CampaignKit Email Validation](https://campaignkit.cc). It lets you validate email addresses and receive notifications when validation jobs complete in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Node Installation

1. Go to **Settings** > **Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-campaignkit` in the **Enter npm package name** field
4. Click **Install**

### Manual Installation

If you're self-hosting n8n, you can install the node manually:

```bash
npm install n8n-nodes-campaignkit
```

For Docker-based installations, add the package to your n8n Docker image or install it in your running container.

## Operations

### CampaignKit Node

The main CampaignKit node supports the following operations:

#### Validate Email
Validates a single email address and returns detailed verification results.

**Input:**
- `email` (string, required): The email address to validate

**Output:**
```json
{
  "email": "user@example.com",
  "is_valid": true,
  "is_risky": false,
  "is_invalid": false,
  "is_disposable": false,
  "is_role_email": false,
  "is_catchall": false,
  "is_blacklisted": false,
  "is_free_email": true,
  "is_mx_found": true,
  "is_smtp_valid": true,
  "score": 10,
  "classifier": "valid",
  "domain": "example.com",
  "mx_record": "mail.example.com",
  "smtp_provider": "Google",
  "free_email_provider": "Gmail",
  "did_you_mean": ""
}
```

#### Validate Batch
Validates multiple email addresses as a batch job.

**Input:**
- `emails` (string, required): Email addresses to validate (one per line)
- `label` (string, optional): Label for the validation job

**Output:**
```json
{
  "job_id": 12345,
  "email_count": 100,
  "status": "pending",
  "label": "My Email List",
  "created_at": "2025-01-15T10:00:00Z"
}
```

#### Get Job Status
Retrieves the status and results of a validation job.

**Input:**
- `jobId` (number, required): The ID of the validation job

**Output:**
```json
{
  "job_id": 12345,
  "account_id": 456,
  "label": "My Email List",
  "state": "done",
  "email_count": 100,
  "valid_count": 85,
  "invalid_count": 10,
  "risky_count": 5,
  "deliverable_count": 85,
  "undeliverable_count": 15,
  "credits_used": 100,
  "progress": 100,
  "created_at": "2025-01-15T10:00:00Z",
  "started_at": "2025-01-15T10:00:05Z",
  "finished_at": "2025-01-15T10:05:00Z"
}
```

### CampaignKit Trigger

The CampaignKit Trigger node responds to events from CampaignKit.

#### Job Completed
Triggers when a validation job is completed.

**Output:**
```json
{
  "event": "validation.job.completed",
  "job_id": 12345,
  "account_id": 456,
  "label": "My Email List",
  "state": "done",
  "email_count": 100,
  "deliverable_count": 85,
  "undeliverable_count": 15,
  "risky_count": 5,
  "credits_used": 100,
  "created_at": "2025-01-15T10:00:00Z",
  "finished_at": "2025-01-15T10:05:00Z"
}
```

## Credentials

To use this node, you need a CampaignKit API key.

### Getting Your API Key

1. Sign up for a [CampaignKit account](https://app.campaignkit.cc)
2. Navigate to **Settings** > **API Keys**
3. Create a new API key or copy an existing one

### Configuring Credentials in n8n

1. In your n8n workflow, add a CampaignKit node
2. Click on **Credentials** > **Create New**
3. Select **CampaignKit API**
4. Enter your API key
5. (Optional) Modify the Base URL if using a custom instance
6. Click **Save**

The credential will be automatically tested by making a request to `/v1/account/me`.

## Example Workflows

### Example 1: Validate Single Email

```
Manual Trigger → CampaignKit (Validate Email) → Filter (is_valid = true) → Send Email
```

1. Trigger workflow manually or via webhook
2. Use **CampaignKit** node with **Validate Email** operation
3. Filter results to only include valid emails
4. Send confirmation email for valid addresses

### Example 2: Batch Validation with Notification

```
Schedule Trigger → HTTP Request (Get Emails) → CampaignKit (Validate Batch) → Wait → CampaignKit (Get Job Status) → Send Notification
```

1. Schedule workflow to run daily
2. Fetch email list from your database/API
3. Start batch validation with CampaignKit
4. Wait for job to complete (or use webhook trigger)
5. Get final job results
6. Send summary notification

### Example 3: Webhook-Based Batch Validation

```
CampaignKit Trigger (Job Completed) → Filter (deliverable_count > 0) → HTTP Request (Update Database) → Slack Notification
```

1. **CampaignKit Trigger** listens for job completion
2. Filter to only process jobs with deliverable emails
3. Update your database with results
4. Send Slack notification with summary

## Understanding Email Validation Scores

CampaignKit assigns each email a score from 0-10:

- **10**: Valid - All checks passed, email is deliverable
- **9**: Valid but unverified - Syntax and MX checks passed, but SMTP verification failed
- **2**: Risky - Email exists but may be a spam trap or temporary
- **0**: Invalid - Email will bounce

### Key Output Fields

- `is_valid`: Email is deliverable (score 9-10)
- `is_invalid`: Email will bounce (score 0)
- `is_risky`: Email is suspicious (score 2)
- `is_disposable`: Temporary/disposable email service
- `is_role_email`: Generic role address (info@, support@, etc.)
- `is_catchall`: Domain accepts all email addresses
- `is_blacklisted`: Email is on CampaignKit's blacklist
- `did_you_mean`: Suggested correction for typos

## API Rate Limits

CampaignKit API has the following limits:

- **Authenticated requests**: Based on your account plan
- **Batch validation**: Uses credits based on email count
- **Webhook delivery**: Up to 5 retry attempts with exponential backoff

Monitor your credit usage via the `/v1/account/billing/balance` endpoint or in your CampaignKit dashboard.

## Troubleshooting

### Credential Test Fails

- Verify your API key is correct
- Check that your CampaignKit account is active
- Ensure the Base URL is correct (default: `https://api.campaignkit.cc`)

### Webhook Not Receiving Events

- Ensure your n8n instance is accessible from the internet
- Check that the workflow is activated
- Verify webhook was created successfully in CampaignKit dashboard
- Check n8n execution logs for incoming webhook requests

### Batch Job Stuck in "Pending"

- Large batches may take time to process
- Use the **Get Job Status** operation to monitor progress
- Jobs process at approximately 100-500 emails/minute depending on validation type

### "Insufficient Credits" Error

- Check your account credit balance
- Purchase additional credits in your CampaignKit dashboard
- Contact support@campaignkit.cc for billing assistance

## Development

### Building the Node

```bash
npm install
npm run build
```

### Local Testing

1. Build the node
2. Link it to your n8n installation:
   ```bash
   npm link
   cd ~/.n8n/nodes
   npm link n8n-nodes-campaignkit
   ```
3. Restart n8n

### Project Structure

```
n8n-nodes-campaignkit/
├── credentials/
│   └── CampaignKitApi.credentials.ts
├── nodes/
│   └── CampaignKit/
│       ├── CampaignKit.node.ts
│       └── CampaignKitTrigger.node.ts
├── types/
│   └── CampaignKit.types.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [CampaignKit API Documentation](https://docs.campaignkit.cc)
- [CampaignKit Dashboard](https://app.campaignkit.cc)
- [CampaignKit Support](mailto:support@campaignkit.cc)

## Compatibility

- n8n version: 0.220.0 or higher
- Node.js version: 18.x or higher

## License

[MIT](LICENSE)

## Version History

### 0.1.0 (Initial Release)
- ✅ Validate Email operation
- ✅ Validate Batch operation
- ✅ Get Job Status operation
- ✅ Job Completed webhook trigger
- ✅ API Key authentication
- ✅ Comprehensive error handling

## Support

For issues related to:
- **This n8n node**: Open an issue on [GitHub](https://github.com/yourusername/CampaignKit/issues)
- **CampaignKit API**: Contact support@campaignkit.cc
- **n8n platform**: Visit [n8n community forum](https://community.n8n.io)
