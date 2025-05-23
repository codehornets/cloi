/**
 * CLI Tools Module
 * 
 * Provides essential command-line interface utilities for:
 * 1. Command execution and network connectivity
 * 2. File system operations (directory creation, debug logging)
 * 
 * This module serves as the foundation for system interactions including
 * terminal commands, network checks, and file operations throughout the application.
 */

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';

/* ───────────────────────── Synchronous Command Execution ────────────────────────────── */
/**
 * Synchronously executes a shell command, capturing stdout and stderr.
 * Includes a timeout to prevent hanging processes.
 * @param {string} cmd - The command to execute.
 * @param {number} [timeout=10000] - Timeout in milliseconds.
 * @returns {{ok: boolean, output: string}} - An object indicating success and the combined output.
 */
export function runCommand(cmd, timeout = 10000) {
  try {
    const out = execSync(`${cmd} 2>&1`, { encoding: 'utf8', timeout });
    return { ok: true, output: out };
  } catch (e) {
    return { ok: false, output: e.stdout?.toString() || e.message };
  }
}

/* ───────────────────────── Network Connectivity Check ────────────────────────────── */
/**
 * Checks for basic network connectivity by pinging a reliable host.
 * @returns {boolean} - True if the network seems reachable.
 */
export function checkNetwork() {
  try {
    // Try to connect to a reliable host
    execSync('ping -c 1 -t 1 8.8.8.8', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/* ──────────────── Check Directory Existence ─────────────────────── */
/**
 * Ensures that a directory exists, creating it if necessary.
 * @param {string} dir - The directory path to ensure.
 * @returns {Promise<void>}
 */
export async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    // Ignore error if directory already exists
    if (err.code !== 'EEXIST') throw err;
  }
}

/* ───────────────────────── Write Debug Log ────────────────────────────── */
/**
 * Writes a debug log file with the history of iterations in a debug session.
 * @param {Array} historyArr - Array of objects with error, patch, and analysis data.
 * @param {string} logPath - The path to write the log file.
 * @returns {Promise<void>}
 */
export async function writeDebugLog(historyArr, logPath) {
  // Ensure the parent directory exists
  await ensureDir(dirname(logPath));
  
  const content = historyArr.map((iteration, i) => {
    return `=== ITERATION ${i + 1} ===\n\n` +
           `ERROR:\n${iteration.error}\n\n` +
           `ANALYSIS:\n${iteration.analysis}\n\n` +
           `PATCH:\n${iteration.patch}\n\n` +
           '='.repeat(50) + '\n\n';
  }).join('');
  
  await fs.writeFile(logPath, content, 'utf8');
} 