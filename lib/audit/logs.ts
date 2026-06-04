import { randomUUID } from 'crypto';
import { AuditLogRecord } from '@/lib/types';

const logs: AuditLogRecord[] = [];

export function recordAuditLog(entry: Omit<AuditLogRecord, 'id' | 'createdAt'>) {
  const log: AuditLogRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry
  };
  logs.unshift(log);
  return log;
}

export function listAuditLogs() {
  return logs;
}
