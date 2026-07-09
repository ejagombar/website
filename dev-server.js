// To run: node dev-server.js

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080
const ROOT = __dirname

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.mp4': 'video/mp4',
}

const server = http.createServer((req, res) => {
    // Parse URL to remove query strings
    const urlPath = req.url.split('?')[0]
    let filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath)

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} -> ${filePath}`)

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File doesn't exist - serve index.html for SPA routing
            console.log(`  -> File not found, serving index.html`)
            filePath = path.join(ROOT, 'index.html')
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500)
                res.end('Server error')
                return
            }

            const fileExt = path.extname(filePath).toLowerCase()
            const contentType = mimeTypes[fileExt] || 'application/octet-stream'

            // Cache headers matching production nginx config
            const headers = { 'Content-Type': contentType }
            const immutableExts = ['.woff', '.woff2', '.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico']
            const cacheExts = ['.css', '.js']

            if (immutableExts.includes(fileExt)) {
                headers['Cache-Control'] = 'public, max-age=31536000, immutable'
            } else if (cacheExts.includes(fileExt)) {
                headers['Cache-Control'] = 'public, max-age=604800, must-revalidate'
            } else if (fileExt === '.html') {
                headers['Cache-Control'] = 'public, max-age=3600, must-revalidate'
            }

            res.writeHead(200, headers)
            res.end(content)
        })
    })
})

server.listen(PORT, () => {
    console.log(`Dev server running at http://localhost:${PORT}`)
})
