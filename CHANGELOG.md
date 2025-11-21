# Changelog

All notable changes to the n8n-nodes-campaignkit package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-21

### Added
- Initial release of CampaignKit n8n community node
- **CampaignKit Node** with three operations:
  - Validate Email: Single email validation with 17 output fields
  - Validate Batch: Batch email validation with job creation
  - Get Job Status: Retrieve validation job results
- **CampaignKit Trigger Node** with webhook support:
  - Job Completed: Trigger on validation job completion
  - Automatic webhook subscription/unsubscription
  - HMAC-SHA256 signature verification
- API Key authentication via Bearer token
- Comprehensive TypeScript type definitions
- Full feature parity with CampaignKit Zapier integration
- Error handling and continueOnFail support
- Credential testing against `/v1/account/me` endpoint

### Technical Details
- Built with n8n-workflow API version 1
- TypeScript 5.0+ support
- Uses CampaignKit Zapier-optimized endpoints (`/v1/zapier/*`)
- Node.js 18+ compatibility

### Documentation
- Comprehensive README with usage examples
- Installation instructions for community nodes
- Example workflows for common use cases
- Troubleshooting guide
- API rate limits and credit usage information

[0.1.0]: https://github.com/yourusername/CampaignKit/releases/tag/v0.1.0
