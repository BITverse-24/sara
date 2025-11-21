import * as fs from 'fs';
import * as path from 'path';

interface IPCHandler {
  channel: string;
  modulePath: string;
}

interface IPCManifest {
  handlers: IPCHandler[];
}

/**
 * Recursively find all TypeScript files in a directory
 */
function findTsFiles(dir: string, baseDir: string): string[] {
  const files: string[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findTsFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Derive channel name from file path
 * Example: src/ipc/example/ping.ts -> ipc:/example/ping
 */
function deriveChannel(filePath: string, ipcDir: string): string {
  const relativePath = path.relative(ipcDir, filePath);
  const withoutExt = relativePath.replace(/\.ts$/, '');
  return `ipc:/${withoutExt}`;
}

/**
 * Validate that a TypeScript file has a default export
 */
async function validateDefaultExport(filePath: string): Promise<boolean> {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf-8');

    // Simple check for default export syntax
    // This checks for common patterns like:
    // - export default function
    // - export default async function
    // - export default class
    // - export default
    const hasDefaultExport =
      /export\s+default\s+(async\s+)?function/.test(content) ||
      /export\s+default\s+class/.test(content) ||
      /export\s+default\s+/.test(content);

    return hasDefaultExport;
  } catch (error) {
    console.error(`Error validating ${filePath}:`, error);
    return false;
  }
}

/**
 * Generate IPC manifest
 */
async function generateManifest(): Promise<void> {
  const projectRoot = path.resolve(__dirname, '..');
  const ipcDir = path.join(projectRoot, 'src', 'ipc');
  const buildDir = path.join(projectRoot, 'build');
  const manifestPath = path.join(buildDir, 'ipc-manifest.json');

  // Check if ipc directory exists
  if (!fs.existsSync(ipcDir)) {
    console.error(`IPC directory not found: ${ipcDir}`);
    process.exit(1);
  }

  // Find all TypeScript files
  const tsFiles = findTsFiles(ipcDir, ipcDir);

  if (tsFiles.length === 0) {
    console.warn('No TypeScript files found in IPC directory');
  }

  // Process each file
  const handlers: IPCHandler[] = [];

  for (const filePath of tsFiles) {
    const hasDefaultExport = await validateDefaultExport(filePath);

    if (!hasDefaultExport) {
      console.error(
        `Error: ${filePath} does not have a default export. All IPC handlers must export a default function.`
      );
      process.exit(1);
    }

    const channel = deriveChannel(filePath, ipcDir);
    const modulePath = path.relative(projectRoot, filePath);

    handlers.push({
      channel,
      modulePath,
    });

    console.log(`✓ Registered handler: ${channel} -> ${modulePath}`);
  }

  // Create build directory if it doesn't exist
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Generate manifest
  const manifest: IPCManifest = {
    handlers,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`\n✓ IPC manifest generated: ${manifestPath}`);
  console.log(`  Total handlers: ${handlers.length}`);
}

// Run the script
generateManifest().catch((error) => {
  console.error('Failed to generate IPC manifest:', error);
  process.exit(1);
});
