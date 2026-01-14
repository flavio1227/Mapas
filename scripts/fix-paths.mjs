import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const distPath = join(process.cwd(), 'dist');
const indexPath = join(distPath, 'index.html');

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
    
    // Find main entry file
    mainJsFile = files.find(f => 
      (f.startsWith('main-') || f.startsWith('index-')) && f.endsWith('.js')
    ) || files.find(f => f.endsWith('.js'));
    
    if (mainJsFile) {
      console.log(`✅ Found compiled main file: ${mainJsFile}`);
    }
  }
  
  // ULTRA SIMPLE: Replace /src/main.tsx with actual compiled file
  if (mainJsFile && html.includes('/src/main.tsx')) {
    html = html.replace(/src=["']\/src\/main\.tsx["']/g, `src="/Mapas/assets/${mainJsFile}"`);
    html = html.replace(/src=["']\/src\/main\.tsx["']/g, `src='/Mapas/assets/${mainJsFile}'`);
    console.log(`✅ Replaced /src/main.tsx with /Mapas/assets/${mainJsFile}`);
  }
  
  // Fix ALL other absolute paths
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
  console.log('\n✅ Done!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
