// API Response Types for CampaignKit Email Validation

export interface IValidateEmailResponse {
	email: string;
	is_valid: boolean;
	is_risky: boolean;
	is_invalid: boolean;
	is_disposable: boolean;
	is_role_email: boolean;
	is_catchall: boolean;
	is_blacklisted: boolean;
	is_free_email: boolean;
	is_mx_found: boolean;
	is_smtp_valid: boolean;
	score: number;
	classifier: string;
	domain: string;
	mx_record: string;
	smtp_provider: string;
	free_email_provider: string;
	did_you_mean: string;
	[key: string]: any;
}

export interface IValidateBatchResponse {
	job_id: number;
	email_count: number;
	status: string;
	label?: string;
	created_at: string;
	[key: string]: any;
}

export interface IJobStatusResponse {
	job_id: number;
	account_id: number;
	label: string;
	state: string;
	email_count: number;
	valid_count: number;
	invalid_count: number;
	risky_count: number;
	deliverable_count: number;
	undeliverable_count: number;
	credits_used: number;
	progress: number;
	created_at: string;
	started_at: string;
	finished_at: string;
	[key: string]: any;
}

export interface IWebhookPayload {
	event: string;
	job_id: number;
	account_id: number;
	label: string;
	state: string;
	email_count: number;
	deliverable_count: number;
	undeliverable_count: number;
	risky_count: number;
	credits_used: number;
	created_at: string;
	finished_at: string;
	[key: string]: any;
}

export interface IWebhookSubscription {
	id: number;
	url: string;
	events: string[];
	secret: string;
	active: boolean;
	created_at: string;
}

export interface IAccountResponse {
	id: number;
	email: string;
	name: string;
	credits: number;
	created_at: string;
}
