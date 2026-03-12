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
            <header className="h-[6vh] min-h-[45px] w-full flex items-center justify-between px-6 bg-white shrink-0 border-b border-gray-100 z-50">
                <h1 className="text-gray-800 font-black text-[clamp(0.9rem,2.5vh,1.2rem)] tracking-tight">
                    통번역 프로그램
                </h1>
                {currentChapter > 0 && (
                    <button
                        onClick={() => setChapter(0)}
                        className="neu-btn px-4 py-1 text-xs font-bold"
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
            className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
        >
            <div className="neu-panel p-[5vh] w-full max-w-[400px] flex flex-col gap-[3vh]">
                <div className="text-center">
                    <h2 className="text-[3vh] font-black text-gray-700 leading-tight">준비하기</h2>
                    <p className="text-[1.6vh] text-gray-400 mt-1 font-medium">테마와 Day를 선택하세요.</p>
                </div>

                <div className="space-y-[2vh]">
                    <div className="flex flex-col gap-1">
                        <label className="text-[1.3vh] font-bold text-gray-400 ml-2">테마</label>
                        <select
                            className="neu-input w-full py-[1.2vh] text-[1.5vh] cursor-pointer appearance-none"
                            value={selectedTheme || ''}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <option value="" disabled>테마 선택</option>
                            {themes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[1.3vh] font-bold text-gray-400 ml-2">데이</label>
                        <select
                            className="neu-input w-full py-[1.2vh] text-[1.5vh] cursor-pointer appearance-none"
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
                    className="neu-btn-blue w-full py-[2vh] text-[2vh] font-black disabled:opacity-40"
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
            <div className="w-full max-w-3xl px-6 pt-2 flex flex-col gap-2 shrink-0">
                <div className="flex justify-end h-[3vh]">
                    <div className="shadow-neu-pressed p-0.5 rounded-xl flex">
                        <button onClick={() => setViewMode('study')} className={`px-3 py-1 rounded-lg text-[1.2vh] font-black transition-all ${viewMode === 'study' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>학습</button>
                        <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded-lg text-[1.2vh] font-black transition-all ${viewMode === 'list' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>목록</button>
                    </div>
                </div>
                <div className="flex shadow-neu-pressed p-0.5 rounded-xl gap-0.5 h-[5vh]">
                    {['1장 어휘', '2장 통역', '3장 번역'].map((label, i) => (
                        <button
                            key={label}
                            onClick={() => { setChapter(i + 1); setIdx(0); setViewMode('study'); }}
                            className={`flex-1 text-[1.3vh] font-black rounded-lg transition-all ${currentChapter === i + 1 ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}
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
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                            className="w-full h-full flex flex-col min-h-0 overflow-hidden"
                        >
                            {currentChapter === 1 && <Ch1Flashcard key={`ch1-${idx}`} item={currentItem} onNext={goNext} onPrev={goPrev} progress={`${idx + 1}/${data.length}`} />}
                            {currentChapter === 2 && <Ch2Interpretation key={`ch2-${idx}`} item={currentItem} onNext={goNext} progress={`${idx + 1}/${data.length}`} />}
                            {currentChapter === 3 && <Ch3Translation key={`ch3-${idx}`} item={currentItem} onNext={goNext} progress={`${idx + 1}/${data.length}`} />}
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
            className="neu-btn w-[4vh] h-[4vh] absolute top-3 right-3 z-10"
        >
            <Star className={`w-[2vh] h-[2vh] ${item.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
    );
}

function GlobalListView({ items, currentChapter }: { items: any[], currentChapter: number }) {
    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="neu-panel w-full flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h3 className="font-black text-[2vh] text-gray-700">{currentChapter}장 목록 ({items.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {items.map((item, i) => (
                        <button key={item.id} onClick={() => speakText(item.Word || item.Sentence1)} className="group w-full flex items-center gap-3 p-3 rounded-xl bg-neu-bg hover:shadow-neu-pressed transition-all text-left">
                            <span className="text-xs font-bold text-gray-300 group-hover:text-liquid-blue">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-gray-600 truncate">{currentChapter === 2 ? (item.Translation1 || item.Meaning) : (item.Word || item.Sentence1)}</h4>
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
    const [viewMode, setViewMode] = useState<'EN' | 'KR'>('EN');
    const [revealed, setRevealed] = useState(false);

    useEffect(() => { 
        setRevealed(false);
        return () => stopSpeech(); 
    }, [item, viewMode]);

    const handleAction = () => {
        if (!revealed) setRevealed(true);
        else onNext();
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') return;
            if (e.code === 'Enter') { e.preventDefault(); handleAction(); }
            if (e.code === 'Space' || e.code === 'ArrowDown') { e.preventDefault(); speakText(item.Word); }
            if (e.code === 'ArrowRight') handleAction(); 
            if (e.code === 'ArrowLeft') onPrev();
        };
        window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
    }, [item, onNext, onPrev, revealed]);

    return (
        <div className="flex-1 w-full h-full flex flex-col gap-[1.5vh] min-h-0 overflow-hidden">
            <span className="text-center text-[1.3vh] font-bold text-gray-400 shrink-0">{progress}</span>
            <div className="flex justify-center shrink-0 h-[3.5vh]">
                <div className="shadow-neu-pressed p-0.5 rounded-lg flex">
                    <button onClick={() => setViewMode('EN')} className={`px-4 py-0.5 text-[1.1vh] font-black rounded-md ${viewMode === 'EN' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>EN</button>
                    <button onClick={() => setViewMode('KR')} className={`px-4 py-0.5 text-[1.1vh] font-black rounded-md ${viewMode === 'KR' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>KR</button>
                </div>
            </div>
            
            <div className="neu-panel flex-1 min-h-0 flex flex-col p-8 relative overflow-hidden">
                <StarButton item={item} />
                <button onClick={() => speakText(item.Word)} className="absolute top-3 left-3 neu-btn w-[4vh] h-[4vh]">
                    <Volume2 className="w-[2vh] h-[2vh] text-liquid-blue" />
                </button>
                
                <div className="w-full h-full flex flex-col items-center justify-center overflow-y-auto custom-scrollbar pt-4">
                    <div className="w-full text-center mb-6 shrink-0">
                        <h2 className="text-[clamp(1.5rem,6vh,5rem)] font-black text-gray-700 leading-tight break-words px-4">
                            {viewMode === 'EN' ? item.Word : item.Meaning}
                        </h2>
                    </div>
                    {revealed && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="w-full border-t border-gray-100/50 pt-6 text-center shrink-0"
                        >
                            <p className="text-[clamp(1.2rem,4.5vh,3.5rem)] font-bold text-liquid-blue leading-tight break-words px-4">
                                {viewMode === 'EN' ? item.Meaning : item.Word}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="flex justify-center shrink-0 h-[6vh] mt-1">
                <button onClick={handleAction} className="neu-btn-blue px-10 text-[1.5vh] font-black rounded-2xl">
                    {revealed ? '다음 (Next)' : '해석 확인 (Enter)'}
                </button>
            </div>
        </div>
    );
}

// CH2: 통역
function Ch2Interpretation({ item, onNext, progress }: any) {
    const [textVal, setTextVal] = useState('');
    const [revealed, setRevealed] = useState(false);

    useEffect(() => { 
        setTextVal(''); 
        setRevealed(false);
        return () => stopSpeech(); 
    }, [item]);

    const handleAction = () => {
        if (!revealed) setRevealed(true);
        else onNext();
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') { if (e.code === 'Enter') handleAction(); return; }
            if (e.code === 'Enter') handleAction();
            if (e.code === 'Space' || e.code === 'ArrowDown') { e.preventDefault(); speakText(item.Sentence1 || item.Word); }
        };
        window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
    }, [item, onNext, revealed]);

    return (
        <div className="flex-1 w-full h-full flex flex-col gap-[1.5vh] min-h-0 overflow-hidden">
            <span className="text-center text-[1.3vh] font-bold text-gray-400 shrink-0">{progress}</span>
            <div className="neu-panel flex-1 min-h-0 flex flex-col p-8 relative overflow-hidden">
                <StarButton item={item} />
                <div className="w-full h-full flex flex-col items-center justify-center pt-4 overflow-y-auto">
                    <div className="flex flex-col items-center shrink-0 mb-6">
                        <button onClick={() => speakText(item.Sentence1 || item.Word)} className="w-[10vh] h-[10vh] rounded-full neu-btn mb-3">
                            <Volume2 className="w-[5vh] h-[5vh] text-liquid-blue" />
                        </button>
                        <p className="text-[1.3vh] font-bold text-gray-400 uppercase">Listen & Speak</p>
                    </div>
                    {revealed && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="w-full border-t border-gray-100/50 pt-6 text-center shrink-0"
                        >
                            <p className="text-[clamp(1.1rem,4.2vh,2.5rem)] font-black text-liquid-blue leading-tight px-4">
                                {item.Sentence1 || item.Word}
                            </p>
                            <p className="text-[1.7vh] text-gray-400 mt-2 font-medium px-4">{item.Translation1}</p>
                        </motion.div>
                    )}
                </div>
            </div>
            <div className="shrink-0 flex justify-center h-[7vh] mt-1">
                <input autoFocus className="neu-input w-full p-3 text-[1.8vh] text-center" placeholder="듣고 해석하세요... (Enter로 확인)" value={textVal} onChange={e => setTextVal(e.target.value)} />
            </div>
        </div>
    );
}

// CH3: 번역
function Ch3Translation({ item, onNext, progress }: any) {
    const [textVal, setTextVal] = useState('');
    const [viewMode, setViewMode] = useState<'EN' | 'KR'>('EN');
    const [revealed, setRevealed] = useState(false);

    useEffect(() => { 
        setTextVal(''); 
        setRevealed(false);
        return () => stopSpeech(); 
    }, [item, viewMode]);

    const handleAction = () => {
        if (!revealed) setRevealed(true);
        else onNext();
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') { if (e.code === 'Enter') handleAction(); return; }
            if (e.code === 'Enter') handleAction();
        };
        window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
    }, [item, onNext, revealed]);

    return (
        <div className="flex-1 w-full h-full flex flex-col gap-[1.5vh] min-h-0 overflow-hidden">
            <span className="text-center text-[1.3vh] font-bold text-gray-400 shrink-0">{progress}</span>
            <div className="flex justify-center shrink-0 h-[3.5vh]">
                <div className="shadow-neu-pressed p-0.5 rounded-lg flex">
                    <button onClick={() => setViewMode('EN')} className={`px-4 py-0.5 text-[1.1vh] font-black rounded-md ${viewMode === 'EN' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>EN</button>
                    <button onClick={() => setViewMode('KR')} className={`px-4 py-0.5 text-[1.1vh] font-black rounded-md ${viewMode === 'KR' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>KR</button>
                </div>
            </div>
            <div className="neu-panel flex-1 min-h-0 flex flex-col p-8 relative overflow-hidden">
                <StarButton item={item} />
                <button onClick={() => speakText(item.Sentence1 || item.Word)} className="absolute top-3 left-3 neu-btn w-[4vh] h-[4vh]">
                    <Volume2 className="w-[2vh] h-[2vh] text-liquid-blue" />
                </button>
                <div className="w-full h-full flex flex-col items-center justify-center pt-4 overflow-y-auto">
                    <div className="text-center shrink-0 px-4 mb-6">
                        <h2 className="text-[clamp(1.1rem,4.2vh,3rem)] font-black text-gray-700 leading-tight">
                            {viewMode === 'EN' ? (item.Sentence1 || item.Word) : (item.Translation1 || item.Meaning)}
                        </h2>
                    </div>
                    {revealed && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="w-full border-t border-gray-100/50 pt-6 text-center shrink-0"
                        >
                            <p className="text-[clamp(1rem,4vh,2.5rem)] font-black text-liquid-blue leading-tight px-4">
                                {viewMode === 'EN' ? (item.Translation1 || item.Meaning) : (item.Sentence1 || item.Word)}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
            <div className="shrink-0 flex justify-center h-[7vh] mt-1">
                <input autoFocus className="neu-input w-full p-3 text-[1.8vh] text-center" placeholder="타이핑 후 Enter를 누르세요" value={textVal} onChange={e => setTextVal(e.target.value)} />
            </div>
        </div>
    );
}

export default App;
