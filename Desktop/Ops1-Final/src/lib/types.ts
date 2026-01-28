// User and Auth Types
export interface User {
  id: string;
  email: string;
  clientName: string;
  configId?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Task Types
export type TaskMode = 'excel' | 'sql';
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'blocked' | 'failed';

export interface Task {
  id: string;
  clientId: string;
  mode: TaskMode;
  description: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  auditReceiptId?: string;
  result?: TaskResult;
}

export interface TaskResult {
  success: boolean;
  output?: string;
  error?: string;
  blockedReason?: string;
}

export interface TaskSubmission {
  mode: TaskMode;
  description: string;
  file?: File;
  schema?: string;
  sqlQuery?: string;
}

// Audit Types
export type AuditStatus = 'APPROVED' | 'BLOCKED';

export interface AuditReceipt {
  id: string;
  taskId: string;
  clientId: string;
  timestamp: string;
  status: AuditStatus;
  mode: TaskMode;
  request: {
    description: string;
    inputHash?: string;
  };
  response: {
    approved: boolean;
    reason?: string;
    output?: string;
    matchedRules?: string[];
  };
  complianceChecks: ComplianceCheck[];
}

export interface ComplianceCheck {
  name: string;
  passed: boolean;
  details?: string;
}

// Configuration Types
export interface ConfigurationRule {
  id: string;
  category: string;
  rule: string;
  confidence: number;
  source: string;
  extractedAt: string;
}

export interface ClientConfiguration {
  id: string;
  clientId: string;
  clientName: string;
  rules: ConfigurationRule[];
  lastUpdated: string;
  pdfSource?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard Stats
export interface DashboardStats {
  tasksToday: number;
  tasksPending: number;
  tasksCompleted: number;
  tasksBlocked: number;
  lastActivityAt?: string;
  // Security-focused stats
  complianceScore?: number;      // 0-100 percentage
  threatsBlocked?: number;
  activeRules?: number;
}

export interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_completed' | 'task_blocked' | 'config_updated' | 'threat_detected';
  description: string;
  timestamp: string;
  taskId?: string;
  // Security details
  severity?: 'low' | 'medium' | 'high' | 'critical';
  threatType?: string;  // "PII Detected", "SQL Injection Attempt", etc.
}

// ============================================
// n8n Webhook Payload Types (JSON format)
// ============================================

/**
 * Payload for /ops1/configure webhook
 * Used to upload configuration rules from PDF
 */
export interface N8nConfigurePayload {
  client_id: string;
  data: {
    content: string;        // Extracted text from PDF
    filename?: string;
    uploadedAt?: string;
  };
}

/**
 * Payload for /ops1/execute webhook
 * Used to submit tasks for processing
 */
export interface N8nExecutePayload {
  client_id: string;
  task_description: string;
  mode: 'excel' | 'sql';
  data: Record<string, unknown>[];  // Array of data for Excel processing
  schema_whitelist: string[];       // Allowed tables for SQL mode
}

/**
 * Response from n8n webhooks
 */
export interface N8nWebhookResponse {
  success: boolean;
  receipt_id?: string;
  status?: 'APPROVED' | 'BLOCKED';
  message?: string;
  error?: string;
  blocked_reason?: string;
}
