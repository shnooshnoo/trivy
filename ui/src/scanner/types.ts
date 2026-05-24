export interface startScanResponse {
  scanId: string;
  status: string;
}

export interface ScanResult extends startScanResponse {
  result?: string;
  error?: string;
}

export interface Vulnerability {
  Severity: string;
}
