import { useEffect, useState, useRef } from 'react';
import { useStore, speakText, stopSpeech } from './store';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Volume2, List, BookOpen } from 'lucide-react';

function App() {
    const { initialize, setupError, currentChapter, setChapter } = useStore();

    useEffect(() => {
        initialize();
    }, []);

    return (
        <div className="w-screen h-screen flex flex-col font-sans overflow-hidden bg-neu-bg">
            {/* HEADER - Minimal height */}
            <header className="h-[7vh] min-h-[50px] w-full flex items-center justify-between px-8 bg-white shrink-0 border-b border-gray-100 z-50">
                <h1 className="text-gray-800 font-extrabold text-[clamp(1rem,2.5vh,1.5rem)] tracking-tight">
                    주니어통번역사 9,8급
                </h1>
                {currentChapter > 0 && (
                    <button
                        onClick={() => setChapter(0)}
                        className="neu-btn px-4 py-1.5 text-xs sm:text-sm shadow-neu-button"
                    >
                        세팅 메뉴
                    </button>
                )}
            </header>

            {/* MAIN CONTAINER — No scrolling allowed */}
            <main className="flex-1 overflow-hidden flex flex-col">
                {setupError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                        <div className="neu-panel p-10 w-full max-w-lg text-center text-red-500">
                            <h2 className="font-bold text-xl mb-4">초기화 오류</h2>
                            <p className="text-sm">{setupError}</p>
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

// SETUP SCREEN (CH 0)
function SetupScreen() {
    const { themes, selectedTheme, selectedSession, setTheme, setSession, startClass } = useStore();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden"
        >
            <div className="neu-panel p-[5vh] w-full max-w-[450px] flex flex-col gap-[3vh]">
                <div className="text-center space-y-1">
                    <h2 className="text-[clamp(1.5rem,4vh,2.5rem)] font-extrabold tracking-tight text-gray-700">Set up Class</h2>
                    <p className="text-[clamp(0.75rem,1.8vh,1rem)] font-medium text-gray-400">테마와 Day를 선택하세요.</p>
                </div>

                <div className="space-y-[2vh]">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 ml-2">테마 선택</label>
                        <select
                            className="neu-input w-full cursor-pointer appearance-none py-[1.5vh] text-sm"
                            value={selectedTheme || ''}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <option value="" disabled>1. 테마를 선택하세요</option>
                            {themes.length === 0 && <option value="Default Theme">기본 테마</option>}
                            {themes.map(t => (
                                <option key={t} value={t}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 ml-2">Day 선택</label>
                        <select
                            className="neu-input w-full cursor-pointer appearance-none py-[1.5vh] text-sm"
                            value={selectedSession || ''}
                            onChange={(e) => setSession(e.target.value)}
                        >
                            <option value="" disabled>2. Day를 선택하세요</option>
                            {[1, 2, 3].map(s => <option key={s} value={s}>Day {s}</option>)}
                        </select>
                    </div>
                </div>

                <button
                    disabled={!selectedTheme || !selectedSession}
                    onClick={startClass}
                    className="neu-btn-blue w-full py-[2vh] text-[clamp(1rem,2.5vh,1.5rem)] disabled:opacity-50"
                >
                    시작하기 (Start)
                </button>
            </div>
        </motion.div>
    );
}

// LEARNING MODULE
function LearningScreen() {
    const { currentChapter, setChapter, getFilteredData, getReviewData } = useStore();
    const [data, setData] = useState<any[]>([]);
    const [idx, setIdx] = useState(0);
    const [viewMode, setViewMode] = useState<'study' | 'list'>('study');

    useEffect(() => {
        const s = useStore.getState().selectedSession;
        if (s === '13' || s === '14' || currentChapter === 4) {
            setData(getReviewData());
        } else {
            setData(getFilteredData());
        }
    }, [currentChapter]);

    if (data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">데이터가 없습니다.</p>
            </div>
        );
    }

    const currentItem = data[idx];
    const goNext = () => { if (idx < data.length - 1) setIdx(idx + 1); };
    const goPrev = () => { if (idx > 0) setIdx(idx - 1); };

    return (
        <div className="w-full h-full flex flex-col items-center overflow-hidden">
            {/* Top controls - Compact */}
            <div className="w-full max-w-4xl px-4 pt-2 flex flex-col gap-2 shrink-0">
                <div className="flex justify-end">
                    <div className="shadow-neu-pressed p-1 rounded-2xl flex gap-1">
                        <button
                            onClick={() => setViewMode('study')}
                            className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold transition-all ${viewMode === 'study' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <BookOpen className="w-3.5 h-3.5" />학습
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold transition-all ${viewMode === 'list' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List className="w-3.5 h-3.5" />목록
                        </button>
                    </div>
                </div>

                <div className="flex shadow-neu-pressed p-1 rounded-[20px] gap-1">
                    {['1장 어휘', '2장 통역', '3장 번역'].map((label, i) => (
                        <button
                            key={label}
                            onClick={() => { setChapter(i + 1); setIdx(0); setViewMode('study'); }}
                            className={`flex-1 text-xs font-bold py-2 rounded-[16px] transition-all ${currentChapter === i + 1 ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content area - Full viewport fit, center content */}
            <div className="flex-1 w-full flex flex-col items-center justify-center p-[2vh] overflow-hidden max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    {viewMode === 'list' ? (
                        <GlobalListView key="list" items={data} currentChapter={currentChapter} />
                    ) : (
                        <motion.div
                            key={`chapter-${currentChapter}`}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="w-full h-full flex flex-col min-h-0"
                        >
                            {currentChapter === 1 && <Ch1Flashcard item={currentItem} onNext={goNext} onPrev={goPrev} progress={`${idx + 1}/${data.length}`} />}
                            {currentChapter === 2 && <Ch2Interpretation item={currentItem} onNext={goNext} onPrev={goPrev} progress={`${idx + 1}/${data.length}`} vocabulary={data.map(d => d.Word).filter(Boolean)} />}
                            {currentChapter === 3 && <Ch3Translation item={currentItem} onNext={goNext} onPrev={goPrev} progress={`${idx + 1}/${data.length}`} vocabulary={data} />}
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
            className="p-[1vh] neu-btn w-[5vh] h-[5vh] min-w-[32px] min-h-[32px] absolute top-[2vh] right-[2vh] z-10"
        >
            <Star className={`w-[2.5vh] h-[2.5vh] ${item.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
    );
}

function GlobalListView({ items, currentChapter }: { items: any[], currentChapter: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full h-full flex flex-col overflow-hidden"
        >
            <div className="neu-panel w-full flex-1 flex flex-col overflow-hidden">
                <div className="p-[2vh] border-b border-gray-200/50 flex justify-between items-center shrink-0">
                    <h3 className="font-extrabold text-[clamp(1rem,2.5vh,1.5rem)] flex items-center gap-2 text-gray-700">
                        <List className="w-[3vh] h-[3vh]" />
                        {currentChapter}장 목록 ({items.length})
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-[2vh]">
                    <div className="flex flex-col gap-[1.5vh]">
                        {items.map((item, i) => {
                            const mainText = currentChapter === 2 ? (item.Translation1 || item.Meaning) : (item.Word || item.Sentence1);
                            const subText = currentChapter === 2 ? (item.Word || item.Sentence1) : (item.Meaning || item.Translation1);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => speakText(item.Word || item.Sentence1)}
                                    className="group w-full flex items-center gap-[2vw] p-[2vh] rounded-[20px] hover:shadow-neu-pressed transition-all text-left bg-neu-bg"
                                >
                                    <div className="w-[4vh] h-[4vh] rounded-full shadow-neu-button flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-[clamp(0.9rem,2.2vh,1.2rem)] text-gray-700 truncate">{mainText}</h4>
                                        <p className="text-[clamp(0.7rem,1.8vh,0.9rem)] text-gray-400 truncate">{subText}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ===================== Ch1: Flashcard =====================
function Ch1Flashcard({ item, onNext, onPrev, progress }: any) {
    const [revealed, setRevealed] = useState(false);
    const [viewMode, setViewMode] = useState<'EN' | 'KR'>('EN');

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
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
            if (e.code === 'ArrowRight') { e.preventDefault(); onNext(); }
            else if (e.code === 'ArrowLeft') { e.preventDefault(); onPrev(); }
            else if (e.code === 'Space' || e.code === 'ArrowDown') { e.preventDefault(); speakText(item?.Word); }
            else if (e.code === 'Enter') { e.preventDefault(); handleAction(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [item, revealed, onNext, onPrev]);

    const questionText = viewMode === 'EN' ? item.Word : item.Meaning;
    const answerText = viewMode === 'EN' ? item.Meaning : item.Word;

    return (
        <div className="flex-1 w-full flex flex-col gap-[1.5vh] min-h-0 py-[1vh]">
            <span className="text-center text-[1.5vh] font-bold text-gray-400 shrink-0">{progress}</span>

            {/* Mode Toggle */}
            <div className="flex justify-center shrink-0">
                <div className="shadow-neu-pressed p-1 rounded-xl flex gap-1">
                    <button onClick={() => setViewMode('EN')} className={`px-4 py-1 rounded-lg text-xs font-bold transition-all ${viewMode === 'EN' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>EN</button>
                    <button onClick={() => setViewMode('KR')} className={`px-4 py-1 rounded-lg text-xs font-bold transition-all ${viewMode === 'KR' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>KR</button>
                </div>
            </div>

            {/* Card - Takes most space and shrinks if answer appears */}
            <div className="neu-panel flex-1 min-h-0 flex flex-col p-[4vh] relative items-center justify-center overflow-hidden">
                <StarButton item={item} />
                <button onClick={() => speakText(item.Word)} className="absolute top-[2vh] left-[2vh] neu-btn w-[5vh] h-[5vh] min-w-[32px] min-h-[32px]">
                    <Volume2 className="w-[2.5vh] h-[2.5vh] text-liquid-blue" />
                </button>
                
                <div className="w-full flex flex-col items-center justify-center gap-[2vh] min-h-0 h-full">
                    <div className="text-center shrink-0">
                        <p className="text-[1.5vh] font-extrabold text-gray-400 uppercase tracking-widest opacity-60 mb-[1vh]">
                            {viewMode === 'EN' ? 'WORD' : 'MEANING'}
                        </p>
                        <h2 className="text-[clamp(1.5rem,7vh,5rem)] font-black tracking-tight text-gray-700 leading-[1.1] break-words px-4">
                            {questionText}
                        </h2>
                    </div>

                    <AnimatePresence>
                        {revealed && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                className="w-full pt-[3vh] border-t border-gray-100 flex flex-col items-center min-h-0"
                            >
                                <span className="font-bold text-liquid-blue uppercase tracking-widest text-[1.5vh]">ANSWER</span>
                                <p className="text-[clamp(1.2rem,5vh,3.5rem)] font-bold text-gray-600 leading-tight mt-[1vh] break-words px-4 text-center overflow-hidden">
                                    {answerText}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Action Buttons - Fixed size */}
            <div className="flex gap-3 shrink-0 h-[8vh] max-h-[60px]">
                <button onClick={handleAction} className="neu-btn flex-1 text-[clamp(0.9rem,2.2vh,1.2rem)] h-full">
                    {revealed ? '다음 (Enter)' : '정답확인 (Enter)'}
                </button>
                <button onClick={onNext} className="neu-btn-blue w-[100px] text-[clamp(0.9rem,2vh,1.1rem)] h-full">Next</button>
            </div>
        </div>
    );
}

// ===================== Ch2: Interpretation =====================
function Ch2Interpretation({ item, onNext, onPrev, progress, vocabulary }: any) {
    const [revealed, setRevealed] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [textVal, setTextVal] = useState('');

    useEffect(() => {
        setRevealed(false);
        setTextVal('');
        return () => stopSpeech();
    }, [item]);

    const handleAction = () => {
        if (!revealed) setRevealed(true);
        else onNext();
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                if (e.code === 'Enter') { e.preventDefault(); handleAction(); }
                return;
            }
            if (e.code === 'ArrowRight') { e.preventDefault(); onNext(); }
            else if (e.code === 'ArrowLeft') { e.preventDefault(); onPrev(); }
            else if (e.code === 'ArrowDown' || e.code === 'Space') { e.preventDefault(); speakText(item.Sentence1 || item.Word); }
            else if (e.code === 'Enter') { e.preventDefault(); handleAction(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [item, revealed, onNext, onPrev]);

    const renderHighlighted = (sentence: string) => {
        if (!sentence) return '';
        return sentence.split(/(\s+)/).map((w, i) => {
            const cleanW = w.replace(/[.,!?]/g, '');
            const isVocab = vocabulary.some((v: string) => v?.toLowerCase() === cleanW.toLowerCase());
            return <span key={i} className={isVocab ? "text-liquid-blue font-bold tracking-tight" : ""}>{w}</span>;
        });
    };

    return (
        <div className="flex-1 w-full flex flex-col gap-[1.5vh] min-h-0 py-[1vh]">
            <audio ref={audioRef} />
            <span className="text-center text-[1.5vh] font-bold text-gray-400 shrink-0">{progress}</span>

            <div className="neu-panel flex-1 min-h-0 flex flex-col p-[4vh] relative items-center justify-center overflow-hidden">
                <StarButton item={item} />
                <div className="flex flex-col items-center justify-center h-full w-full gap-[2vh] min-h-0">
                    <div className="flex flex-col items-center shrink-0">
                        <button onClick={() => speakText(item.Sentence1 || item.Word)} className="w-[12vh] h-[12vh] max-w-[100px] max-h-[100px] rounded-full neu-btn mb-[1vh]">
                            <Volume2 className="w-[6vh] h-[6vh] max-w-[50px] max-h-[50px] text-liquid-blue" />
                        </button>
                        <p className="text-[1.5vh] font-bold text-gray-400 uppercase tracking-widest">Listen & Interpret</p>
                    </div>

                    <AnimatePresence>
                        {revealed && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                className="w-full pt-[3vh] border-t border-gray-100 text-center min-h-0 overflow-hidden"
                            >
                                <span className="font-bold text-liquid-blue uppercase tracking-widest text-[1.5vh]">ANSWER</span>
                                <p className="text-[clamp(1.1rem,4vh,2.5rem)] font-extrabold text-gray-700 leading-tight mt-[1vh] break-words px-4">
                                    {renderHighlighted(item.Sentence1 || item.Word)}
                                </p>
                                {item.Translation1 && <p className="text-[clamp(0.9rem,2.5vh,1.5rem)] text-gray-400 font-medium mt-[1vh] break-words px-4">{item.Translation1}</p>}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="shrink-0 flex gap-2 h-[8vh] max-h-[60px]">
                <input
                    autoFocus
                    className="neu-input flex-1 p-3 text-[clamp(0.9rem,2.2vh,1.2rem)] h-full"
                    placeholder="Type interpretation..."
                    value={textVal}
                    onChange={e => setTextVal(e.target.value)}
                />
                <button onClick={handleAction} className="neu-btn px-6 text-[clamp(0.9rem,2vh,1.1rem)] h-full">
                    {revealed ? '다음' : '확인'}
                </button>
            </div>
        </div>
    );
}

// ===================== Ch3: Translation =====================
function Ch3Translation({ item, onNext, onPrev, progress, vocabulary }: any) {
    const [revealed, setRevealed] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [textVal, setTextVal] = useState('');
    const [viewMode, setViewMode] = useState<'EN' | 'KR'>('EN');

    useEffect(() => {
        setRevealed(false);
        setTextVal('');
        return () => stopSpeech();
    }, [item, viewMode]);

    const handleAction = () => {
        if (!revealed) setRevealed(true);
        else onNext();
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const isInputMode = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
            if (e.code === 'ArrowRight') { e.preventDefault(); onNext(); }
            else if (e.code === 'ArrowLeft') {
                if (isInputMode && textVal !== '') return;
                e.preventDefault(); onPrev();
            }
            else if (e.code === 'ArrowDown' || e.code === 'Space') {
                if (isInputMode && e.code === 'Space') return;
                e.preventDefault(); speakText(item.Sentence1 || item.Word);
            }
            else if (e.code === 'Enter') { e.preventDefault(); handleAction(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [item, revealed, onNext, onPrev, textVal]);

    const renderContent = (sentence: string, isEnglish: boolean) => {
        if (!sentence) return '';
        if (!isEnglish) return sentence;
        return sentence.split(/(\s+)/).map((w, i) => {
            const cleanW = w.replace(/[.,!?]/g, '');
            const vocabData = vocabulary.find((v: any) => v.Word && v.Word.toLowerCase() === cleanW.toLowerCase());
            if (vocabData) {
                return (
                    <span key={i} className="group relative inline-block border-b border-dashed border-gray-400 cursor-help">
                        <span className="font-semibold text-liquid-blue">{w}</span>
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded shadow-lg px-2 py-1 z-50">
                            {vocabData.Meaning}
                        </div>
                    </span>
                );
            }
            return <span key={i}>{w}</span>;
        });
    };

    const questionText = viewMode === 'EN' ? (item.Sentence1 || item.Word) : (item.Translation1 || item.Meaning);
    const answerText = viewMode === 'EN' ? (item.Translation1 || item.Meaning) : (item.Sentence1 || item.Word);

    return (
        <div className="flex-1 w-full flex flex-col gap-[1.5vh] min-h-0 py-[1vh]">
            <audio ref={audioRef} />
            <span className="text-center text-[1.5vh] font-bold text-gray-400 shrink-0">{progress}</span>

            <div className="flex justify-center shrink-0">
                <div className="shadow-neu-pressed p-1 rounded-xl flex gap-1">
                    <button onClick={() => setViewMode('EN')} className={`px-4 py-1 rounded-lg text-xs font-bold transition-all ${viewMode === 'EN' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>EN</button>
                    <button onClick={() => setViewMode('KR')} className={`px-4 py-1 rounded-lg text-xs font-bold transition-all ${viewMode === 'KR' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400'}`}>KR</button>
                </div>
            </div>

            <div className="neu-panel flex-1 min-h-0 flex flex-col p-[4vh] relative items-center justify-center overflow-hidden">
                <StarButton item={item} />
                <button onClick={() => speakText(item.Sentence1 || item.Word)} className="absolute top-[2vh] left-[2vh] neu-btn w-[5vh] h-[5vh] min-w-[32px] min-h-[32px]">
                    <Volume2 className="w-[2.5vh] h-[2.5vh] text-liquid-blue" />
                </button>

                <div className="w-full flex flex-col items-center justify-center gap-[2vh] h-full min-h-0">
                    <div className="text-center shrink-0">
                        <h2 className="text-[clamp(1.1rem,4.5vh,3rem)] font-extrabold text-gray-700 leading-tight break-words px-4">
                            {renderContent(questionText, viewMode === 'EN')}
                        </h2>
                    </div>

                    <AnimatePresence>
                        {revealed && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                className="w-full pt-[3vh] border-t border-gray-100 text-center min-h-0 overflow-hidden"
                            >
                                <span className="font-bold text-liquid-blue uppercase tracking-widest text-[1.5vh]">ANSWER</span>
                                <p className="text-[clamp(1rem,4vh,2.5rem)] font-extrabold text-gray-600 leading-tight mt-[1vh] break-words px-4">
                                    {answerText}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="shrink-0 flex gap-2 h-[8vh] max-h-[60px]">
                <input
                    autoFocus
                    className="neu-input flex-1 p-3 text-[clamp(0.9rem,2.2vh,1.2rem)] h-full"
                    placeholder="Translate..."
                    value={textVal}
                    onChange={e => setTextVal(e.target.value)}
                />
                <button onClick={handleAction} className="neu-btn px-6 text-[clamp(0.9rem,2vh,1.1rem)] h-full">
                    {revealed ? '다음' : '확인'}
                </button>
            </div>
        </div>
    );
}

export default App;
