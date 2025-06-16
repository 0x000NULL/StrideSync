const fs = require('fs');
const path = require('path');

// List of files to rename (relative to web/src)
const filesToRename = [
  'components/common/StatsCard.js',
  'components/dashboard/RecentRuns.js',
  'components/dashboard/RunStatistics.js',
  'components/dashboard/WeeklySummary.js',
  'components/layout/MainLayout.js',
  'components/runs/RunFilters.js',
  'components/runs/RunForm.js',
  'components/ui/ErrorMessage.js',
  'components/ui/LoadingSpinner.js',
  'pages/Dashboard.js',
  'pages/NotFound.js',
  'pages/SettingsPage.js',
  'pages/auth/Login.js',
  'pages/auth/Register.js',
  'pages/runs/Detail.js',
  'pages/runs/Form.js',
  'pages/runs/List.js'
];

const webSrcPath = path.join(__dirname, 'apps/web/src');

// Rename files and update imports
filesToRename.forEach(oldRelativePath => {
  const oldPath = path.join(webSrcPath, oldRelativePath);
  const newPath = oldPath.replace(/\.js$/, '.jsx');
  
  // Rename the file
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${oldRelativePath} -> ${path.relative(webSrcPath, newPath)}`);
    
    // Update imports in other files
    updateImportsInFiles(oldRelativePath, path.relative(webSrcPath, newPath));
  } else {
    console.warn(`File not found: ${oldPath}`);
  }
});

function updateImportsInFiles(oldImportPath, newImportPath) {
  // Get all JS/JSX/TS/TSX files in src
  const allFiles = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
        allFiles.push(filePath);
      }
    }
  }
  
  walkDir(webSrcPath);
  
  // Update imports in each file
  allFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove .js extension from import paths
      const oldPathWithoutExt = oldImportPath.replace(/\.js$/, '');
      const newPathWithoutExt = newImportPath.replace(/\.jsx$/, '');
      
      // Handle both single and double quotes, with or without .js extension
      const importRegex = new RegExp(`(['"])(${oldPathWithoutExt})(\.js)?(['"])`, 'g');
      const newContent = content.replace(importRegex, `$1${newPathWithoutExt}$4`);
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated imports in: ${path.relative(webSrcPath, filePath)}`);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  });
}

console.log('File renaming and import updates complete!');
