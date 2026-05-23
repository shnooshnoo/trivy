export enum Status {
  QUEUED = 'Queued',
  CLONING = 'Cloning Repo',
  ANALYZING = 'Analyzing',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export interface ScanStatus {
  scanId: string;
  status: Status;
  result?: string;
  error?: string;
}
