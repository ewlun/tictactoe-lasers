import express from 'express';
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;
const ip = '127.0.0.1';

const app = express();
export const server = http.createServer();

app.use(express.static(path.join(__dirname, '../../public/')));
app.use(express.static(path.join(__dirname, '../client/')));

app.listen(port, ip, () => { console.log(`Webserver started on http://${ip}:${port}`) });
server.listen(port + 1, ip);
