import React, { useEffect, useState, useRef } from 'react';
import { useStore, speakText, stopSpeech } from './store';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Volume2, List, BookOpen } from 'lucide-react';

function App() {
    const { initialize, setupError, currentChapter, setChapter } = useStore();

    useEffect(() => {
        initialize();
    }, []);

    return (
        <div className="w-full h-full relative overflow-hidden flex flex-col font-sans">
            {/* HEADER */}
            <header className="h-16 w-full flex items-center justify-between px-6 bg-white/50 backdrop-blur-md border-b border-gray-200/50 dark:bg-black/50 dark:border-white/10 shrink-0 select-none z-50 fixed top-0 left-0">
                <div className="flex items-center gap-3">
                    <h1 className="text-liquid-blue font-bold text-xl tracking-tight">
                        주니어통번역사 9,8급
                    </h1>
                </div>

                {currentChapter > 0 && (
                    <div className="flex gap-4">
                        <button
                            onClick={() => setChapter(0)}
                            className="text-sm font-medium px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            세팅 메뉴
                        </button>
                    </div>
                )}
            </header>

            {/* MAIN CONTAINER */}
            <main className="flex-1 mt-16 overflow-y-auto">
                {setupError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                        <div className="liquid-panel p-8 max-sm w-full text-center text-red-500">
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
            className="w-full h-full flex flex-col items-center justify-center -mt-8"
        >
            <div className="liquid-panel p-10 w-[500px] flex flex-col gap-8 shadow-2xl">
                <div className="text-center space-y-2 mb-4">
                    <h2 className="text-3xl font-bold tracking-tight">Set up Class</h2>
                    <p className="text-sm text-gray-500">오늘 진행할 테마와 Day를 선택해주세요.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">테마 선택</label>
                        <select
                            className="w-full p-4 rounded-xl bg-white/60 dark:bg-black/60 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-liquid-blue outline-none transition-all cursor-pointer"
                            value={selectedTheme || ''}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <option value="" disabled>1. 테마를 선택하세요</option>
                            {themes.length === 0 && <option value="Default Theme">기본 테마</option>}
                            {themes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Day 선택</label>
                        <select
                            className="w-full p-4 rounded-xl bg-white/60 dark:bg-black/60 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-liquid-blue outline-none transition-all cursor-pointer"
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
                    className="w-full py-4 mt-6 bg-liquid-blue text-white font-bold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
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
        // 13, 14차시 처리
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

    const goNext = () => {
        if (idx < data.length - 1) setIdx(idx + 1);
    };

    return (
        <div className="w-full h-full flex flex-col items-center">
            {/* View Mode Toggle & Chapter Tabs */}
            <div className="w-full max-w-4xl px-8 mt-6 flex flex-col gap-4">
                <div className="flex justify-end">
                    <div className="bg-gray-200/50 dark:bg-white/5 p-1 rounded-xl flex gap-1 backdrop-blur-sm">
                        <button
                            onClick={() => setViewMode('study')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'study' ? 'bg-white dark:bg-black/60 shadow-sm text-liquid-blue' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <BookOpen className="w-4 h-4" />
                            학습 모드
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-black/60 shadow-sm text-liquid-blue' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <List className="w-4 h-4" />
                            리스트 보기
                        </button>
                    </div>
                </div>

                <div className="flex rounded-full bg-gray-200/50 dark:bg-white/5 p-1 backdrop-blur-md">
                    {['1장: 어휘 (Flashcard)', '2장: 통역 (Interpretation)', '3장: 번역 (Translation)'].map((label, i) => (
                        <button
                            key={label}
                            onClick={() => {
                                setChapter(i + 1);
                                setIdx(0);
                                setViewMode('study'); // 장 이동 시 기본은 학습모드로
                            }}
                            className={`flex-1 text-sm font-semibold py-2.5 rounded-full transition-all ${currentChapter === i + 1
                                ? 'bg-white text-liquid-blue shadow-sm dark:bg-black/80 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 w-full flex flex-col items-center overflow-hidden">
                <AnimatePresence mode="wait">
                    {viewMode === 'list' ? (
                        <GlobalListView key="list" items={data} currentChapter={currentChapter} />
                    ) : (
                        <motion.div
                            key={`chapter-${currentChapter}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full h-full flex flex-col items-center"
                        >
                            {currentChapter === 1 && <Ch1Flashcard item={currentItem} path={classDataPath!} onNext={goNext} progress={`${idx + 1}/${data.length}`} />}
                            {currentChapter === 2 && <Ch2Interpretation item={currentItem} path={classDataPath!} onNext={goNext} progress={`${idx + 1}/${data.length}`} vocabulary={data.map(d => d.Word).filter(Boolean)} />}
                            {currentChapter === 3 && <Ch3Translation item={currentItem} path={classDataPath!} onNext={goNext} progress={`${idx + 1}/${data.length}`} vocabulary={data} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

        </div>
    );
}

// ----------------------------------------------------
// COMPONENTS SUPPORTING VARIOUS CHAPTERS
// ----------------------------------------------------

function useGlobalHotkeys(audioRef: React.RefObject<HTMLAudioElement | null>, doAction: () => void, enableReplay: boolean = true) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            // Inputs checking
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                // If Enter is pressed inside an input, maybe bubble up
                if (e.key === 'Enter') {
                    doAction();
                    e.preventDefault();
                }
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                if (audioRef.current) {
                    if (audioRef.current.paused) audioRef.current.play();
                    else audioRef.current.pause();
                }
            } else if (e.code === 'Enter') {
                e.preventDefault();
                doAction(); // either reveal answer or go next
            } else if (e.code === 'ArrowDown' && enableReplay) {
                // Replay audio
                e.preventDefault();
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [doAction, audioRef, enableReplay]);
}

function StarButton({ item }: { item: any }) {
    const { toggleStar } = useStore();
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                toggleStar(item.id);
            }}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
            <Star className={`w-6 h-6 ${item.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
        </button>
    );
}

function GlobalListView({ items, currentChapter }: { items: any[], currentChapter: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl px-8 py-8 h-full flex flex-col overflow-hidden"
        >
            <div className="liquid-panel w-full flex-1 flex flex-col overflow-hidden border border-white/40 dark:border-white/5 shadow-2xl">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/20 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <List className="w-5 h-5 text-liquid-blue" />
                        {currentChapter}장 전체 목록 ({items.length}개)
                    </h3>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Click an item to listen</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <div className="flex flex-col gap-2">
                        {items.map((item, i) => {
                            // 2장(통역)은 한글 뜻을 메인으로, 3장(번역)은 영어 문장을 메인으로
                            const mainText = currentChapter === 2
                                ? (item.Translation1 || item.Meaning)
                                : (item.Word || item.Sentence1);

                            const subText = currentChapter === 2
                                ? (item.Word || item.Sentence1)
                                : (item.Meaning || item.Translation1);

                            // 오디오 재생 텍스트 결정
                            const audioText = currentChapter === 2
                                ? (item.Word || item.Sentence1) // 2장: 영어 문장/단어 재생
                                : (item.Word || item.Sentence1); // 1, 3, 4장: 영어 문장/단어 재생

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => speakText(audioText)}
                                    className="group w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-liquid-blue/5 dark:hover:bg-white/5 transition-all text-left border border-transparent hover:border-liquid-blue/10 active:scale-[0.99]"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-liquid-blue/10 group-hover:text-liquid-blue transition-colors shrink-0">
                                        {i + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-lg group-hover:text-liquid-blue transition-colors truncate">
                                            {mainText}
                                        </h4>
                                        <p className="text-sm text-gray-500 truncate opacity-80 mt-0.5">
                                            {subText}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <StarButton item={item} />
                                        <div className="w-10 h-10 rounded-xl bg-liquid-blue/5 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                            <Volume2 className="w-5 h-5 text-liquid-blue" />
                                        </div>
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

// Ch1
function Ch1Flashcard({ item, onNext, progress }: any) {
    const [revealed, setRevealed] = useState(false);
    const [viewMode, setViewMode] = useState<'EN' | 'KR'>('EN'); // EN: 영어 보여주기, KR: 한글 보여주기

    useEffect(() => {
        setRevealed(false);
        // 단어 카드가 바뀔 때 음성 자동 재생 제거 (사용자 요청)
        return () => { stopSpeech(); };
    }, [item, viewMode]);

    const handleAction = () => {
        if (!revealed) setRevealed(true);
        else onNext();
    };

    // 키보드 단축키: 스페이스·↓ = 다시 읽기, 엔터 = 정답공개/다음, → = 다음(Skip)
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
            if (e.code === 'ArrowRight') {
                e.preventDefault();
                onNext();
            } else if (e.code === 'Space' || e.code === 'ArrowDown') {
                e.preventDefault();
                speakText(item?.Word);
            } else if (e.code === 'Enter') {
                e.preventDefault();
                handleAction();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [item, revealed]);

    const questionText = viewMode === 'EN' ? item.Word : item.Meaning;
    const answerText = viewMode === 'EN' ? item.Meaning : item.Word;

    return (
        <div className="flex-1 w-full max-w-4xl mt-8 mb-8 p-4 flex flex-col items-center justify-center relative gap-6">
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-400">{progress}</span>

            {/* English / Korean 섹션 구분 스위치 */}
            <div className="flex justify-center">
                <div className="bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl flex gap-1 shadow-inner">
                    <button
                        onClick={() => setViewMode('EN')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === 'EN' ? 'bg-white dark:bg-white/10 shadow-md text-liquid-blue translate-y-[-1px]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setViewMode('KR')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === 'KR' ? 'bg-white dark:bg-white/10 shadow-md text-liquid-blue translate-y-[-1px]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Korean
                    </button>
                </div>
            </div>

            <div className="liquid-panel w-full min-h-[550px] flex flex-col items-center justify-start py-16 px-8 relative shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] transition-all border border-white/40 dark:border-white/5 overflow-visible">
                <StarButton item={item} />
                <button
                    onClick={() => speakText(item?.Word)}
                    className="absolute top-8 left-8 p-3 rounded-2xl bg-liquid-blue/5 hover:bg-liquid-blue/10 transition-all group shadow-sm active:scale-95 z-10"
                    title="다시 듣기 (스페이스바 or ↓)"
                >
                    <Volume2 className="w-7 h-7 text-liquid-blue group-hover:scale-110 transition-transform" />
                </button>

                <div className="text-center space-y-2 mt-8">
                    <p className="text-sm font-bold text-liquid-blue uppercase tracking-[0.2em] opacity-60 mb-4">
                        {viewMode === 'EN' ? 'Vocabulary' : 'Definition'}
                    </p>
                    <h2 className={`${viewMode === 'EN' ? 'text-7xl' : 'text-6xl'} font-black tracking-tight drop-shadow-sm break-keep text-center px-4 leading-tight`}>
                        {questionText}
                    </h2>
                    <p className="text-sm font-medium text-gray-400 mt-6 bg-gray-50 dark:bg-white/5 px-4 py-1.5 rounded-full inline-block">{item.Theme}</p>
                </div>

                <div className="mt-12 min-h-[160px] flex items-center justify-center w-full pb-20">
                    <AnimatePresence mode="wait">
                        {revealed && (
                            <motion.div
                                key={`${item.Word}-${viewMode}`}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                className="text-center px-8 py-8 bg-liquid-blue/5 rounded-3xl border border-liquid-blue/10 w-full max-w-2xl"
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <p className={`${viewMode === 'EN' ? 'text-4xl' : 'text-5xl'} font-bold text-liquid-blue leading-tight`}>
                                        {answerText}
                                    </p>
                                    <button
                                        onClick={() => speakText(answerText)}
                                        className="p-2 rounded-full hover:bg-liquid-blue/10 transition-colors"
                                        title="정답 음성 듣기"
                                    >
                                        <Volume2 className="w-5 h-5 text-liquid-blue/60 hover:text-liquid-blue" />
                                    </button>
                                </div>
                                {item.Sentence1 && (
                                    <div className="mt-6 flex flex-col items-center gap-2">
                                        <div className="w-full h-px bg-liquid-blue/10 mb-6" />
                                        <div className="flex items-start justify-center gap-4 px-4 text-center">
                                            <p className="text-xl text-gray-500 font-medium leading-relaxed italic opacity-80 decoration-liquid-blue/20">
                                                "{item.Sentence1}"
                                            </p>
                                            <button
                                                onClick={() => speakText(item.Sentence1)}
                                                className="flex-shrink-0 p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-liquid-blue/5 transition-all active:scale-95"
                                                title="예문 음성 듣기"
                                            >
                                                <Volume2 className="w-5 h-5 text-liquid-blue" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="absolute bottom-6 flex items-center gap-3 text-xs font-bold text-gray-400/80 bg-white/60 dark:bg-black/40 px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-sm z-20">
                    <div className="flex gap-1.5">
                        <span className="bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded shadow-sm">Space</span>
                        <span className="bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded shadow-sm">↓</span>
                        <span>Listen</span>
                    </div>
                    <div className="w-px h-3 bg-gray-300 dark:bg-white/20" />
                    <div className="flex gap-1.5">
                        <span className="bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded shadow-sm">Enter</span>
                        <span>Show/Next</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Ch2 
function Ch2Interpretation({ item, onNext, progress, vocabulary }: any) {
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

    // 키보드 단축키
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                if (e.code === 'Enter') {
                    e.preventDefault();
                    handleAction();
                }
                return;
            }
            if (e.code === 'ArrowRight') {
                e.preventDefault();
                onNext();
            } else if (e.code === 'ArrowDown' || e.code === 'Space') {
                e.preventDefault();
                speakText(item.Sentence1 || item.Word);
            } else if (e.code === 'Enter') {
                e.preventDefault();
                handleAction();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [item, revealed, onNext]);

    // highlight dictionary words
    const renderHighlighted = (sentence: string) => {
        if (!sentence) return '';
        const words = sentence.split(/(\s+)/);
        return words.map((w, i) => {
            const cleanW = w.replace(/[.,!?]/g, '');
            const isVocab = vocabulary.some((v: string) => v?.toLowerCase() === cleanW.toLowerCase());
            return <span key={i} className={isVocab ? "text-liquid-blue font-bold tracking-tight" : ""}>{w}</span>;
        });
    };

    return (
        <div className="flex-1 w-full max-w-4xl mt-8 mb-8 flex flex-col relative text-center">
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-400">{progress}</span>
            <audio ref={audioRef} />

            <div className="liquid-panel w-full flex-1 flex flex-col p-8 relative">
                <StarButton item={item} />

                {/* Audio Controller Visualization */}
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <button
                        onClick={() => speakText(item.Sentence1 || item.Word)}
                        className="w-24 h-24 rounded-full bg-liquid-blue/10 flex items-center justify-center pulse-animation hover:bg-liquid-blue/20 transition-colors"
                    >
                        <Volume2 className="w-12 h-12 text-liquid-blue" />
                    </button>
                    <p className="text-gray-500 font-medium">Listen and Interpret</p>
                </div>

                {/* Input area */}
                <div className="w-full mt-auto space-y-4">
                    <input
                        autoFocus
                        className="w-full p-6 text-xl bg-white/50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-liquid-blue shadow-inner"
                        placeholder="Type your interpretation here..."
                        value={textVal}
                        onChange={e => setTextVal(e.target.value)}
                    />
                </div>
            </div>

            <AnimatePresence>
                {revealed && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                        className="w-full liquid-panel p-8 mt-4"
                    >
                        <div className="text-left space-y-4">
                            <span className="font-bold text-liquid-blue uppercase tracking-widest text-xs">Answer</span>
                            <p className="text-2xl font-medium leading-relaxed">
                                {renderHighlighted(item.Sentence1 || item.Word)}
                            </p>
                            {item.Translation1 && <p className="text-lg text-gray-500">{item.Translation1}</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Ch3 
function Ch3Translation({ item, onNext, progress, vocabulary }: any) {
    const [revealed, setRevealed] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [textVal, setTextVal] = useState('');
    const [viewMode, setViewMode] = useState<'EN' | 'KR'>('EN'); // EN: 영어 보여주기, KR: 한글 보여주기

    useEffect(() => {
        setRevealed(false);
        setTextVal('');
        return () => stopSpeech();
    }, [item, viewMode]);

    const handleAction = () => {
        if (!revealed) setRevealed(true);
        else onNext();
    };

    useGlobalHotkeys(audioRef, handleAction);

    // 툴팁 등을 위한 하이라이팅 로직 (영어일 때만 주로 사용)
    const renderContent = (sentence: string, isEnglish: boolean) => {
        if (!sentence) return '';
        if (!isEnglish) return sentence;

        const words = sentence.split(/(\s+)/);
        return words.map((w, i) => {
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

    // 3장 번역 단축키 처리
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const isInputMode = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

            if (e.code === 'ArrowRight') {
                e.preventDefault();
                onNext();
            } else if (e.code === 'ArrowDown') {
                e.preventDefault();
                speakText(item.Sentence1 || item.Word);
            } else if (e.code === 'Space') {
                if (isInputMode) return; // 입력 중에는 스페이스바 무시
                e.preventDefault();
                speakText(item.Sentence1 || item.Word);
            } else if (e.code === 'Enter') {
                e.preventDefault();
                handleAction();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [item, revealed, onNext, viewMode]);

    return (
        <div className="flex-1 w-full max-w-4xl mt-8 mb-8 flex flex-col relative text-center gap-4">
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-400">{progress}</span>
            <audio ref={audioRef} />

            {/* 모드 선택 스위치 */}
            <div className="flex justify-center mb-2">
                <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => setViewMode('EN')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'EN' ? 'bg-white dark:bg-white/10 shadow-sm text-liquid-blue' : 'text-gray-400'}`}
                    >
                        영어 보여주기
                    </button>
                    <button
                        onClick={() => setViewMode('KR')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'KR' ? 'bg-white dark:bg-white/10 shadow-sm text-liquid-blue' : 'text-gray-400'}`}
                    >
                        한글 보여주기
                    </button>
                </div>
            </div>

            <div className="liquid-panel w-full flex-1 flex flex-col p-8 relative items-center justify-center min-h-[250px]">
                <StarButton item={item} />
                <button
                    onClick={() => speakText(item.Sentence1 || item.Word)}
                    className="absolute top-6 left-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    title="영어 발음 듣기"
                >
                    <Volume2 className="w-6 h-6 text-liquid-blue" />
                </button>
                <h2 className="text-4xl font-semibold leading-relaxed">
                    {renderContent(questionText, viewMode === 'EN')}
                </h2>
            </div>

            <div className="w-full">
                <input
                    autoFocus
                    className="w-full p-6 text-xl bg-white border border-gray-200 dark:bg-black dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-liquid-blue shadow-lg"
                    placeholder={viewMode === 'EN' ? "한글로 번역하세요..." : "영어로 번역하세요..."}
                    value={textVal}
                    onChange={e => setTextVal(e.target.value)}
                />
            </div>

            <AnimatePresence>
                {revealed && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="w-full liquid-panel p-8 text-left"
                    >
                        <span className="font-bold text-liquid-blue uppercase tracking-widest text-xs">Answer</span>
                        <p className="text-3xl mt-2 font-bold leading-relaxed">{answerText}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}



export default App;
