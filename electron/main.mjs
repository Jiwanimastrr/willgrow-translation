import { app, BrowserWindow, ipcMain, protocol, net } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import crypto from 'crypto';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        }
    });

    if (isDev) {
        win.loadURL('http://localhost:3000');
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    protocol.handle('local-audio', (request) => {
        const requestedPath = decodeURIComponent(request.url.replace('local-audio://', ''));
        if (fs.existsSync(requestedPath)) {
            return net.fetch(`file://${requestedPath}`);
        }
        return new Response('Not Found', { status: 404 });
    });

    protocol.handle('local-img', (request) => {
        const requestedPath = decodeURIComponent(request.url.replace('local-img://', ''));
        if (fs.existsSync(requestedPath)) {
            return net.fetch(`file://${requestedPath}`);
        }
        return new Response('Not Found', { status: 404 });
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-class-data', async () => {
    const appAsarPath = app.getAppPath();
    const possiblePaths = [
        path.join(appAsarPath, '../../../../../Class_Data'),
        path.join(appAsarPath, '../../../../Class_Data'),
        path.join(appAsarPath, '../../../Class_Data'),
        path.join(appAsarPath, '../../Class_Data'),
        path.join(appAsarPath, '../Class_Data'),
        path.join(process.cwd(), '../Class_Data'),
        path.join(process.cwd(), './Class_Data'),
        path.join(app.getPath('downloads'), '통번역수업프로그램', 'Class_Data'),
        path.join(path.dirname(app.getPath('exe')), '../../../../../../Class_Data'),
        path.join(path.dirname(app.getPath('exe')), '../../../../../Class_Data'),
        path.join(path.dirname(app.getPath('exe')), '../../../../Class_Data'),
    ];

    console.log('Checking Class_Data in:', possiblePaths);

    for (const p of possiblePaths) {
        const normalized = path.resolve(p).normalize('NFC');
        const exists = fs.existsSync(normalized);
        console.log(`Checking: ${normalized} -> ${exists ? 'FOUND' : 'NOT FOUND'}`);
        if (exists) {
            try {
                const files = fs.readdirSync(normalized);
                console.log('Successfully found Class_Data at:', normalized);
                return { success: true, path: normalized, files };
            } catch (err) { }
        }
    }
    return { success: false, error: `Class_Data 폴더를 찾을 수 없습니다.` };
});

ipcMain.handle('read-excel', async (event, filePath) => {
    return fs.readFileSync(filePath);
});

ipcMain.handle('tts-speak', async (event, text) => {
    if (!text) return { success: false };
    const tmpFile = path.join(os.tmpdir(), `tts_${crypto.randomBytes(6).toString('hex')}.mp3`);
    const edgeTtsPath = '/Users/jiwanjeon/Library/Python/3.9/bin/edge-tts';

    try {
        const isKorean = /[ㄱ-ㅎ|가-힣]/.test(text);
        const voice = isKorean ? 'ko-KR-SunHiNeural' : 'en-US-EmmaNeural';

        const { execFile } = await import('child_process');
        const execFileAsync = promisify(execFile);

        let args = ['--voice', voice, '--write-media', tmpFile];

        if (text.includes('(') && text.includes(')')) {
            // SSML 모드: 괄호 앞에 0.7초 텀 추가
            const escapedText = text.replace(/[&<>"']/g, (m) => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
            }[m]));
            const ssmlContent = escapedText.replace(/\s*\((.*?)\)/g, " <break time='700ms'/> ($1)");
            const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${isKorean ? 'ko-KR' : 'en-US'}'><voice name='${voice}'>${ssmlContent}</voice></speak>`;
            args.push('--ssml', ssml);
        } else {
            args.push('--text', text);
        }

        await execFileAsync(edgeTtsPath, args);

        if (fs.existsSync(tmpFile)) {
            return { success: true, path: tmpFile };
        } else {
            throw new Error('TTS 파일이 생성되지 않았습니다.');
        }
    } catch (e) {
        console.error('TTS Handler Error:', e);
        return { success: false, error: e.message };
    }
});
