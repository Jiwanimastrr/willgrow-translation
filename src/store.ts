import { create } from 'zustand';
import { read, utils } from 'xlsx';

export interface DataRow {
    id: string;
    Word?: string;
    Meaning?: string;
    Sentence1?: string;
    Translation1?: string;
    Sentence2?: string;
    Translation2?: string;
    Sentence3?: string;
    Translation3?: string;
    Theme?: string;
    Session?: string;
    isStarred?: boolean;
}

interface AppState {
    classDataPath: string | null;
    logoSrc: string | null;
    excelData: DataRow[];
    themes: string[];
    selectedTheme: string | null;
    selectedSession: string | null;
    currentChapter: number;
    setupError: string | null;

    initialize: () => Promise<void>;
    setTheme: (t: string) => void;
    setSession: (s: string) => void;
    startClass: () => void;
    setChapter: (ch: number) => void;
    toggleStar: (id: string) => void;
    getFilteredData: () => DataRow[];
    getReviewData: () => DataRow[];
}

function parseExcelBuffer(buffer: ArrayBuffer): { themes: string[]; rows: DataRow[] } {
    const workbook = read(buffer, { type: 'buffer' });
    const allRows: DataRow[] = [];
    const themes: string[] = [];

    for (const sheetName of workbook.SheetNames) {
        const ws = workbook.Sheets[sheetName];
        // 시트명에서 테마 추출 (예: "1. home" → "home")
        const themeLabel = sheetName.replace(/^\d+\.\s*/, '').trim();
        themes.push(themeLabel);

        // 4번째 행이 헤더 (0-indexed = 3번째)
        const rawRows = utils.sheet_to_json<any>(ws, { defval: '', header: 1 });

        // 헤더 행 찾기: col[1]에 'word'가 포함된 행 → 그 다음 행부터가 실제 데이터
        let dataStartIdx = -1;
        for (let i = 0; i < rawRows.length; i++) {
            const col1 = String(rawRows[i][1] ?? '').toLowerCase();
            if (col1.includes('word')) {
                dataStartIdx = i + 1; // 'Word (Text)'행 다음부터
                break;
            }
        }

        if (dataStartIdx === -1) continue;

        // 실제 데이터 읽기
        for (let i = dataStartIdx; i < rawRows.length; i++) {
            const row = rawRows[i];
            const word = String(row[1] ?? '').trim();
            if (!word) continue; // 빈 행 스킵

            allRows.push({
                id: `${sheetName}-${i}`,
                Word: word,
                Meaning: String(row[2] || '').trim(),
                Sentence1: String(row[3] || '').trim(),
                Translation1: String(row[4] || '').trim(),
                Sentence2: String(row[5] || '').trim(),
                Translation2: String(row[6] || '').trim(),
                Sentence3: String(row[7] || '').trim(),
                Translation3: String(row[8] || '').trim(),
                Theme: themeLabel,
                Session: undefined,
                isStarred: false,
            });
        }
    }

    return { themes, rows: allRows };
}

// 고품질 TTS: macOS Samantha(원어민), Windows SAPI 사용
let currentAudio: HTMLAudioElement | null = null;

export async function speakText(text: string) {
    if (!text) return;
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }

    const isElectron = !!(window as any).api;

    if (isElectron) {
        try {
            const result = await (window as any).api.ttsSpeakText(text);
            if (result?.success && result.path) {
                const audio = new Audio(`local-audio://${result.path}`);
                currentAudio = audio;
                audio.play().catch(() => {
                    fallbackTTS(text);
                });
                return;
            }
        } catch (e) {
            console.error('Electron TTS Error:', e);
        }
    }
    
    // Web or Electron fallback
    fallbackTTS(text);
}

interface TTSOptions {
    rate?: number;
    pitch?: number;
    volume?: number;
}

function fallbackTTS(text: string, options: TTSOptions = {}) {
    window.speechSynthesis.cancel();
    
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US'; 
    utt.rate = options.rate || 0.9;
    utt.pitch = options.pitch || 1.0;
    utt.volume = options.volume || 1.0;

    // 가용한 목소리 목록 가져오기
    const voices = window.speechSynthesis.getVoices();
    
    // 우선순위: 1. Google US English (고품질), 2. Microsoft Natural, 3. macOS Premium Voices
    const preferredVoices = [
        'Google US English',
        'Microsoft Aria Online',
        'Microsoft Jenny Online',
        'Samantha',
        'Alex',
        'English (United States)'
    ];

    let selectedVoice = null;
    for (const name of preferredVoices) {
        selectedVoice = voices.find(v => v.name.includes(name));
        if (selectedVoice) break;
    }

    if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en-'));
    }

    if (selectedVoice) {
        utt.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utt);
}

// 목소리 로딩 대기 (일부 브라우저 대응)
if (typeof window !== 'undefined' && window.speechSynthesis) {
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
}

export function stopSpeech() {
    currentAudio?.pause();
    currentAudio = null;
    window.speechSynthesis?.cancel();
}

export const useStore = create<AppState>((set, get) => ({
    classDataPath: null,
    logoSrc: null,
    excelData: [],
    themes: [],
    selectedTheme: null,
    selectedSession: null,
    currentChapter: 0,
    setupError: null,

    initialize: async () => {
        try {
            // Electron 환경 확인
            const isElectron = !!(window as any).api;

            if (isElectron) {
                const response = await (window as any).api.getClassData();
                if (!response.success) {
                    set({ setupError: response.error || 'Class_Data 폴더를 찾지 못했습니다.' });
                    return;
                }

                const { path: dirPath, files } = response;
                const excelFile = files.find((f: string) => (f.endsWith('.xlsx') || f.endsWith('.csv')) && !f.startsWith('~$'));
                const logoFile = files.find((f: string) => f.endsWith('.png') || f.endsWith('.jpg'));

                const appLogo = logoFile ? `local-img://${dirPath}/${logoFile}` : null;

                if (!excelFile) {
                    set({ setupError: 'Class_Data 폴더에 .xlsx 또는 .csv 파일이 없습니다.' });
                    return;
                }

                const fullExcelPath = `${dirPath}/${excelFile}`;
                const bufferRes = await (window as any).api.readExcel(fullExcelPath);
                const uint8 = new Uint8Array(bufferRes.data ?? bufferRes);
                const { themes, rows } = parseExcelBuffer(uint8.buffer);

                set({
                    classDataPath: dirPath,
                    logoSrc: appLogo,
                    excelData: rows,
                    themes,
                    setupError: null
                });
            } else {
                // WEB 환경: /data/config.json 또는 직접 파일 경로 정의
                // 여기서는 public/data 폴더에 파일이 있다고 가정하고 시도합니다.
                // 실제 서비스 시에는 파일 업로드 기능을 추가하거나 고정된 파일명을 사용할 수 있습니다.
                
                // 1. 엑셀 데이터 로드 (고정된 파일명 예시: data.xlsx)
                try {
                    const excelResponse = await fetch('/data/vocabulary.xlsx');
                    if (!excelResponse.ok) throw new Error('Web mode: /data/vocabulary.xlsx 를 찾을 수 없습니다.');
                    
                    const arrayBuffer = await excelResponse.arrayBuffer();
                    const { themes, rows } = parseExcelBuffer(arrayBuffer);

                    set({
                        classDataPath: '/data',
                        logoSrc: '/data/logo.png', // 기본 로고 경로
                        excelData: rows,
                        themes,
                        setupError: null
                    });
                } catch (webErr: any) {
                    set({ setupError: '웹 모드: public/data/vocabulary.xlsx 파일을 확인해주세요. (' + webErr.message + ')' });
                }
            }

        } catch (e: any) {
            set({ setupError: e.message });
        }
    },

    setTheme: (t: string) => set({ selectedTheme: t, selectedSession: null }),
    setSession: (s: string) => set({ selectedSession: s }),
    startClass: () => set({ currentChapter: 1 }),
    setChapter: (ch: number) => set({ currentChapter: ch }),

    toggleStar: (id: string) => set((state) => ({
        excelData: state.excelData.map(d => d.id === id ? { ...d, isStarred: !d.isStarred } : d)
    })),

    getFilteredData: () => {
        const { excelData, selectedTheme, selectedSession } = get();
        const filtered = excelData.filter(d =>
            !selectedTheme || d.Theme === selectedTheme
        );
        
        // 사용자 요청: 차시(Day)별로 14개씩 이어서 가져오도록 수정
        // 1차시: 1-14번, 2차시: 15-28번, 3차시: 29-42번...
        const sessionNum = parseInt(selectedSession || '1', 10);
        const startIdx = (sessionNum - 1) * 14;
        return filtered.slice(startIdx, startIdx + 14);
    },

    getReviewData: () => {
        const { excelData } = get();
        const starred = excelData.filter(d => d.isStarred);
        const nonStarred = excelData.filter(d => !d.isStarred);
        const fill = nonStarred.sort(() => 0.5 - Math.random()).slice(0, Math.max(0, 10 - starred.length));
        return [...starred, ...fill].sort(() => 0.5 - Math.random());
    }
}));
