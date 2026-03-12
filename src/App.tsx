import { useEffect, useState } from 'react';
import { useStore, speakText, stopSpeech } from './store';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';

function App() {
    const { initialize, setupError, currentChapter, setChapter } = useStore();

    useEffect(() => {
        initialize();
    }, []);

    return (
        <div className="w-full h-full flex flex-col font-sans overflow-hidden bg-neu-bg">
            {/* Header - Minimal height */}
            <header className="h-[6vh] min-h-[45px] w-full flex items-center justify-between px-6 bg-white shrink-0 border-b border-gray-100 z-50">
                <h1 className="text-gray-800 font-black text-[clamp(1rem,2.8vh,1.3rem)] tracking-tight">
                    통번역 프로그램
                </h1>
                {currentChapter > 0 && (
                    <button
                        onClick={() => setChapter(0)}
                        className="neu-btn px-4 py-1.5 text-xs font-bold"
                    >
                        홈으로
                    </button>
                )}
            </header>

            <main className="flex-1 min-h-0 overflow-hidden relative">
                {setupError ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <div className="neu-panel p-8 text-center text-red-500 max-w-sm">
                            <h2 className="font-bold mb-2">오류</h2>
                            <p className="text-xs">{setupError}</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {currentChapter === 0 && <SetupScreen key="setup" />}
                        {currentChapter > 0 && <LearningScreen key="learning" />}
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
}

function SetupScreen() {
    const { themes, selectedTheme, selectedSession, setTheme, setSession, startClass } = useStore();

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center p-4"
        >
            <div className="neu-panel p-[5vh] w-full max-w-[420px] flex flex-col gap-[3vh]">
                <div className="text-center">
                    <h2 className="text-[3.5vh] font-black text-gray-700 leading-tight">준비하기</h2>
                    <p className="text-[1.8vh] text-gray-400 mt-1 font-medium">테마와 Day를 선택하세요.</p>
                </div>

                <div className="space-y-[2vh]">
                    <div className="flex flex-col gap-1">
                        <label className="text-[1.4vh] font-bold text-gray-400 ml-2">테마</label>
                        <select
                            className="neu-input w-full py-[1.2vh] text-[1.6vh] cursor-pointer appearance-none"
                            value={selectedTheme || ''}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <option value="" disabled>테마 선택</option>
                            {themes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[1.4vh] font-bold text-gray-400 ml-2">데이</label>
                        <select
                            className="neu-input w-full py-[1.2vh] text-[1.6vh] cursor-pointer appearance-none"
                            value={selectedSession || ''}
                            onChange={(e) => setSession(e.target.value)}
                        >
                            <option value="" disabled>Day 선택</option>
                            {[1, 2, 3].map(s => <option key={s} value={s}>Day {s}</option>)}
                        </select>
                    </div>
                </div>

                <button
                    disabled={!selectedTheme || !selectedSession}
                    onClick={startClass}
                    className="neu-btn-blue w-full py-[2vh] text-[2.2vh] font-black disabled:opacity-40"
                >
                    시작 (Start)
                </button>
            </div>
        </motion.div>
    );
}

function LearningScreen() {
    const { currentChapter, setChapter, getFilteredData, getReviewData } = useStore();
    const [data, setData] = useState<any[]>([]);
    const [idx, setIdx] = useState(0);
    const [viewMode, setViewMode] = useState<'study' | 'list'>('study');

    useEffect(() => {
        const s = useStore.getState().selectedSession;
        if (s === '13' || s === '14' || currentChapter === 4) setData(getReviewData());
        else setData(getFilteredData());
    }, [currentChapter]);

    if (data.length === 0) return <div className="h-full flex items-center justify-center text-gray-400">데이터 없음</div>;

    const currentItem = data[idx];
    const goNext = () => { if (idx < data.length - 1) setIdx(idx + 1); };
    const goPrev = () => { if (idx > 0) setIdx(idx - 1); };

    return (
        <div className="w-full h-full flex flex-col items-center overflow-hidden">
            <div className="w-full max-w-3xl px-6 pt-3 flex flex-col gap-2 shrink-0">
                <div className="flex justify-end h-[3.5vh]">
                    <div className="shadow-neu-pressed p-0.5 rounded-xl flex">
                        <button onClick={() => setViewMode('study')} className={`px-4 py-1 rounded-lg text-[1.3vh] font-black transition-all ${viewMode === 'study' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>학습</button>
                        <button onClick={() => setViewMode('list')} className={`px-4 py-1 rounded-lg text-[1.3vh] font-black transition-all ${viewMode === 'list' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>목록</button>
                    </div>
                </div>
                <div className="flex shadow-neu-pressed p-0.5 rounded-[15px] gap-0.5">
                    {['1장 어휘', '2장 통역', '3장 번역'].map((label, i) => (
                        <button
                            key={label}
                            onClick={() => { setChapter(i + 1); setIdx(0); setViewMode('study'); }}
                            className={`flex-1 text-[1.4vh] font-black py-1.5 rounded-[12px] transition-all ${currentChapter === i + 1 ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 w-full flex flex-col items-center justify-center p-[2vh] min-h-0 max-w-4xl mx-auto overflow-hidden">
                <AnimatePresence mode="wait">
                    {viewMode === 'list' ? (
                        <GlobalListView key="list" items={data} currentChapter={currentChapter} />
                    ) : (
                        <motion.div
                            key={`ch-${currentChapter}-${idx}`}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="w-full h-full flex flex-col min-h-0"
                        >
                            {currentChapter === 1 && <Ch1Flashcard item={currentItem} onNext={goNext} onPrev={goPrev} progress={`${idx + 1}/${data.length}`} />}
                            {currentChapter === 2 && <Ch2Interpretation item={currentItem} onNext={goNext} progress={`${idx + 1}/${data.length}`} />}
                            {currentChapter === 3 && <Ch3Translation item={currentItem} onNext={goNext} progress={`${idx + 1}/${data.length}`} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function StarButton({ item }: { item: any }) {
    const { toggleStar } = useStore();
    return (
        <button
            onClick={(e) => { e.stopPropagation(); toggleStar(item.id); }}
            className="p-[0.8vh] neu-btn w-[4.5vh] h-[4.5vh] absolute top-[1.5vh] right-[1.5vh] z-10"
        >
            <Star className={`w-[2.2vh] h-[2.2vh] ${item.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
    );
}

function GlobalListView({ items, currentChapter }: { items: any[], currentChapter: number }) {
    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="neu-panel w-full flex-1 flex flex-col overflow-hidden">
                <div className="p-[2vh] border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h3 className="font-black text-[2vh] text-gray-700">{currentChapter}장 목록 ({items.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-[1.5vh] space-y-[1vh]">
                    {items.map((item, i) => (
                        <button key={item.id} onClick={() => speakText(item.Word || item.Sentence1)} className="group w-full flex items-center gap-3 p-[1.5vh] rounded-2xl bg-neu-bg hover:shadow-neu-pressed transition-all text-left">
                            <span className="text-[1.4vh] font-bold text-gray-300 group-hover:text-liquid-blue">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[1.8vh] text-gray-600 truncate">{currentChapter === 2 ? (item.Translation1 || item.Meaning) : (item.Word || item.Sentence1)}</h4>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// CH1: 어휘
function Ch1Flashcard({ item, onNext, onPrev, progress }: any) {
    const [revealed, setRevealed] = useState(false);
    const [viewMode, setViewMode] = useState<'EN' | 'KR'>('EN');

    useEffect(() => { setRevealed(false); return () => stopSpeech(); }, [item, viewMode]);

    const handleAction = () => { if (!revealed) setRevealed(true); else onNext(); };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') return;
            if (e.code === 'Enter') { e.preventDefault(); handleAction(); }
            if (e.code === 'Space' || e.code === 'ArrowDown') { e.preventDefault(); speakText(item.Word); }
            if (e.code === 'ArrowRight') onNext(); if (e.code === 'ArrowLeft') onPrev();
        };
        window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
    }, [item, revealed]);

    return (
        <div className="flex-1 w-full flex flex-col gap-[1.5vh] min-h-0">
            <span className="text-center text-[1.4vh] font-bold text-gray-400 shrink-0">{progress}</span>
            <div className="flex justify-center shrink-0 h-[4vh]">
                <div className="shadow-neu-pressed p-0.5 rounded-lg flex">
                    <button onClick={() => setViewMode('EN')} className={`px-4 py-0.5 text-[1.2vh] font-black rounded-md ${viewMode === 'EN' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>EN</button>
                    <button onClick={() => setViewMode('KR')} className={`px-4 py-0.5 text-[1.2vh] font-black rounded-md ${viewMode === 'KR' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>KR</button>
                </div>
            </div>
            
            <div className="neu-panel flex-1 min-h-0 flex flex-col p-[4vh] relative items-center justify-center overflow-hidden">
                <StarButton item={item} />
                <button onClick={() => speakText(item.Word)} className="absolute top-[1.5vh] left-[1.5vh] neu-btn w-[4.5vh] h-[4.5vh]">
                    <Volume2 className="w-[2.2vh] h-[2.2vh] text-liquid-blue" />
                </button>
                <div className="w-full flex flex-col items-center justify-center gap-[3vh] h-full min-h-0">
                    <div className="text-center shrink-0">
                        <p className="text-[1.3vh] font-black text-gray-300 tracking-widest mb-1">{viewMode === 'EN' ? 'WORD' : 'MEANING'}</p>
                        <h2 className="text-[clamp(1.5rem,7vh,5.5rem)] font-black text-gray-700 leading-[1.1] break-words px-4">
                            {viewMode === 'EN' ? item.Word : item.Meaning}
                        </h2>
                    </div>
                    {revealed && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="w-full pt-[3vh] border-t border-gray-100 text-center min-h-0 flex flex-col">
                            <span className="text-liquid-blue font-black text-[1.3vh] mb-1">ANSWER</span>
                            <p className="text-[clamp(1.2rem,5vh,4rem)] font-bold text-gray-500 leading-tight truncate px-4">
                                {viewMode === 'EN' ? item.Meaning : item.Word}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Bottom bar - Click to next only */}
            <div className="flex justify-center shrink-0 h-[6vh] mb-1">
                <button onClick={onNext} className="neu-btn-blue px-10 text-[1.6vh] font-black rounded-2xl">
                    다음 (Next)
                </button>
            </div>
        </div>
    );
}

// CH2: 통역
function Ch2Interpretation({ item, onNext, progress }: any) {
    const [revealed, setRevealed] = useState(false);
    const [textVal, setTextVal] = useState('');
    useEffect(() => { setRevealed(false); setTextVal(''); return () => stopSpeech(); }, [item]);

    const handleAction = () => { if (!revealed) setRevealed(true); else onNext(); };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') { if (e.code === 'Enter') handleAction(); return; }
            if (e.code === 'Enter') handleAction();
            if (e.code === 'Space' || e.code === 'ArrowDown') { e.preventDefault(); speakText(item.Sentence1 || item.Word); }
        };
        window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
    }, [item, revealed]);

    return (
        <div className="flex-1 w-full flex flex-col gap-[1.5vh] min-h-0">
            <span className="text-center text-[1.4vh] font-bold text-gray-400 shrink-0">{progress}</span>
            <div className="neu-panel flex-1 min-h-0 flex flex-col p-[4vh] relative items-center justify-center">
                <StarButton item={item} />
                <div className="flex flex-col items-center justify-center gap-[3vh] w-full h-full min-h-0">
                    <div className="flex flex-col items-center shrink-0">
                        <button onClick={() => speakText(item.Sentence1 || item.Word)} className="w-[11vh] h-[11vh] rounded-full neu-btn mb-2">
                            <Volume2 className="w-[5.5vh] h-[5.5vh] text-liquid-blue" />
                        </button>
                        <p className="text-[1.5vh] font-bold text-gray-400 uppercase">LISTEN & INTERPRET</p>
                    </div>
                    {revealed && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="w-full pt-[3vh] border-t border-gray-100 text-center min-h-0">
                            <span className="text-liquid-blue font-black text-[1.3vh] mb-1 uppercase">ANSWER</span>
                            <p className="text-[clamp(1.1rem,4.5vh,2.5rem)] font-black text-gray-700 leading-tight">
                                {item.Sentence1 || item.Word}
                            </p>
                            <p className="text-[1.8vh] text-gray-400 mt-1">{item.Translation1}</p>
                        </motion.div>
                    )}
                </div>
            </div>
            <div className="shrink-0 flex justify-center h-[7vh] min-h-[50px] mb-1">
                <input autoFocus className="neu-input w-full p-3 text-[2vh] text-center" placeholder="듣고 해석하세요... (Enter로 확인)" value={textVal} onChange={e => setTextVal(e.target.value)} />
            </div>
        </div>
    );
}

// CH3: 번역
function Ch3Translation({ item, onNext, progress }: any) {
    const [revealed, setRevealed] = useState(false);
    const [textVal, setTextVal] = useState('');
    const [viewMode, setViewMode] = useState<'EN' | 'KR'>('EN');

    useEffect(() => { setRevealed(false); setTextVal(''); return () => stopSpeech(); }, [item, viewMode]);

    const handleAction = () => { if (!revealed) setRevealed(true); else onNext(); };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') { if (e.code === 'Enter') handleAction(); return; }
        };
        window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
    }, [item, revealed]);

    return (
        <div className="flex-1 w-full flex flex-col gap-[1.5vh] min-h-0">
            <span className="text-center text-[1.4vh] font-bold text-gray-400 shrink-0">{progress}</span>
            <div className="flex justify-center shrink-0 h-[4vh]">
                <div className="shadow-neu-pressed p-0.5 rounded-lg flex">
                    <button onClick={() => setViewMode('EN')} className={`px-4 py-0.5 text-[1.2vh] font-black rounded-md ${viewMode === 'EN' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>EN</button>
                    <button onClick={() => setViewMode('KR')} className={`px-4 py-0.5 text-[1.2vh] font-black rounded-md ${viewMode === 'KR' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>KR</button>
                </div>
            </div>
            <div className="neu-panel flex-1 min-h-0 flex flex-col p-[4vh] relative items-center justify-center">
                <StarButton item={item} />
                <button onClick={() => speakText(item.Sentence1 || item.Word)} className="absolute top-[1.5vh] left-[1.5vh] neu-btn w-[4.5vh] h-[4.5vh]">
                    <Volume2 className="w-[2.2vh] h-[2.2vh] text-liquid-blue" />
                </button>
                <div className="w-full flex flex-col items-center justify-center gap-[3vh] h-full min-h-0">
                    <div className="text-center shrink-0 px-4">
                        <h2 className="text-[clamp(1.1rem,4.5vh,3.2rem)] font-black text-gray-700 leading-tight">
                            {viewMode === 'EN' ? (item.Sentence1 || item.Word) : (item.Translation1 || item.Meaning)}
                        </h2>
                    </div>
                    {revealed && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="w-full pt-[3vh] border-t border-gray-100 text-center min-h-0">
                            <span className="text-liquid-blue font-black text-[1.3vh] mb-1 uppercase">ANSWER</span>
                            <p className="text-[clamp(1rem,4.5vh,2.8rem)] font-black text-gray-500 leading-tight">
                                {viewMode === 'EN' ? (item.Translation1 || item.Meaning) : (item.Sentence1 || item.Word)}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
            <div className="shrink-0 flex justify-center h-[7vh] min-h-[50px] mb-1">
                <input autoFocus className="neu-input w-full p-3 text-[2vh] text-center" placeholder="번역을 입력하고 Enter를 누르세요" value={textVal} onChange={e => setTextVal(e.target.value)} />
            </div>
        </div>
    );
}

export default App;
