#!/usr/bin/env node

/**
 * Quick start script for FinanceQuest development
 * Usage: node scripts/quickstart.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n`)
};

// Check if .env exists
function checkEnvFile() {
  log.title('Checking environment configuration...');
  
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      log.warning('.env file not found. Creating from .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      log.success('.env file created. Please update with your Firebase credentials.');
      return false;
    } else {
      log.error('No .env or .env.example file found!');
      return false;
    }
  }
  
  log.success('.env file found');
  return true;
}

// Check Node version
function checkNodeVersion() {
  log.title('Checking Node.js version...');
  
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (majorVersion < 16) {
    log.error(`Node.js version ${nodeVersion} is too old. Please upgrade to v16 or higher.`);
    return false;
  }
  
  log.success(`Node.js ${nodeVersion} ✓`);
  return true;
}

// Install dependencies
function installDependencies() {
  log.title('Installing dependencies...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    log.success('Dependencies installed successfully');
    return true;
  } catch (error) {
    log.error('Failed to install dependencies');
    return false;
  }
}

// Create required directories
function createDirectories() {
  log.title('Creating directory structure...');
  
  const dirs = [
    'src/components/common',
    'src/components/features',
    'src/contexts',
    'src/data',
    'src/hooks',
    'src/pages',
    'src/services',
    'src/styles',
    'src/utils',
    'src/assets/images',
    'src/assets/icons'
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log.info(`Created ${dir}`);
    }
  });
  
  log.success('Directory structure ready');
  return true;
}

// Initialize Firebase (check config)
function checkFirebaseConfig() {
  log.title('Checking Firebase configuration...');
  
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => 
    !envContent.includes(varName) || envContent.includes(`${varName}=your_`)
  );
  
  if (missingVars.length > 0) {
    log.warning('Missing Firebase configuration:');
    missingVars.forEach(varName => log.warning(`  - ${varName}`));
    log.info('\nPlease update your .env file with Firebase credentials from:');
    log.info('https://console.firebase.google.com/project/YOUR_PROJECT/settings/general');
    return false;
  }
  
  log.success('Firebase configuration found');
  return true;
}

// Run development server
function runDevServer() {
  log.title('Starting development server...');
  log.info('Starting Vite dev server on http://localhost:5173');
  log.info('Press Ctrl+C to stop\n');
  
  try {
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    // User pressed Ctrl+C
    log.info('\nDevelopment server stopped');
  }
}

// Main function
async function main() {
  console.clear();
  log.title('🚀 FinanceQuest Quick Start');
  
  // Run checks
  const checks = [
    { name: 'Node.js version', fn: checkNodeVersion },
    { name: 'Environment file', fn: checkEnvFile },
    { name: 'Directory structure', fn: createDirectories },
    { name: 'Dependencies', fn: installDependencies },
    { name: 'Firebase config', fn: checkFirebaseConfig }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    if (!check.fn()) {
      allPassed = false;
      if (check.name === 'Node.js version') {
        process.exit(1);
      }
    }
  }
  
  if (!allPassed) {
    log.title('⚠️  Setup incomplete');
    log.warning('Please fix the issues above before continuing.');
    log.info('\nOnce fixed, run this script again: node scripts/quickstart.js');
    process.exit(0);
  }
  
  log.title('✅ All checks passed!');
  log.success('FinanceQuest is ready for development\n');
  
  // Offer to start dev server
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Start development server? (Y/n) ', (answer) => {
    readline.close();
    
    if (answer.toLowerCase() !== 'n') {
      runDevServer();
    } else {
      log.info('\nTo start the server later, run: npm run dev');
      log.info('Happy coding! 🎯');
    }
  });
}

// Run the script
main().catch(error => {
  log.error('Unexpected error:', error.message);
  process.exit(1);
});