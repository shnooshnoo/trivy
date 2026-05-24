export enum Status {
  QUEUED = 'Queued',
  CLONING = 'Cloning Repo',
  SCANNING = 'Scanning',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export interface ScanStatus {
  scanId: string;
  status: Status;
  result?: string;
  error?: string;
}

export interface Vulnerability {
  Severity: string;
}
