import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const distPath = join(process.cwd(), 'dist');
const indexPath = join(distPath, 'index.html');

if (!existsSync(indexPath)) {
  console.error('❌ index.html not found at:', indexPath);
  process.exit(1);
}

try {
  let html = readFileSync(indexPath, 'utf-8');
  
  console.log('📄 Original HTML (first 500 chars):');
  console.log(html.substring(0, 500));
  console.log('\n');
  
  // Find all script and link tags
  const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/g;
  const linkRegex = /<link[^>]*href=["']([^"']+)["'][^>]*>/g;
  
  console.log('🔍 Found script tags:');
  let match;
  const scriptPaths = [];
  while ((match = scriptRegex.exec(html)) !== null) {
    console.log(`  - ${match[1]}`);
    scriptPaths.push(match[1]);
  }
  
  console.log('🔍 Found link tags:');
  const linkPaths = [];
  while ((match = linkRegex.exec(html)) !== null) {
    console.log(`  - ${match[1]}`);
    linkPaths.push(match[1]);
  }
  
  // Check if we have problematic paths
  const hasSrcMain = scriptPaths.some(p => p.includes('/src/main'));
  let mainJsFile = null;
  
  if (hasSrcMain) {
    console.log('⚠️ WARNING: Found /src/main.tsx path - this should be compiled by Vite!');
    console.log('🔧 This is a critical error - the build may have failed or HTML was not transformed correctly');
    console.log('🔧 Attempting to find compiled assets...');
    const fs = require('fs');
    const path = require('path');
    
    // Look for compiled main file in assets directory
    const assetsDir = path.join(distPath, 'assets');
    if (fs.existsSync(assetsDir)) {
      const assetFiles = fs.readdirSync(assetsDir);
      console.log('📦 Found files in assets:', assetFiles);
      
      // Find the main entry file (usually starts with main- or index-)
      mainJsFile = assetFiles.find(f => 
        (f.startsWith('main-') || f.startsWith('index-')) && f.endsWith('.js')
      );
      
      if (mainJsFile) {
        console.log(`✅ Found compiled main file: ${mainJsFile}`);
      } else {
        // Try to find any JS file that might be the entry
        const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
        if (jsFiles.length > 0) {
          mainJsFile = jsFiles[0];
          console.log(`⚠️ Using first JS file found as fallback: ${mainJsFile}`);
        }
      }
    } else {
      console.log('❌ Assets directory not found!');
    }
  }
  
  // Reset regex
  scriptRegex.lastIndex = 0;
  linkRegex.lastIndex = 0;
  
  // ULTRA AGGRESSIVE FIX: Fix ALL absolute paths that don't start with /Mapas/
  console.log('🔧 Starting aggressive path fixing...');
  
  // Count how many replacements we make
  let replacementCount = 0;
  
  // Fix all double-quoted paths - MOST AGGRESSIVE
  html = html.replace(/(src|href)=["']\/([^"']+)["']/g, (match, attr, path) => {
    // Skip if already has Mapas/ or if it's a full URL (http/https/data)
    if (path.startsWith('Mapas/') || 
        path.startsWith('http://') || 
        path.startsWith('https://') || 
        path.startsWith('//') ||
        path.startsWith('data:')) {
      return match;
    }
    
    // Special handling for /src/main.tsx - this should NEVER be in production
    if (path.startsWith('src/main')) {
      console.log(`  ⚠️ CRITICAL: Found /src/main.tsx - attempting to fix...`);
      
      if (mainJsFile) {
        const fixed = `${attr}="/Mapas/assets/${mainJsFile}"`;
        console.log(`  ✅ Fixed /src/main.tsx to compiled file: ${fixed}`);
        replacementCount++;
        return fixed;
      } else {
        console.log(`  ⚠️ Could not find compiled file, using fallback...`);
        // Fallback: fix to /Mapas/src/main.tsx (won't work but at least consistent)
        const fixed = `${attr}="/Mapas/${path}"`;
        console.log(`  ⚠️ Fallback fix: ${match} -> ${fixed}`);
        replacementCount++;
        return fixed;
      }
    }
    
    const fixed = `${attr}="/Mapas/${path}"`;
    console.log(`  ✓ Fixing: ${match} -> ${fixed}`);
    replacementCount++;
    return fixed;
  });
  
  // Fix single-quoted paths
  html = html.replace(/(src|href)=[']\/([^']+)[']/g, (match, attr, path) => {
    if (path.startsWith('Mapas/') || 
        path.startsWith('http://') || 
        path.startsWith('https://') || 
        path.startsWith('//') ||
        path.startsWith('data:')) {
      return match;
    }
    const fixed = `${attr}='/Mapas/${path}'`;
    console.log(`  ✓ Fixing single-quoted: ${match} -> ${fixed}`);
    replacementCount++;
    return fixed;
  });
  
  // Fix unquoted attributes
  html = html.replace(/(src|href)=\/([^ >"']+)/g, (match, attr, path) => {
    if (path.startsWith('Mapas/') || 
        path.startsWith('http://') || 
        path.startsWith('https://') || 
        path.startsWith('//') ||
        path.startsWith('data:')) {
      return match;
    }
    const fixed = `${attr}=/Mapas/${path}`;
    console.log(`  ✓ Fixing unquoted: ${match} -> ${fixed}`);
    replacementCount++;
    return fixed;
  });
  
  // Fix any double /Mapas/Mapas/
  html = html.replace(/\/Mapas\/Mapas\//g, '/Mapas/');
  
  console.log(`\n✅ Made ${replacementCount} path replacements\n`);
  
  // Final verification - check if there are still problematic paths
  const problematicRegex = /(src|href)=["']\/(?!Mapas\/)(?!http)(?!\/\/)(?!data:)([^"']+)["']/g;
  const problematic = [];
  let probMatch;
  while ((probMatch = problematicRegex.exec(html)) !== null) {
    problematic.push(probMatch[0]);
  }
  
  if (problematic.length > 0) {
    console.log('⚠️ WARNING: Still found problematic paths:');
    problematic.forEach(p => console.log(`  - ${p}`));
    // Force fix them one more time
    html = html.replace(/(src|href)=["']\/(?!Mapas\/)(?!http)(?!\/\/)(?!data:)([^"']+)["']/g, (match, attr, path) => {
      const fixed = `${attr}="/Mapas/${path}"`;
      console.log(`  🔧 Force-fixing: ${match} -> ${fixed}`);
      return fixed;
    });
    console.log('✅ Force-fixed remaining problematic paths');
  } else {
    console.log('✅ No problematic paths found - all paths are correct!');
  }
  
  writeFileSync(indexPath, html, 'utf-8');
  console.log('\n✅ Fixed paths in index.html\n');
  
  console.log('📄 Fixed HTML (first 500 chars):');
  console.log(html.substring(0, 500));
  console.log('\n');
  
  console.log('🔍 Fixed script tags:');
  while ((match = scriptRegex.exec(html)) !== null) {
    console.log(`  - ${match[1]}`);
  }
  
} catch (error) {
  console.error('❌ Error fixing paths:', error.message);
  console.error(error.stack);
  process.exit(1);
}


