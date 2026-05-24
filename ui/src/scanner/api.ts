import type { ScanResult, startScanResponse } from './types.ts';

export const startScan = async (url) => {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  const response = await fetch('/api/scan', {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({
      url,
    }),
  });
  return (await response.json()) as startScanResponse;
};

export const getScanStatus = async (scanId: string) => {
  const response = await fetch(`/api/scan/${scanId}`);
  return (await response.json()) as ScanResult;
};
