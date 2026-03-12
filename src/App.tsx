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
        <div className="w-full h-full relative overflow-hidden flex flex-col font-sans">
            {/* HEADER */}
            <header className="h-16 w-full flex items-center justify-between px-8 bg-white shrink-0 fixed top-0 left-0 z-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <h1 className="text-gray-800 font-extrabold text-xl tracking-tight">
                        주니어통번역사 9,8급
                    </h1>
                </div>

                {currentChapter > 0 && (
                    <div className="flex gap-4">
                        <button
                            onClick={() => setChapter(0)}
                            className="neu-btn px-6 py-2 text-sm"
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
                        <div className="neu-panel p-10 max-sm w-full text-center text-red-500">
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
            <div className="neu-panel p-12 w-[520px] flex flex-col gap-10">
                <div className="text-center space-y-3 mb-4">
                    <h2 className="text-4xl font-extrabold tracking-tight text-gray-700">Set up Class</h2>
                    <p className="text-sm font-medium text-gray-400">오늘 진행할 테마와 Day를 선택해주세요.</p>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col gap-3">
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

                    <div className="flex flex-col gap-3">
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
                    className="neu-btn-blue w-full py-5 text-xl disabled:opacity-50"
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

    const goPrev = () => {
        if (idx > 0) setIdx(idx - 1);
    };

    return (
        <div className="w-full flex-1 flex flex-col items-center">
            {/* View Mode Toggle & Chapter Tabs */}
            <div className="w-full max-w-4xl px-8 mt-10 flex flex-col gap-8">
                <div className="flex justify-end">
                    <div className="shadow-neu-pressed p-2 rounded-2xl flex gap-1">
                        <button
                            onClick={() => setViewMode('study')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'study' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <BookOpen className="w-4 h-4" />
                            학습 모드
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List className="w-4 h-4" />
                            리스트 보기
                        </button>
                    </div>
                </div>

                <div className="flex shadow-neu-pressed p-2 rounded-[30px] gap-2">
                    {['1장: 어휘 (Flashcard)', '2장: 통역 (Interpretation)', '3장: 번역 (Translation)'].map((label, i) => (
                        <button
                            key={label}
                            onClick={() => {
                                setChapter(i + 1);
                                setIdx(0);
                                setViewMode('study');
                            }}
                            className={`flex-1 text-sm font-bold py-4 rounded-[25px] transition-all ${currentChapter === i + 1
                                ? 'shadow-neu-button text-liquid-blue'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 w-full flex flex-col items-center">
                <AnimatePresence mode="wait">
                    {viewMode === 'list' ? (
                        <GlobalListView key="list" items={data} currentChapter={currentChapter} />
                    ) : (
                        <motion.div
                            key={`chapter-${currentChapter}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full flex flex-col items-center"
                        >
                            {currentChapter === 1 && <Ch1Flashcard item={currentItem} path={classDataPath!} onNext={goNext} onPrev={goPrev} progress={`${idx + 1}/${data.length}`} />}
                            {currentChapter === 2 && <Ch2Interpretation item={currentItem} path={classDataPath!} onNext={goNext} onPrev={goPrev} progress={`${idx + 1}/${data.length}`} vocabulary={data.map(d => d.Word).filter(Boolean)} />}
                            {currentChapter === 3 && <Ch3Translation item={currentItem} path={classDataPath!} onNext={goNext} onPrev={goPrev} progress={`${idx + 1}/${data.length}`} vocabulary={data} />}
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



function StarButton({ item }: { item: any }) {
    const { toggleStar } = useStore();
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                toggleStar(item.id);
            }}
            className="p-3 neu-btn w-12 h-12 absolute top-8 right-8 z-10"
        >
            <Star className={`w-6 h-6 ${item.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
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
            <div className="neu-panel w-full flex-1 flex flex-col overflow-hidden shadow-neu-flat">
                <div className="p-8 border-b border-gray-200/50 flex justify-between items-center bg-white/10">
                    <h3 className="font-extrabold text-xl flex items-center gap-3 text-gray-700">
                        <List className="w-6 h-6 text-liquid-blue" />
                        {currentChapter}장 전체 목록 ({items.length}개)
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Click to listen</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="flex flex-col gap-4">
                        {items.map((item, i) => {
                            const mainText = currentChapter === 2
                                ? (item.Translation1 || item.Meaning)
                                : (item.Word || item.Sentence1);

                            const subText = currentChapter === 2
                                ? (item.Word || item.Sentence1)
                                : (item.Meaning || item.Translation1);

                            const audioText = currentChapter === 2
                                ? (item.Word || item.Sentence1)
                                : (item.Word || item.Sentence1);

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => speakText(audioText)}
                                    className="group w-full flex items-center gap-6 p-6 rounded-[25px] hover:shadow-neu-pressed transition-all text-left bg-neu-bg active:scale-[0.99]"
                                >
                                    <div className="w-10 h-10 rounded-full shadow-neu-button flex items-center justify-center text-sm font-bold text-gray-400 group-hover:text-liquid-blue transition-colors shrink-0">
                                        {i + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-xl text-gray-700 group-hover:text-liquid-blue transition-colors truncate">
                                            {mainText}
                                        </h4>
                                        <p className="text-sm text-gray-400 truncate font-medium mt-1">
                                            {subText}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="p-3 neu-btn rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
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
function Ch1Flashcard({ item, onNext, onPrev, progress }: any) {
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

    // 키보드 단축키: 스페이스·↓ = 다시 읽기, 엔터 = 정답공개/다음, → = 다음(Skip), ← = 이전
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
            if (e.code === 'ArrowRight') {
                e.preventDefault();
                onNext();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                onPrev();
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
    }, [item, revealed, onNext, onPrev]);

    const questionText = viewMode === 'EN' ? item.Word : item.Meaning;
    const answerText = viewMode === 'EN' ? item.Meaning : item.Word;

    return (
        <div className="flex-1 w-full max-w-4xl mt-12 mb-8 flex flex-col items-center gap-8 relative">
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-400">{progress}</span>

            {/* Mode Toggle */}
            <div className="flex justify-center">
                <div className="shadow-neu-pressed p-2 rounded-2xl flex gap-1">
                    <button
                        onClick={() => setViewMode('EN')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'EN' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setViewMode('KR')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'KR' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Korean
                    </button>
                </div>
            </div>

            <div className="neu-panel w-full flex-1 flex flex-col p-12 relative items-center justify-center min-h-[400px]">
                <StarButton item={item} />
                <button
                    onClick={() => speakText(item.Word)}
                    className="absolute top-8 left-8 neu-btn p-3 w-14 h-14"
                    title="다시 듣기 (스페이스바 or ↓)"
                >
                    <Volume2 className="w-7 h-7 text-liquid-blue" />
                </button>

                <div className="text-center space-y-4">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest opacity-60">
                        {viewMode === 'EN' ? 'Vocabulary' : 'Definition'}
                    </p>
                    <h2 className={`${viewMode === 'EN' ? 'text-7xl' : 'text-6xl'} font-extrabold tracking-tight text-gray-700 leading-tight`}>
                        {questionText}
                    </h2>
                    <p className="text-xs font-bold text-gray-300 mt-4 tracking-tighter uppercase">{item.Theme}</p>
                </div>
            </div>

            <div className="flex gap-6 w-full mt-4">
                <button
                    onClick={handleAction}
                    className="neu-btn flex-1 py-6 text-xl"
                >
                    {revealed ? '다음으로 (Enter)' : '뜻 확인하기 (Enter)'}
                </button>
                <button
                    onClick={onNext}
                    className="neu-btn-blue w-24 py-6 text-lg"
                >
                    Next
                </button>
            </div>

            <AnimatePresence>
                {revealed && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="w-full neu-panel p-10 mt-6 shadow-neu-pressed"
                    >
                        <div className="text-center space-y-4">
                            <span className="font-bold text-liquid-blue uppercase tracking-widest text-xs">Meaning</span>
                            <p className={`${viewMode === 'EN' ? 'text-4xl' : 'text-5xl'} font-bold text-gray-700 leading-tight`}>
                                {answerText}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Ch2 
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

    // 키보드 단축키
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                if (e.code === 'Enter') {
                    e.preventDefault();
                    handleAction();
                }
                // 입력창에서도 왼쪽 방향키로 뒤로 갈 수 있게 (내용이 없을 때만 또는 항상 - 여기서는 항상 뒤로 가게 설정)
                if (e.code === 'ArrowLeft' && textVal === '') {
                    onPrev();
                }
                return;
            }
            if (e.code === 'ArrowRight') {
                e.preventDefault();
                onNext();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                onPrev();
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
    }, [item, revealed, onNext, onPrev, textVal]);

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
        <div className="flex-1 w-full max-w-4xl mt-12 mb-8 flex flex-col relative text-center gap-6">
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-400">{progress}</span>
            <audio ref={audioRef} />

            <div className="neu-panel w-full flex-1 flex flex-col p-12 relative items-center justify-center min-h-[350px]">
                <StarButton item={item} />

                {/* Audio Controller Visualization */}
                <div className="flex flex-col items-center gap-8">
                    <button
                        onClick={() => speakText(item.Sentence1 || item.Word)}
                        className="w-28 h-28 rounded-full neu-btn pulse-animation"
                    >
                        <Volume2 className="w-12 h-12 text-liquid-blue" />
                    </button>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Listen and Interpret</p>
                </div>
            </div>

            {/* Input area */}
            <div className="w-full flex gap-4">
                <input
                    autoFocus
                    className="neu-input flex-1 p-8 text-2xl"
                    placeholder="Type your interpretation here..."
                    value={textVal}
                    onChange={e => setTextVal(e.target.value)}
                />
                <button onClick={onNext} className="neu-btn-blue w-24 py-6 text-lg">Next</button>
            </div>

            <AnimatePresence>
                {revealed && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="w-full neu-panel p-10 text-left shadow-neu-pressed bg-opacity-50"
                    >
                        <div className="space-y-4">
                            <span className="font-bold text-liquid-blue uppercase tracking-widest text-xs">Answer</span>
                            <p className="text-3xl font-extrabold text-gray-700 leading-relaxed">
                                {renderHighlighted(item.Sentence1 || item.Word)}
                            </p>
                            {item.Translation1 && <p className="text-xl text-gray-400 font-medium">{item.Translation1}</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Ch3 
function Ch3Translation({ item, onNext, onPrev, progress, vocabulary }: any) {
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

    // 3장 번역 단축키 처리
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const isInputMode = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

            if (e.code === 'ArrowRight') {
                e.preventDefault();
                onNext();
            } else if (e.code === 'ArrowLeft') {
                if (isInputMode && textVal !== '') return; // 입력 중일 때는 텍스트가 있으면 이동 방지
                e.preventDefault();
                onPrev();
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
    }, [item, revealed, onNext, onPrev, viewMode, textVal]);

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

    return (
        <div className="flex-1 w-full max-w-4xl mt-12 mb-8 flex flex-col relative text-center gap-8">
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-400">{progress}</span>
            <audio ref={audioRef} />

            {/* 모드 선택 스위치 */}
            <div className="flex justify-center">
                <div className="shadow-neu-pressed p-2 rounded-2xl flex gap-1">
                    <button
                        onClick={() => setViewMode('EN')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'EN' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        영어 보여주기
                    </button>
                    <button
                        onClick={() => setViewMode('KR')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'KR' ? 'shadow-neu-button text-liquid-blue' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        한글 보여주기
                    </button>
                </div>
            </div>

            <div className="neu-panel w-full flex-1 flex flex-col p-12 relative items-center justify-center min-h-[300px]">
                <StarButton item={item} />
                <button
                    onClick={() => speakText(item.Sentence1 || item.Word)}
                    className="absolute top-8 left-8 neu-btn p-3 w-14 h-14"
                    title="영어 발음 듣기"
                >
                    <Volume2 className="w-7 h-7 text-liquid-blue" />
                </button>
                <h2 className="text-4xl font-extrabold text-gray-700 leading-relaxed px-10">
                    {renderContent(questionText, viewMode === 'EN')}
                </h2>
            </div>

            <div className="w-full flex gap-4">
                <input
                    autoFocus
                    className="neu-input flex-1 p-8 text-2xl"
                    placeholder={viewMode === 'EN' ? "한글로 번역하세요..." : "영어로 번역하세요..."}
                    value={textVal}
                    onChange={e => setTextVal(e.target.value)}
                />
                <button onClick={onNext} className="neu-btn-blue w-24 py-6 text-lg">Next</button>
            </div>

            <AnimatePresence>
                {revealed && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="w-full neu-panel p-10 text-left shadow-neu-pressed bg-opacity-50"
                    >
                        <div className="space-y-4">
                            <span className="font-bold text-liquid-blue uppercase tracking-widest text-xs">Answer</span>
                            <p className="text-3xl font-extrabold text-gray-700 leading-relaxed">{answerText}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}



export default App;
