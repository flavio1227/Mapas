import type { Plugin } from 'vite';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export function fixHtmlPaths(): Plugin {
  return {
    name: 'fix-html-paths',
    apply: 'build',
    generateBundle(options, bundle) {
      // This runs during the build, after all assets are generated
      // We need to fix the HTML after all chunks are created
    },
    writeBundle() {
      // This runs after all files are written
      const distPath = join(process.cwd(), 'dist');
      const indexPath = join(distPath, 'index.html');
      
      if (!existsSync(indexPath)) {
        console.error('❌ index.html not found at:', indexPath);
        return;
      }
      
      try {
        let html = readFileSync(indexPath, 'utf-8');
        
        // Find the actual compiled main file
        const assetsDir = join(distPath, 'assets');
        let mainJsFile = null;
        
        if (existsSync(assetsDir)) {
          const files = readdirSync(assetsDir);
          mainJsFile = files.find((f: string) => 
            (f.startsWith('main-') || f.startsWith('index-')) && f.endsWith('.js')
          ) || files.find((f: string) => f.endsWith('.js'));
        }
        
        // CRITICAL: Replace /src/main.tsx with the actual compiled file
        if (mainJsFile) {
          // Replace all variations
          html = html.replace(/src=["']\/src\/main\.tsx["']/gi, `src="/Mapas/assets/${mainJsFile}"`);
          html = html.replace(/src=[']\/src\/main\.tsx[']/gi, `src='/Mapas/assets/${mainJsFile}'`);
          html = html.replace(/src=\/src\/main\.tsx/gi, `src=/Mapas/assets/${mainJsFile}`);
          html = html.replace(/src=["']\/src\/main["']/gi, `src="/Mapas/assets/${mainJsFile}"`);
          html = html.replace(/src=[']\/src\/main[']/gi, `src='/Mapas/assets/${mainJsFile}'`);
          console.log(`✅ Replaced /src/main.tsx with /Mapas/assets/${mainJsFile}`);
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
          console.error('HTML content:', finalHtml);
        }
      } catch (error: any) {
        console.error('❌ Error fixing HTML paths:', error.message);
      }
    }
  };
}
