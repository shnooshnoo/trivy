import { useEffect, useState } from 'react';
import styles from './scanner.module.css';
import { getScanStatus, startScan } from './api.ts';
import type { ScanResult } from './types.ts';

const POLLING_INTERVAL = 2000;

function App() {
  const [pendingScans, setPendingScans] = useState<string[]>([]);
  const [completedScans, setCompletedScans] = useState<ScanResult[]>([]);
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      pendingScans.forEach((scanId) => {
        getScanStatus(scanId).then((scanResult) => {
          setCompletedScans((prevScans) =>
            prevScans.map((scan) =>
              scan.scanId === scanResult.scanId ? scanResult : scan,
            ),
          );
          if (
            scanResult.status === 'Completed' ||
            scanResult.status === 'Failed'
          ) {
            setPendingScans((pendingScans) =>
              pendingScans.filter((scanId) => scanId !== scanResult.scanId),
            );
          }
        });
      });
    }, POLLING_INTERVAL);
    return () => clearInterval(interval);
  });

  const onScanClick = () => {
    startScan(url).then((re) => {
      setPendingScans((scans) => scans.concat(re.scanId));
      setCompletedScans((scans) => scans.concat(re));
    });
    setUrl('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={onScanClick}>SCAN</button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Scan ID</th>
            <th>Status</th>
            <th>Result</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {completedScans.map((scan) => (
            <tr key={scan.scanId}>
              <td>{scan.scanId}</td>
              <td>{scan.status}</td>
              <td>
                <pre className={styles.results}>
                  {JSON.stringify(scan.result, null, 2)}
                </pre>
              </td>
              <td>{scan.error}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
