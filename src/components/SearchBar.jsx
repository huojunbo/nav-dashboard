import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

const SEARCH_ENGINES = {
    google: {
        name: 'Google',
        url: 'https://www.google.com/search?q=',
        icon: 'G',
        color: 'bg-blue-500',
    },
    bing: {
        name: 'Bing',
        url: 'https://www.bing.com/search?q=',
        icon: 'B',
        color: 'bg-cyan-500',
    },
    duckduckgo: {
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q=',
        icon: 'D',
        color: 'bg-orange-500',
    },
    baidu: {
        name: 'Baidu',
        url: 'https://www.baidu.com/s?wd=',
        icon: '百',
        color: 'bg-red-500',
    },
};

const SearchBar = () => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [engine, setEngine] = useState(() => {
        const saved = localStorage.getItem('search-engine');
        return saved && SEARCH_ENGINES[saved] ? saved : 'google';
    });
    const [showEngineMenu, setShowEngineMenu] = useState(false);
    const buttonRef = useRef(null);
    const containerRef = useRef(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowEngineMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!showEngineMenu) return;
        const updatePos = () => {
            const btn = buttonRef.current;
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const menuWidth = 192; // w-48 = 12rem
            const menuHeightApprox = 200; // approximate menu height
            let left = Math.min(Math.max(8, rect.left), vw - menuWidth - 8);
            let top = rect.bottom + 8;
            if (top > vh - menuHeightApprox) {
                top = Math.max(8, rect.top - 8 - menuHeightApprox);
            }
            setMenuPos({ top, left });
        };
        updatePos();
        window.addEventListener('resize', updatePos);
        window.addEventListener('scroll', updatePos, true);
        return () => {
            window.removeEventListener('resize', updatePos);
            window.removeEventListener('scroll', updatePos, true);
        };
    }, [showEngineMenu]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        const url = SEARCH_ENGINES[engine].url + encodeURIComponent(query);
        window.location.href = url;
    };

    const selectEngine = (engineKey) => {
        setEngine(engineKey);
        localStorage.setItem('search-engine', engineKey);
        setShowEngineMenu(false);
    };

    const currentEngine = SEARCH_ENGINES[engine];

    return (
        <div className="relative z-[10000]" ref={containerRef}>

            <form onSubmit={handleSearch} className="relative">
                {/* Search Engine Selector */}
                <div className="absolute inset-y-0 left-0 z-20">
                    <button
                        ref={buttonRef}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!showEngineMenu && buttonRef.current) {
                                const rect = buttonRef.current.getBoundingClientRect();
                                const vw = window.innerWidth;
                                const vh = window.innerHeight;
                                const menuWidth = 192; // w-48 = 12rem
                                const menuHeightApprox = 200;
                                let left = Math.min(Math.max(8, rect.left), vw - menuWidth - 8);
                                let top = rect.bottom + 8;
                                if (top > vh - menuHeightApprox) {
                                    top = Math.max(8, rect.top - 8 - menuHeightApprox);
                                }
                                setMenuPos({ top, left });
                            }
                            setShowEngineMenu((prev) => !prev);
                        }}
                        className="flex items-center gap-2 pl-4 pr-2 h-full hover:bg-white/5 rounded-l-xl transition-colors"
                    >
                        <span className={`w-7 h-7 ${currentEngine.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                            {currentEngine.icon}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showEngineMenu ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Search Icon */}
                <div className="absolute inset-y-0 left-20 flex items-center pointer-events-none z-10">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="block w-full pl-28 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/10 backdrop-blur-md transition-all shadow-lg text-lg"
                    placeholder={`${t('search.placeholder')} ${currentEngine.name}`}
                />

                {showEngineMenu && createPortal(
                    <>
                        <div
                            className="fixed inset-0 z-[10000] bg-transparent"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowEngineMenu(false);
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowEngineMenu(false);
                            }}
                        />
                        <div
                            className="fixed w-48 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[10001] pointer-events-auto"
                            style={{ top: menuPos.top, left: menuPos.left }}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {Object.entries(SEARCH_ENGINES).map(([key, eng]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        selectEngine(key);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${engine === key ? 'bg-white/10' : ''}`}
                                >
                                    <span className={`w-8 h-8 ${eng.color} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
                                        {eng.icon}
                                    </span>
                                    <span className="text-white">{eng.name}</span>
                                    {engine === key && <span className="ml-auto text-blue-400 text-sm">✓</span>}
                                </button>
                            ))}
                        </div>
                    </>,
                    document.body
                )}
            </form>
        </div>
    );
};

export default SearchBar;
