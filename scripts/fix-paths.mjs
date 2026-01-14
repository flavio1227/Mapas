import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Ensure we're in the right directory
const cwd = process.cwd();
console.log('📂 Current working directory:', cwd);

const distPath = join(cwd, 'dist');
const indexPath = join(distPath, 'index.html');

console.log('📂 Looking for index.html at:', indexPath);

if (!existsSync(indexPath)) {
  console.error('❌ index.html not found at:', indexPath);
  process.exit(1);
}

try {
  let html = readFileSync(indexPath, 'utf-8');
  
  console.log('📄 Original HTML:');
  console.log(html);
  console.log('\n');
  
  // Find compiled main file FIRST
  const assetsDir = join(distPath, 'assets');
  let mainJsFile = null;
  
  if (existsSync(assetsDir)) {
    const files = readdirSync(assetsDir);
    console.log('📦 Files in assets:', files);
    
    // Find main entry file - try multiple patterns
    mainJsFile = files.find(f => f.startsWith('main-') && f.endsWith('.js')) ||
                 files.find(f => f.startsWith('index-') && f.endsWith('.js')) ||
                 files.find(f => f.includes('main') && f.endsWith('.js')) ||
                 files.find(f => f.endsWith('.js'));
    
    if (mainJsFile) {
      console.log(`✅ Found compiled main file: ${mainJsFile}`);
    } else {
      console.log('❌ No compiled JS file found!');
    }
  } else {
    console.log('❌ Assets directory not found!');
  }
  
  // CRITICAL FIX: Replace /src/main.tsx with actual compiled file
  // Try ALL possible variations - be EXTREMELY aggressive
  const hasSrcMain = html.includes('src/main.tsx') || html.includes('/src/main') || html.includes('src="/src/') || html.includes("src='/src/");
  
  if (hasSrcMain) {
    console.log('⚠️ Found /src/main.tsx in HTML - fixing...');
    console.log('🔍 HTML contains src/main:', html.includes('src/main.tsx'));
    console.log('🔍 HTML contains /src/main:', html.includes('/src/main'));
    
    if (mainJsFile) {
      console.log(`🔧 Replacing with: /Mapas/assets/${mainJsFile}`);
      // Replace ALL possible variations - be very aggressive
      html = html.replace(/src=["']\/src\/main\.tsx["']/gi, `src="/Mapas/assets/${mainJsFile}"`);
      html = html.replace(/src=[']\/src\/main\.tsx[']/gi, `src='/Mapas/assets/${mainJsFile}'`);
      html = html.replace(/src=\/src\/main\.tsx/gi, `src=/Mapas/assets/${mainJsFile}`);
      html = html.replace(/src=["']\/src\/main["']/gi, `src="/Mapas/assets/${mainJsFile}"`);
      html = html.replace(/src=[']\/src\/main[']/gi, `src='/Mapas/assets/${mainJsFile}'`);
      html = html.replace(/src=["']\/src\/main\.tsx/gi, `src="/Mapas/assets/${mainJsFile}"`);
      html = html.replace(/src=[']\/src\/main\.tsx/gi, `src='/Mapas/assets/${mainJsFile}'`);
      // Also try without quotes
      html = html.replace(/src=\/src\/main/gi, `src=/Mapas/assets/${mainJsFile}`);
      console.log(`✅ Replaced all /src/main.tsx variations with /Mapas/assets/${mainJsFile}`);
    } else {
      console.log('⚠️ No compiled file found! Listing all files in dist:');
      try {
        const allFiles = readdirSync(distPath, { recursive: true });
        console.log('All files:', allFiles);
      } catch (e) {
        console.log('Could not list files:', e.message);
      }
      // Fallback: at least fix the path to include /Mapas/
      html = html.replace(/src=["']\/src\/main\.tsx["']/gi, 'src="/Mapas/src/main.tsx"');
      html = html.replace(/src=[']\/src\/main\.tsx[']/gi, "src='/Mapas/src/main.tsx'");
      html = html.replace(/src=\/src\/main\.tsx/gi, 'src=/Mapas/src/main.tsx');
    }
  }
  
  // Fix ALL other absolute paths (but not ones that already have Mapas/)
  html = html.replace(/(src|href)=["']\/([^"']+)["']/g, (match, attr, path) => {
    if (path.startsWith('Mapas/') || path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) {
      return match;
    }
    return `${attr}="/Mapas/${path}"`;
  });
  
  html = html.replace(/(src|href)=[']\/([^']+)[']/g, (match, attr, path) => {
    if (path.startsWith('Mapas/') || path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) {
      return match;
    }
    return `${attr}='/Mapas/${path}'`;
  });
  
  // Fix double Mapas
  html = html.replace(/\/Mapas\/Mapas\//g, '/Mapas/');
  
  writeFileSync(indexPath, html, 'utf-8');
  
  console.log('\n📄 Fixed HTML:');
  console.log(html);
  console.log('\n');
  
  // Final check
  if (html.includes('/src/main')) {
    console.log('❌ WARNING: Still contains /src/main!');
    process.exit(1);
  } else {
    console.log('✅ No /src/main found - HTML is correct!');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
