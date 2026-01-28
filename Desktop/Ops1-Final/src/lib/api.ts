import {
  Task,
  TaskSubmission,
  AuditReceipt,
  ClientConfiguration,
  DashboardStats,
  ActivityItem,
  ApiResponse,
  PaginatedResponse,
  N8nConfigurePayload,
  N8nExecutePayload,
  N8nWebhookResponse
} from './types';
import { getStoredToken } from './auth';

// ============================================
// Configuration
// ============================================
const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678/webhook';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || N8N_BASE_URL;

// Endpoints
const ENDPOINTS = {
  configure: '/ops1/configure',
  execute: '/ops1/execute',
} as const;

// ============================================
// Base Fetch Utilities
// ============================================
interface FetchOptions extends RequestInit {
  params?: Record<string, string | number>;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = getStoredToken();
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));

    // Handle specific n8n errors
    if (response.status === 403) {
      throw new Error(error.message || 'n8n License Error: Webhook access denied');
    }
    if (response.status === 404) {
      throw new Error(error.message || 'n8n Webhook not found. Check workflow is active.');
    }

    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
}

// ============================================
// n8n JSON API Functions (Recommended for n8n)
// ============================================

/**
 * Upload configuration via JSON payload
 * Reads file content and sends as JSON to n8n webhook
 *
 * @example
 * const receipt = await uploadConfigurationJSON(pdfFile, 'client-001');
 */
export async function uploadConfigurationJSON(
  file: File,
  clientId: string
): Promise<N8nWebhookResponse> {
  // Read file content as text
  const content = await readFileAsText(file);

  const payload: N8nConfigurePayload = {
    client_id: clientId,
    data: {
      content: content,
      filename: file.name,
      uploadedAt: new Date().toISOString(),
    }
  };

  return apiFetch<N8nWebhookResponse>(ENDPOINTS.configure, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Execute task via JSON payload
 * Sends structured data to n8n webhook
 *
 * @example
 * const result = await executeTaskJSON({
 *   clientId: 'client-001',
 *   taskDescription: 'Process sales report',
 *   mode: 'excel',
 *   data: [{ column1: 'value1' }],
 *   schemaWhitelist: []
 * });
 */
export async function executeTaskJSON(request: {
  clientId: string;
  taskDescription: string;
  mode: 'excel' | 'sql';
  data?: Record<string, unknown>[];
  schemaWhitelist?: string[];
}): Promise<N8nWebhookResponse> {
  const payload: N8nExecutePayload = {
    client_id: request.clientId,
    task_description: request.taskDescription,
    mode: request.mode,
    data: request.data || [],
    schema_whitelist: request.schemaWhitelist || [],
  };

  return apiFetch<N8nWebhookResponse>(ENDPOINTS.execute, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Helper to read file as text
async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// ============================================
// FormData API Functions (For file uploads)
// ============================================

/**
 * Submit task via FormData (supports file uploads)
 * Use this when you need to upload actual files
 */
export async function submitTaskFormData(submission: TaskSubmission): Promise<ApiResponse<Task>> {
  const formData = new FormData();
  formData.append('mode', submission.mode);
  formData.append('description', submission.description);

  if (submission.file) {
    formData.append('file', submission.file);
  }
  if (submission.schema) {
    formData.append('schema', submission.schema);
  }
  if (submission.sqlQuery) {
    formData.append('sqlQuery', submission.sqlQuery);
  }

  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.execute}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Task submission failed' }));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
}

/**
 * Upload configuration via FormData (for actual PDF uploads)
 */
export async function uploadConfigurationFormData(
  pdfFile: File,
  clientId: string
): Promise<ApiResponse<void>> {
  const formData = new FormData();
  formData.append('pdf', pdfFile);
  formData.append('client_id', clientId);

  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.configure}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Configuration update failed' }));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
}

// ============================================
// Unified API (Auto-selects best method)
// ============================================

/**
 * Smart task submission - uses JSON for n8n, FormData for file uploads
 */
export async function submitTask(submission: TaskSubmission): Promise<ApiResponse<Task>> {
  // If there's a file, use FormData
  if (submission.file) {
    return submitTaskFormData(submission);
  }

  // Otherwise use JSON (better for n8n)
  const response = await executeTaskJSON({
    clientId: 'current-client', // Should come from auth context
    taskDescription: submission.description,
    mode: submission.mode,
    schemaWhitelist: submission.schema ? [submission.schema] : [],
  });

  return {
    success: response.success,
    data: {
      id: response.receipt_id || `task-${Date.now()}`,
      clientId: 'current-client',
      mode: submission.mode,
      description: submission.description,
      status: response.status === 'BLOCKED' ? 'blocked' : 'processing',
      createdAt: new Date().toISOString(),
    },
    message: response.message,
  };
}

/**
 * Smart configuration upload
 */
export async function requestConfigUpdate(pdfFile: File, clientId?: string): Promise<ApiResponse<void>> {
  const id = clientId || 'current-client';

  // Try JSON first (n8n prefers this)
  try {
    const response = await uploadConfigurationJSON(pdfFile, id);
    return {
      success: response.success,
      message: response.message,
    };
  } catch {
    // Fallback to FormData if JSON fails
    return uploadConfigurationFormData(pdfFile, id);
  }
}

// ============================================
// Task Query APIs
// ============================================

export async function getTasks(
  page = 1,
  pageSize = 10,
  status?: string
): Promise<PaginatedResponse<Task>> {
  // Mock data for development - replace with real API call
  const mockTasks: Task[] = [
    {
      id: 'task-001',
      clientId: 'client-001',
      mode: 'excel',
      description: 'Process Q4 sales report',
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 3500000).toISOString(),
      auditReceiptId: 'audit-001',
    },
    {
      id: 'task-002',
      clientId: 'client-001',
      mode: 'sql',
      description: 'DROP TABLE users; --',
      status: 'blocked',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      auditReceiptId: 'audit-002',
      result: {
        success: false,
        blockedReason: 'SQL Injection Attempt Detected',
      }
    },
    {
      id: 'task-003',
      clientId: 'client-001',
      mode: 'excel',
      description: 'Export customer emails and SSN',
      status: 'blocked',
      createdAt: new Date(Date.now() - 5400000).toISOString(),
      auditReceiptId: 'audit-003',
      result: {
        success: false,
        blockedReason: 'PII Data Export Blocked',
      }
    },
    {
      id: 'task-004',
      clientId: 'client-001',
      mode: 'excel',
      description: 'Generate monthly inventory report',
      status: 'completed',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      completedAt: new Date(Date.now() - 1700000).toISOString(),
      auditReceiptId: 'audit-004',
    },
    {
      id: 'task-005',
      clientId: 'client-001',
      mode: 'sql',
      description: 'SELECT * FROM orders WHERE date > 2024-01-01',
      status: 'completed',
      createdAt: new Date(Date.now() - 900000).toISOString(),
      completedAt: new Date(Date.now() - 850000).toISOString(),
      auditReceiptId: 'audit-005',
    },
    {
      id: 'task-006',
      clientId: 'client-001',
      mode: 'sql',
      description: 'Cleanup duplicate entries in orders table',
      status: 'processing',
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
  ];

  const filtered = status ? mockTasks.filter(t => t.status === status) : mockTasks;

  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
}

export async function getTask(taskId: string): Promise<Task | null> {
  const { items } = await getTasks();
  return items.find(t => t.id === taskId) || null;
}

// ============================================
// Audit APIs
// ============================================

export async function getAuditReceipts(
  page = 1,
  pageSize = 10,
  status?: string
): Promise<PaginatedResponse<AuditReceipt>> {
  const mockReceipts: AuditReceipt[] = [
    {
      id: 'audit-001',
      taskId: 'task-001',
      clientId: 'client-001',
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      status: 'APPROVED',
      mode: 'excel',
      request: {
        description: 'Process Q4 sales report',
        inputHash: 'sha256:abc123def456...',
      },
      response: {
        approved: true,
        output: 'Report generated successfully',
        matchedRules: ['Allow Excel processing', 'Sales data access permitted'],
      },
      complianceChecks: [
        { name: 'Data Classification', passed: true, details: 'Internal data only' },
        { name: 'Access Control', passed: true, details: 'User authorized for sales data' },
        { name: 'Audit Trail', passed: true, details: 'Full audit trail maintained' },
      ],
    },
    {
      id: 'audit-002',
      taskId: 'task-002',
      clientId: 'client-001',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'BLOCKED',
      mode: 'sql',
      request: {
        description: 'DROP TABLE users; --',
        inputHash: 'sha256:malicious789...',
      },
      response: {
        approved: false,
        reason: 'SQL Injection Attempt Detected - DROP statement blocked',
        matchedRules: ['Block destructive SQL operations', 'Prevent SQL injection patterns'],
      },
      complianceChecks: [
        { name: 'SQL Injection Scan', passed: false, details: 'DROP TABLE pattern detected' },
        { name: 'Statement Whitelist', passed: false, details: 'Only SELECT, INSERT, UPDATE allowed' },
        { name: 'Audit Trail', passed: true, details: 'Threat logged and reported' },
      ],
    },
    {
      id: 'audit-003',
      taskId: 'task-003',
      clientId: 'client-001',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      status: 'BLOCKED',
      mode: 'excel',
      request: {
        description: 'Export customer emails and SSN',
        inputHash: 'sha256:pii456...',
      },
      response: {
        approved: false,
        reason: 'PII Detected - SSN and email export requires elevated permissions',
        matchedRules: ['Block PII export', 'SSN masking required'],
      },
      complianceChecks: [
        { name: 'PII Detection', passed: false, details: 'SSN pattern detected in request' },
        { name: 'Data Classification', passed: false, details: 'Sensitive PII requires approval' },
        { name: 'Audit Trail', passed: true, details: 'Attempt logged for compliance review' },
      ],
    },
    {
      id: 'audit-004',
      taskId: 'task-004',
      clientId: 'client-001',
      timestamp: new Date(Date.now() - 1700000).toISOString(),
      status: 'APPROVED',
      mode: 'excel',
      request: {
        description: 'Generate monthly inventory report',
        inputHash: 'sha256:inventory123...',
      },
      response: {
        approved: true,
        output: 'Inventory report generated: 1,247 items processed',
        matchedRules: ['Allow inventory access', 'Report generation permitted'],
      },
      complianceChecks: [
        { name: 'Data Classification', passed: true, details: 'Internal inventory data' },
        { name: 'Access Control', passed: true, details: 'User has inventory permissions' },
        { name: 'Audit Trail', passed: true, details: 'Full audit trail maintained' },
      ],
    },
  ];

  const filtered = status ? mockReceipts.filter(r => r.status === status) : mockReceipts;

  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
}

export async function getAuditReceipt(receiptId: string): Promise<AuditReceipt | null> {
  const { items } = await getAuditReceipts();
  return items.find(r => r.id === receiptId) || null;
}

// ============================================
// Configuration APIs
// ============================================

export async function getConfiguration(): Promise<ClientConfiguration> {
  return {
    id: 'config-001',
    clientId: 'client-001',
    clientName: 'Demo Client',
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    pdfSource: 'client_security_policy_v2.pdf',
    rules: [
      {
        id: 'rule-001',
        category: 'Data Access',
        rule: 'Allow read access to sales and inventory tables',
        confidence: 0.95,
        source: 'Section 3.1',
        extractedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'rule-002',
        category: 'Data Access',
        rule: 'Block access to HR and payroll data',
        confidence: 0.98,
        source: 'Section 3.2',
        extractedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'rule-003',
        category: 'PII Protection',
        rule: 'Mask SSN, credit card numbers in all outputs',
        confidence: 0.99,
        source: 'Section 4.1 - GDPR Compliance',
        extractedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'rule-004',
        category: 'SQL Security',
        rule: 'Block DROP, TRUNCATE, DELETE without WHERE clause',
        confidence: 0.97,
        source: 'Section 5.1 - Database Security',
        extractedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'rule-005',
        category: 'SQL Security',
        rule: 'Whitelist only: orders, products, inventory tables',
        confidence: 0.96,
        source: 'Section 5.2',
        extractedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'rule-006',
        category: 'Operations',
        rule: 'Allow Excel file processing for reports',
        confidence: 0.92,
        source: 'Section 6.1',
        extractedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'rule-007',
        category: 'Audit',
        rule: 'All operations must maintain immutable audit trail',
        confidence: 0.99,
        source: 'Section 7.1 - Compliance',
        extractedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  };
}

// ============================================
// Dashboard APIs (Security-focused Mock Data)
// ============================================

/**
 * Get dashboard statistics with security metrics
 * MOCK DATA - Replace with real n8n endpoint when available
 */
export async function getDashboardStats(clientId?: string): Promise<DashboardStats> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    // Task metrics
    tasksToday: 12,
    tasksPending: 2,
    tasksCompleted: 47,
    tasksBlocked: 3,
    lastActivityAt: new Date(Date.now() - 300000).toISOString(),

    // Security metrics (as requested by Gemini prompt)
    complianceScore: 98,        // 98% compliance
    threatsBlocked: 3,          // SQL injection + PII attempts
    activeRules: 7,             // From configuration
  };
}

/**
 * Get recent activity with security-focused events
 * MOCK DATA - Replace with real n8n endpoint when available
 */
export async function getRecentActivity(clientId?: string, limit = 10): Promise<ActivityItem[]> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const activities: ActivityItem[] = [
    {
      id: 'activity-001',
      type: 'task_completed',
      description: 'Monthly inventory report generated successfully',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      taskId: 'task-004',
    },
    {
      id: 'activity-002',
      type: 'threat_detected',
      description: 'SQL Injection Attempt blocked: DROP TABLE detected',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      taskId: 'task-002',
      severity: 'critical',
      threatType: 'SQL Injection Attempt',
    },
    {
      id: 'activity-003',
      type: 'task_blocked',
      description: 'PII export request denied - SSN detected in output',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      taskId: 'task-003',
      severity: 'high',
      threatType: 'PII Detected',
    },
    {
      id: 'activity-004',
      type: 'task_completed',
      description: 'Q4 sales report processed - 2,341 records',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      taskId: 'task-001',
    },
    {
      id: 'activity-005',
      type: 'config_updated',
      description: 'Security rules updated from client_security_policy_v2.pdf',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'activity-006',
      type: 'threat_detected',
      description: 'Unauthorized table access blocked: hr_salaries',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      severity: 'medium',
      threatType: 'Unauthorized Access',
    },
    {
      id: 'activity-007',
      type: 'task_completed',
      description: 'Customer order summary exported',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'activity-008',
      type: 'task_blocked',
      description: 'Bulk email export blocked - rate limit exceeded',
      timestamp: new Date(Date.now() - 18000000).toISOString(),
      severity: 'low',
      threatType: 'Rate Limit Exceeded',
    },
  ];

  return activities.slice(0, limit);
}

// ============================================
// Export all functions for easy importing
// ============================================
export const api = {
  // JSON methods (for n8n)
  uploadConfigurationJSON,
  executeTaskJSON,

  // FormData methods (for file uploads)
  submitTaskFormData,
  uploadConfigurationFormData,

  // Smart/unified methods
  submitTask,
  requestConfigUpdate,

  // Query methods
  getTasks,
  getTask,
  getAuditReceipts,
  getAuditReceipt,
  getConfiguration,

  // Dashboard
  getDashboardStats,
  getRecentActivity,
};
