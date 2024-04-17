import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000;
const ip = '0.0.0.0';
export const app = express();
app.use(express.static(path.join(__dirname, '../../public/')));
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/favicon.ico'));
});
app.get('/client.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/client.js'));
});
app.get('/:path/:script', (req, res) => {
    if (req.path.split('.').pop() === "js") {
        res.sendFile(path.join(__dirname, '../client/'
            + req.params.path + "/" + req.params.script));
    }
});
