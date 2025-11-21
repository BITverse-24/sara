import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

// Declare the types for window.electronAPI and window.versions
declare global {
  interface Window {
    electronAPI?: {
      send: (channel: string, data: unknown) => void;
      receive: (channel: string, func: (...args: unknown[]) => void) => void;
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    };
    versions?: {
      node: string;
      chrome: string;
      electron: string;
    };
  }
}

export default function Home(): React.ReactElement {
  const [versions, setVersions] = useState<{
    node: string;
    chrome: string;
    electron: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.versions) {
      setVersions(window.versions);
    }
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.highlight}>Electron + Next.js</span>
        </h1>

        <p className={styles.description}>TypeScript-powered Electron app with Next.js renderer</p>

        {versions && (
          <div className={styles.versions}>
            <h2>Versions</h2>
            <ul>
              <li>Node: {versions.node}</li>
              <li>Chrome: {versions.chrome}</li>
              <li>Electron: {versions.electron}</li>
            </ul>
          </div>
        )}

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Context Isolation ✓</h2>
            <p>Security-first architecture with contextIsolation enabled</p>
          </div>

          <div className={styles.card}>
            <h2>Node Integration ✗</h2>
            <p>nodeIntegration disabled for enhanced security</p>
          </div>

          <div className={styles.card}>
            <h2>TypeScript Strict Mode</h2>
            <p>Full type safety with strict TypeScript configuration</p>
          </div>

          <div className={styles.card}>
            <h2>IPC Bridge</h2>
            <p>Secure communication via preload script and contextBridge</p>
          </div>
        </div>
      </main>
    </div>
  );
}
