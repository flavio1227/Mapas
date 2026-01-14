import type { Plugin } from 'vite';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export function fixHtmlPaths(): Plugin {
  let mainJsFile: string | null = null;
  
  return {
    name: 'fix-html-paths',
    apply: 'build',
    generateBundle(options, bundle) {
      // Find the main entry file from the bundle
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) {
          if (fileName.includes('main') || fileName.includes('index')) {
            mainJsFile = fileName;
            console.log(`✅ Found main entry file in bundle: ${mainJsFile}`);
            break;
          }
        }
      }
      
      // Fallback: find any entry chunk
      if (!mainJsFile) {
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'chunk' && chunk.isEntry) {
            mainJsFile = fileName;
            console.log(`✅ Found entry file in bundle: ${mainJsFile}`);
            break;
          }
        }
      }
    },
    writeBundle() {
      // This runs after all files are written - use this to fix the HTML
      const distPath = join(process.cwd(), 'dist');
      const indexPath = join(distPath, 'index.html');
      
      if (!existsSync(indexPath)) {
        console.error('❌ index.html not found at:', indexPath);
        return;
      }
      
      try {
        let html = readFileSync(indexPath, 'utf-8');
        
        // If we didn't find it in generateBundle, try to find it now
        if (!mainJsFile) {
          const assetsDir = join(distPath, 'assets');
          if (existsSync(assetsDir)) {
            const files = readdirSync(assetsDir);
            mainJsFile = files.find((f: string) => 
              (f.startsWith('main-') || f.startsWith('index-')) && f.endsWith('.js')
            ) || files.find((f: string) => f.endsWith('.js')) || null;
          }
        }
        
        // CRITICAL: Replace /src/main.tsx with the actual compiled file
        if (mainJsFile) {
          // Ensure mainJsFile has the correct path (it might already include 'assets/')
          const mainPath = mainJsFile.startsWith('assets/') 
            ? `/Mapas/${mainJsFile}` 
            : `/Mapas/assets/${mainJsFile}`;
          
          // Replace all variations - be VERY aggressive
          html = html.replace(/src=["']\/src\/main\.tsx["']/gi, `src="${mainPath}"`);
          html = html.replace(/src=[']\/src\/main\.tsx[']/gi, `src='${mainPath}'`);
          html = html.replace(/src=\/src\/main\.tsx/gi, `src=${mainPath}`);
          html = html.replace(/src=["']\/src\/main["']/gi, `src="${mainPath}"`);
          html = html.replace(/src=[']\/src\/main[']/gi, `src='${mainPath}'`);
          html = html.replace(/src=["']\/src\/main\.tsx/gi, `src="${mainPath}"`);
          html = html.replace(/src=[']\/src\/main\.tsx/gi, `src='${mainPath}'`);
          html = html.replace(/src=\/src\/main/gi, `src=${mainPath}`);
          
          console.log(`✅ Replaced /src/main.tsx with ${mainPath}`);
        } else {
          console.warn('⚠️ No compiled main file found!');
        }
        
        // Fix all other absolute paths (but not ones that already have Mapas/)
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
        console.log('✅ HTML paths fixed by Vite plugin');
        
        // Verify
        const finalHtml = readFileSync(indexPath, 'utf-8');
        if (finalHtml.includes('/src/main')) {
          console.error('❌ ERROR: HTML still contains /src/main after fix!');
          console.error('HTML content:', finalHtml.substring(0, 500));
        } else {
          console.log('✅ Verified: No /src/main found in final HTML');
        }
      } catch (error: any) {
        console.error('❌ Error fixing HTML paths:', error.message);
        console.error(error.stack);
      }
    }
  };
}
