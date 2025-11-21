import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {
	IValidateEmailResponse,
	IValidateBatchResponse,
	IJobStatusResponse,
} from '../../types/CampaignKit.types';

export class CampaignKit implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CampaignKit',
		name: 'campaignKit',
		icon: 'file:campaignkit.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Email validation and verification with CampaignKit',
		defaults: {
			name: 'CampaignKit',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'campaignKitApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Validate Email',
						value: 'validateEmail',
						description: 'Validate a single email address',
						action: 'Validate a single email address',
					},
					{
						name: 'Validate Batch',
						value: 'validateBatch',
						description: 'Validate multiple email addresses',
						action: 'Validate multiple email addresses',
					},
					{
						name: 'Get Job Status',
						value: 'getJobStatus',
						description: 'Get the status of a validation job',
						action: 'Get validation job status',
					},
				],
				default: 'validateEmail',
			},

			// Validate Email Operation
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['validateEmail'],
					},
				},
				default: '',
				required: true,
				placeholder: 'user@example.com',
				description: 'The email address to validate',
			},

			// Validate Batch Operation
			{
				displayName: 'Emails',
				name: 'emails',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['validateBatch'],
					},
				},
				default: '',
				required: true,
				typeOptions: {
					rows: 5,
				},
				placeholder: 'email1@example.com\nemail2@example.com\nemail3@example.com',
				description: 'Email addresses to validate (one per line)',
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['validateBatch'],
					},
				},
				default: '',
				placeholder: 'My Email List',
				description: 'Optional label for the validation job',
			},

			// Get Job Status Operation
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getJobStatus'],
					},
				},
				default: 0,
				required: true,
				description: 'The ID of the validation job',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('campaignKitApi');
		const baseUrl = credentials.baseUrl as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'validateEmail') {
					// Validate Single Email
					const email = this.getNodeParameter('email', i) as string;

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'campaignKitApi',
						{
							method: 'POST',
							url: `${baseUrl}/v1/zapier/validate`,
							body: {
								email,
							},
							json: true,
						},
					);

					const result = response as IValidateEmailResponse;
					returnData.push({
						json: result,
						pairedItem: { item: i },
					});
				} else if (operation === 'validateBatch') {
					// Validate Batch
					const emails = this.getNodeParameter('emails', i) as string;
					const label = this.getNodeParameter('label', i, '') as string;

					const body: any = {
						emails,
					};

					if (label) {
						body.label = label;
					}

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'campaignKitApi',
						{
							method: 'POST',
							url: `${baseUrl}/v1/zapier/validate/batch`,
							body,
							json: true,
						},
					);

					const result = response as IValidateBatchResponse;
					returnData.push({
						json: result,
						pairedItem: { item: i },
					});
				} else if (operation === 'getJobStatus') {
					// Get Job Status
					const jobId = this.getNodeParameter('jobId', i) as number;

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'campaignKitApi',
						{
							method: 'GET',
							url: `${baseUrl}/v1/zapier/jobs/${jobId}`,
							json: true,
						},
					);

					const result = response as IJobStatusResponse;
					returnData.push({
						json: result,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: errorMessage,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), errorMessage, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
