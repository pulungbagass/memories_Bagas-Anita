// Script to package Bagas & Anita app into a clean production ZIP
// Run with: node package-project.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_ZIP = 'bagas-anita-production.zip';

console.log('✨ Starting packaging for Bagas & Anita SPA...');
console.log('📦 Target archive:', OUTPUT_ZIP);

// Check if zip command is available (Unix/Mac/Git Bash)
try {
  console.log('⏳ Running zip command...');
  execSync(
    `zip -r "${OUTPUT_ZIP}" . -x "node_modules/*" ".next/*" "dist/*" ".git/*" "${OUTPUT_ZIP}"`,
    { stdio: 'inherit' }
  );
  console.log('🎉 Successfully created archive:', OUTPUT_ZIP);
  process.exit(0);
} catch (unixErr) {
  console.log('ℹ️ zip command not found or failed, attempting PowerShell Compress-Archive (Windows)...');
  try {
    // Windows PowerShell fallback
    execSync(
      `powershell -Command "Compress-Archive -Path * -DestinationPath ${OUTPUT_ZIP} -Force"`,
      { stdio: 'inherit' }
    );
    console.log('🎉 Successfully created archive via PowerShell:', OUTPUT_ZIP);
    process.exit(0);
  } catch (winErr) {
    console.error('❌ Failed to package zip automatically:', winErr.message);
    console.log('💡 Tip: You can manually zip the project folder while excluding node_modules/ and dist/.');
    process.exit(1);
  }
}
