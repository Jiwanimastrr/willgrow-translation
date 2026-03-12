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
        <div className="w-screen h-screen flex flex-col font-sans overflow-hidden">
            {/* HEADER */}
            <header className="h-14 w-full flex items-center justify-between px-8 bg-white shrink-0 border-b border-gray-100 z-50">
                <h1 className="text-gray-800 font-extrabold text-lg tracking-tight">
                    주니어통번역사 9,8급
                </h1>
                {currentChapter > 0 && (
                    <button
                        onClick={() => setChapter(0)}
                        className="neu-btn px-5 py-2 text-sm"
                    >
                        세팅 메뉴
                    </button>
                )}
            </header>

            {/* MAIN CONTAINER — takes remaining height */}
            <main className="flex-1 overflow-hidden">
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
            className="w-full h-full flex flex-col items-center justify-center"
        >
            <div className="neu-panel p-10 w-[480px] flex flex-col gap-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-700">Set up Class</h2>
                    <p className="text-sm font-medium text-gray-400">오늘 진행할 테마와 Day를 선택해주세요.</p>
                </div>

                <div className="space-y-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-400 ml-2">테마 선택</label>
                        <select
                            className="neu-input w-full cursor-pointer appearance-none"
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

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-400 ml-2">Day 선택</label>
                        <select
                            className="neu-input w-full cursor-pointer appearance-none"
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
                    className="neu-btn-blue w-full py-4 text-xl disabled:opacity-50"
                >
                    수업 시작하기 (Start)
                </button>
            </div>
        </motion.div>
    );
}

// LEARNING MODULE
function LearningScreen() {
    const { currentChapter, setChapter, getFilteredData, getReviewData, classDataPath } = useStore();
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
                <p className="text-gray-500">해당 조건의 데이터가 없습니다.</p>
            </div>
        );
    }

    const currentItem = data[idx];
    const goNext = () => { if (idx < data.length - 1) setIdx(idx + 1); };
    const goPrev = () => { if (idx > 0) setIdx(idx - 1); };

    return (
        <div className="w-full h-full flex flex-col items-center overflow-hidden">
            {/* Top controls */}
            <div className="w-full max-w-4xl px-8 pt-2 flex flex-col gap-2 shrink-0">
                <div className="flex justify-end">
                    <div className="shadow-neu-pressed p-1 rounded-2xl flex gap-1">
                        <button
                            onClick={() => setViewMode('study')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'study' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <BookOpen className="w-4 h-4" />학습
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List className="w-4 h-4" />목록
                        </button>
                    </div>
                </div>

                <div className="flex shadow-neu-pressed p-1 rounded-[25px] gap-1">
                    {['1장: 어휘', '2장: 통역', '3장: 번역'].map((label, i) => (
                        <button
                            key={label}
                            onClick={() => { setChapter(i + 1); setIdx(0); setViewMode('study'); }}
                            className={`flex-1 text-sm font-bold py-2 rounded-[20px] transition-all ${currentChapter === i + 1 ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content area */}
            <div className="flex-1 w-full flex flex-col items-center overflow-y-auto px-8 pb-10">
                <AnimatePresence mode="wait">
                    {viewMode === 'list' ? (
                        <GlobalListView key="list" items={data} currentChapter={currentChapter} />
                    ) : (
                        <motion.div
                            key={`chapter-${currentChapter}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full h-full max-w-4xl flex flex-col"
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
            className="p-2 neu-btn w-10 h-10 absolute top-5 right-5 z-10"
        >
            <Star className={`w-5 h-5 ${item.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
    );
}

function GlobalListView({ items, currentChapter }: { items: any[], currentChapter: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl py-4 h-full flex flex-col overflow-hidden"
        >
            <div className="neu-panel w-full flex-1 flex flex-col overflow-hidden shadow-neu-flat">
                <div className="p-5 border-b border-gray-200/50 flex justify-between items-center bg-white/10 shrink-0">
                    <h3 className="font-extrabold text-lg flex items-center gap-3 text-gray-700">
                        <List className="w-5 h-5 text-liquid-blue" />
                        {currentChapter}장 전체 목록 ({items.length}개)
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Click to listen</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col gap-3">
                        {items.map((item, i) => {
                            const mainText = currentChapter === 2
                                ? (item.Translation1 || item.Meaning)
                                : (item.Word || item.Sentence1);
                            const subText = currentChapter === 2
                                ? (item.Word || item.Sentence1)
                                : (item.Meaning || item.Translation1);
                            const audioText = item.Word || item.Sentence1;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => speakText(audioText)}
                                    className="group w-full flex items-center gap-5 p-4 rounded-[25px] hover:shadow-neu-pressed transition-all text-left bg-neu-bg active:scale-[0.99]"
                                >
                                    <div className="w-8 h-8 rounded-full shadow-neu-button flex items-center justify-center text-sm font-bold text-gray-400 group-hover:text-liquid-blue transition-colors shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-lg text-gray-700 group-hover:text-liquid-blue transition-colors truncate">{mainText}</h4>
                                        <p className="text-sm text-gray-400 truncate font-medium mt-0.5">{subText}</p>
                                    </div>
                                    <div className="shrink-0 p-2 neu-btn rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                        <Volume2 className="w-4 h-4 text-liquid-blue" />
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
    const answerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setRevealed(false);
        return () => { stopSpeech(); };
    }, [item, viewMode]);

    useEffect(() => {
        if (revealed && answerRef.current) {
            answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [revealed]);

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
        <div className="flex-1 w-full flex flex-col gap-2 pt-1 pb-2 relative min-h-0">
            <span className="text-center text-xs font-bold text-gray-400 shrink-0">{progress}</span>

            {/* Mode Toggle */}
            <div className="flex justify-center shrink-0">
                <div className="shadow-neu-pressed p-1 rounded-2xl flex gap-1">
                    <button onClick={() => setViewMode('EN')} className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'EN' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}>English</button>
                    <button onClick={() => setViewMode('KR')} className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'KR' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}>Korean</button>
                </div>
            </div>

            {/* Card */}
            <div className="neu-panel flex-1 min-h-0 flex flex-col p-6 relative items-center justify-center">
                <StarButton item={item} />
                <button onClick={() => speakText(item.Word)} className="absolute top-4 left-4 neu-btn p-2 w-10 h-10" title="다시 듣기">
                    <Volume2 className="w-5 h-5 text-liquid-blue" />
                </button>
                <div className="text-center space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest opacity-60">
                        {viewMode === 'EN' ? 'Vocabulary' : 'Definition'}
                    </p>
                    <h2 className={`${viewMode === 'EN' ? 'text-4xl' : 'text-3xl'} font-extrabold tracking-tight text-gray-700 leading-tight`}>
                        {questionText}
                    </h2>
                    <p className="text-xs font-bold text-gray-300 tracking-tighter uppercase">{item.Theme}</p>

                    {/* Answer inline */}
                    <AnimatePresence>
                        {revealed && (
                            <motion.div ref={answerRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 border-t border-gray-200 mt-4">
                                <span className="font-bold text-liquid-blue uppercase tracking-widest text-xs">Meaning</span>
                                <p className={`${viewMode === 'EN' ? 'text-2xl' : 'text-3xl'} font-bold text-gray-700 leading-tight mt-1`}>
                                    {answerText}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 shrink-0">
                <button onClick={handleAction} className="neu-btn flex-1 py-3 text-lg">
                    {revealed ? '다음 (Enter)' : '정답확인 (Enter)'}
                </button>
                <button onClick={onNext} className="neu-btn-blue w-20 py-3 text-base">Next</button>
            </div>
        </div>
    );
}

// ===================== Ch2: Interpretation =====================
function Ch2Interpretation({ item, onNext, onPrev, progress, vocabulary }: any) {
    const [revealed, setRevealed] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [textVal, setTextVal] = useState('');
    const answerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setRevealed(false);
        setTextVal('');
        return () => stopSpeech();
    }, [item]);

    useEffect(() => {
        if (revealed && answerRef.current) {
            answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [revealed]);

    const handleAction = () => {
        if (!revealed) setRevealed(true);
        else onNext();
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                if (e.code === 'Enter') { e.preventDefault(); handleAction(); }
                if (e.code === 'ArrowLeft' && textVal === '') { onPrev(); }
                return;
            }
            if (e.code === 'ArrowRight') { e.preventDefault(); onNext(); }
            else if (e.code === 'ArrowLeft') { e.preventDefault(); onPrev(); }
            else if (e.code === 'ArrowDown' || e.code === 'Space') { e.preventDefault(); speakText(item.Sentence1 || item.Word); }
            else if (e.code === 'Enter') { e.preventDefault(); handleAction(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [item, revealed, onNext, onPrev, textVal]);

    const renderHighlighted = (sentence: string) => {
        if (!sentence) return '';
        return sentence.split(/(\s+)/).map((w, i) => {
            const cleanW = w.replace(/[.,!?]/g, '');
            const isVocab = vocabulary.some((v: string) => v?.toLowerCase() === cleanW.toLowerCase());
            return <span key={i} className={isVocab ? "text-liquid-blue font-bold tracking-tight" : ""}>{w}</span>;
        });
    };

    return (
        <div className="flex-1 w-full flex flex-col gap-2 pt-1 pb-2 relative min-h-0">
            <audio ref={audioRef} />
            <span className="text-center text-xs font-bold text-gray-400 shrink-0">{progress}</span>

            {/* Listen panel */}
            <div className="neu-panel flex-1 min-h-0 flex flex-col p-6 relative items-center justify-center">
                <StarButton item={item} />
                <div className="flex flex-col items-center gap-4">
                    <button onClick={() => speakText(item.Sentence1 || item.Word)} className="w-20 h-20 rounded-full neu-btn">
                        <Volume2 className="w-9 h-9 text-liquid-blue" />
                    </button>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Listen and Interpret</p>

                    {/* Answer inline */}
                    <AnimatePresence>
                        {revealed && (
                            <motion.div ref={answerRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-3 border-t border-gray-200 mt-2 w-full text-center">
                                <span className="font-bold text-liquid-blue uppercase tracking-widest text-xs">Answer</span>
                                <p className="text-xl font-extrabold text-gray-700 leading-relaxed mt-1">
                                    {renderHighlighted(item.Sentence1 || item.Word)}
                                </p>
                                {item.Translation1 && <p className="text-sm text-gray-400 font-medium mt-1">{item.Translation1}</p>}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input */}
            <div className="shrink-0 flex gap-2">
                <input
                    autoFocus
                    className="neu-input flex-1 p-3 text-lg"
                    placeholder="Type interpretation..."
                    value={textVal}
                    onChange={e => setTextVal(e.target.value)}
                />
                <button onClick={handleAction} className="neu-btn px-4 text-sm font-bold">
                    {revealed ? '다음' : '정답확인'}
                </button>
                <button onClick={onNext} className="neu-btn-blue w-16 text-base">Next</button>
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
    const answerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setRevealed(false);
        setTextVal('');
        return () => stopSpeech();
    }, [item, viewMode]);

    useEffect(() => {
        if (revealed && answerRef.current) {
            answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [revealed]);

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
            else if (e.code === 'ArrowDown') { e.preventDefault(); speakText(item.Sentence1 || item.Word); }
            else if (e.code === 'Space') {
                if (isInputMode) return;
                e.preventDefault(); speakText(item.Sentence1 || item.Word);
            }
            else if (e.code === 'Enter') { e.preventDefault(); handleAction(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [item, revealed, onNext, onPrev, viewMode, textVal]);

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
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded shadow-lg px-3 py-2 z-50">
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
        <div className="flex-1 w-full flex flex-col gap-2 pt-1 pb-2 relative min-h-0">
            <audio ref={audioRef} />
            <span className="text-center text-xs font-bold text-gray-400 shrink-0">{progress}</span>

            {/* Mode Toggle */}
            <div className="flex justify-center shrink-0">
                <div className="shadow-neu-pressed p-1 rounded-2xl flex gap-1">
                    <button onClick={() => setViewMode('EN')} className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'EN' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}>English</button>
                    <button onClick={() => setViewMode('KR')} className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'KR' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}>Korean</button>
                </div>
            </div>

            {/* Card */}
            <div className="neu-panel flex-1 min-h-0 flex flex-col p-6 relative items-center justify-center">
                <StarButton item={item} />
                <button onClick={() => speakText(item.Sentence1 || item.Word)} className="absolute top-4 left-4 neu-btn p-2 w-10 h-10" title="영어 발음 듣기">
                    <Volume2 className="w-5 h-5 text-liquid-blue" />
                </button>
                <div className="text-center px-8">
                    <h2 className="text-2xl font-extrabold text-gray-700 leading-relaxed">
                        {renderContent(questionText, viewMode === 'EN')}
                    </h2>

                    {/* Answer inline */}
                    <AnimatePresence>
                        {revealed && (
                            <motion.div ref={answerRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-3 border-t border-gray-200 mt-4">
                                <span className="font-bold text-liquid-blue uppercase tracking-widest text-xs">Answer</span>
                                <p className="text-xl font-extrabold text-gray-700 leading-relaxed mt-1">{answerText}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input */}
            <div className="shrink-0 flex gap-2">
                <input
                    autoFocus
                    className="neu-input flex-1 p-3 text-lg"
                    placeholder="Translate..."
                    value={textVal}
                    onChange={e => setTextVal(e.target.value)}
                />
                <button onClick={handleAction} className="neu-btn px-4 text-sm font-bold">
                    {revealed ? '다음' : '정답확인'}
                </button>
                <button onClick={onNext} className="neu-btn-blue w-14 text-base">Next</button>
            </div>
        </div>
    );
}

export default App;
