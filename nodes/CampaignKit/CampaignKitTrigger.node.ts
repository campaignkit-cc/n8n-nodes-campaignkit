import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeOperationError,
} from 'n8n-workflow';

import { createHmac } from 'crypto';
import { IWebhookPayload, IWebhookSubscription } from '../../types/CampaignKit.types';

export class CampaignKitTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CampaignKit Trigger',
		name: 'campaignKitTrigger',
		icon: 'file:campaignkit.svg',
		group: ['trigger'],
		version: 1,
		description: 'Trigger workflows when CampaignKit events occur',
		defaults: {
			name: 'CampaignKit Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'campaignKitApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Job Completed',
						value: 'validation.job.completed',
						description: 'Triggers when a validation job is completed',
					},
				],
				default: 'validation.job.completed',
				required: true,
				description: 'The event to listen for',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const credentials = await this.getCredentials('campaignKitApi');
				const baseUrl = credentials.baseUrl as string;

				try {
					const webhooks = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'campaignKitApi',
						{
							method: 'GET',
							url: `${baseUrl}/v1/webhooks`,
							json: true,
						},
					);

					if (Array.isArray(webhooks)) {
						for (const webhook of webhooks) {
							if (webhook.url === webhookUrl) {
								await this.helpers.httpRequestWithAuthentication.call(
									this,
									'campaignKitApi',
									{
										method: 'DELETE',
										url: `${baseUrl}/v1/webhooks/${webhook.id}`,
										json: true,
									},
								);
								return false;
							}
						}
					}
				} catch (error) {
					// Webhook doesn't exist or error checking
					return false;
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;
				const credentials = await this.getCredentials('campaignKitApi');
				const baseUrl = credentials.baseUrl as string;

				const body = {
					url: webhookUrl,
					events: [event],
				};

				try {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'campaignKitApi',
						{
							method: 'POST',
							url: `${baseUrl}/v1/webhooks`,
							body,
							json: true,
						},
					);

					const webhookData = response as IWebhookSubscription;

					if (webhookData.id === undefined) {
						return false;
					}

					const webhookId = webhookData.id.toString();
					const secret = webhookData.secret;

					// Store webhook ID and secret for later use
					const webhookMetadata = this.getWorkflowStaticData('node');
					webhookMetadata.webhookId = webhookId;
					webhookMetadata.secret = secret;

					return true;
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					throw new NodeOperationError(this.getNode(), `Failed to create webhook: ${errorMessage}`);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookMetadata = this.getWorkflowStaticData('node');
				const webhookId = webhookMetadata.webhookId as string;
				const credentials = await this.getCredentials('campaignKitApi');
				const baseUrl = credentials.baseUrl as string;

				if (webhookId) {
					try {
						await this.helpers.httpRequestWithAuthentication.call(
							this,
							'campaignKitApi',
							{
								method: 'DELETE',
								url: `${baseUrl}/v1/webhooks/${webhookId}`,
								json: true,
							},
						);
					} catch (error) {
						return false;
					}

					delete webhookMetadata.webhookId;
					delete webhookMetadata.secret;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const webhookMetadata = this.getWorkflowStaticData('node');
		const secret = webhookMetadata.secret as string;

		// Verify webhook signature
		if (secret && req.headers['x-webhook-signature']) {
			const signature = req.headers['x-webhook-signature'] as string;
			const body = JSON.stringify(req.body);
			const expectedSignature = createHmac('sha256', secret)
				.update(body)
				.digest('hex');

			if (signature !== expectedSignature) {
				throw new NodeOperationError(
					this.getNode(),
					'Webhook signature verification failed',
				);
			}
		}

		const payload = req.body as IWebhookPayload;

		return {
			workflowData: [
				[
					{
						json: payload,
					},
				],
			],
		};
	}
}
