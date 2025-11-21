# Contributing to n8n-nodes-campaignkit

Thank you for your interest in contributing to the CampaignKit n8n community node!

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- n8n installed (for local testing)
- CampaignKit account with API key

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/CampaignKit.git
   cd CampaignKit/backend/integrations/n8n
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Development Workflow

### Building

Compile TypeScript to JavaScript:
```bash
npm run build
```

Watch mode for development:
```bash
npm run dev
```

### Linting and Formatting

Run ESLint:
```bash
npm run lint
```

Format code with Prettier:
```bash
npm run format
```

### Local Testing

#### Option 1: Link to Global n8n Installation

1. Build the node:
   ```bash
   npm run build
   ```

2. Create a symbolic link:
   ```bash
   npm link
   ```

3. Link to your n8n installation:
   ```bash
   cd ~/.n8n/custom
   npm link n8n-nodes-campaignkit
   ```

4. Restart n8n:
   ```bash
   n8n restart
   ```

#### Option 2: Test with Local n8n

1. Clone n8n repository:
   ```bash
   git clone https://github.com/n8n-io/n8n.git
   cd n8n
   npm install
   ```

2. Link your node:
   ```bash
   cd packages/cli
   npm link /path/to/CampaignKit/backend/integrations/n8n
   ```

3. Start n8n in development mode:
   ```bash
   npm run dev
   ```

### Testing the Node

1. Open n8n in your browser (usually http://localhost:5678)
2. Create a new workflow
3. Search for "CampaignKit" in the node picker
4. Add credentials (use your CampaignKit API key)
5. Test each operation:
   - Validate Email with a real email address
   - Validate Batch with multiple emails
   - Get Job Status with a valid job ID
   - Test the trigger by creating a validation job

### Manual Testing Checklist

- [ ] Credential creation and testing works
- [ ] Validate Email returns correct response structure
- [ ] Validate Batch creates a job successfully
- [ ] Get Job Status retrieves job information
- [ ] Webhook trigger subscribes on workflow activation
- [ ] Webhook trigger receives events correctly
- [ ] Webhook trigger unsubscribes on workflow deactivation
- [ ] Error handling works (invalid API key, bad requests, etc.)
- [ ] continueOnFail behavior works correctly

## Project Structure

```
n8n-nodes-campaignkit/
├── credentials/
│   └── CampaignKitApi.credentials.ts    # API authentication
├── nodes/
│   └── CampaignKit/
│       ├── CampaignKit.node.ts          # Main node with operations
│       ├── CampaignKitTrigger.node.ts   # Webhook trigger node
│       └── campaignkit.svg              # Node icon (TODO)
├── types/
│   └── CampaignKit.types.ts             # TypeScript interfaces
├── dist/                                 # Compiled JavaScript (gitignored)
├── package.json                          # npm package configuration
├── tsconfig.json                         # TypeScript configuration
├── .eslintrc.js                         # ESLint configuration
├── .prettierrc.js                       # Prettier configuration
└── README.md                            # User documentation
```

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Define interfaces for all API responses
- Use explicit types for function parameters and return values
- Prefer `const` over `let`
- Use descriptive variable names

### n8n Conventions

- Follow n8n naming conventions for nodes and credentials
- Use proper node categories (transform, trigger, etc.)
- Implement proper error handling with `NodeOperationError`
- Support `continueOnFail` mode
- Use `pairedItem` for proper data flow

### Code Organization

- Keep operations focused and single-purpose
- Extract reusable logic into helper functions
- Use clear, self-documenting code
- Add comments for complex logic only

## Making Changes

### Adding a New Operation

1. Add operation to the `options` array in node description:
   ```typescript
   {
     name: 'New Operation',
     value: 'newOperation',
     description: 'Description of operation',
     action: 'Action description',
   }
   ```

2. Add operation parameters in `properties` array:
   ```typescript
   {
     displayName: 'Parameter Name',
     name: 'parameterName',
     type: 'string',
     displayOptions: {
       show: {
         operation: ['newOperation'],
       },
     },
     default: '',
     required: true,
   }
   ```

3. Implement operation logic in `execute()` method:
   ```typescript
   if (operation === 'newOperation') {
     const param = this.getNodeParameter('parameterName', i) as string;
     const response = await this.helpers.httpRequestWithAuthentication.call(
       this,
       'campaignKitApi',
       {
         method: 'POST',
         url: `${baseUrl}/v1/endpoint`,
         body: { param },
         json: true,
       },
     );
     returnData.push({ json: response, pairedItem: { item: i } });
   }
   ```

4. Add TypeScript types for response in `types/CampaignKit.types.ts`

### Modifying Existing Operations

1. Make changes to the operation logic
2. Update TypeScript types if response structure changes
3. Update README.md with new behavior
4. Test thoroughly with various inputs
5. Update CHANGELOG.md

### Version Bumping

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.x): Bug fixes, documentation updates
- **Minor** (0.x.0): New features, backward-compatible changes
- **Major** (x.0.0): Breaking changes

Update version in:
- `package.json`
- `CHANGELOG.md`

## Publishing to npm

### Pre-publish Checklist

- [ ] All tests pass
- [ ] Code is linted and formatted
- [ ] README.md is up to date
- [ ] CHANGELOG.md includes new version
- [ ] Version number updated in package.json
- [ ] Icon file is present (campaignkit.svg)
- [ ] Build completes without errors
- [ ] Manual testing completed

### Publishing Steps

1. Ensure you're logged into npm:
   ```bash
   npm login
   ```

2. Build the package:
   ```bash
   npm run build
   ```

3. Run pre-publish checks:
   ```bash
   npm run prepublishOnly
   ```

4. Publish to npm:
   ```bash
   npm publish
   ```

5. Create a Git tag:
   ```bash
   git tag -a v0.1.0 -m "Release version 0.1.0"
   git push origin v0.1.0
   ```

6. Create a GitHub release with changelog

## Debugging

### Common Issues

**Node doesn't appear in n8n:**
- Check `package.json` has correct `n8n` configuration
- Verify `dist/` folder contains compiled JavaScript
- Restart n8n after linking

**Credential test fails:**
- Check API key is valid
- Verify base URL is correct
- Check network connectivity

**Webhook trigger not working:**
- Ensure n8n is accessible from internet
- Check webhook was created in CampaignKit
- Verify signature verification logic

**TypeScript compilation errors:**
- Run `npm install` to ensure dependencies are installed
- Check TypeScript version compatibility
- Verify import paths are correct

### Enable Debug Logging

Set environment variable before starting n8n:
```bash
export N8N_LOG_LEVEL=debug
n8n start
```

## Getting Help

- Check [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- Ask in [n8n community forum](https://community.n8n.io)
- Review [existing n8n community nodes](https://www.npmjs.com/search?q=keywords:n8n-community-node-package)
- Contact CampaignKit support: support@campaignkit.email

## Resources

- [n8n Node Development Documentation](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n Workflow Package API](https://github.com/n8n-io/n8n/tree/master/packages/workflow)
- [CampaignKit API Documentation](https://docs.campaignkit.email)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
