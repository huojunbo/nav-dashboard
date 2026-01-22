import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();

    const currentLang = i18n.language;

    const toggleLanguage = () => {
        const newLang = currentLang === 'zh' ? 'en' : 'zh';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
            title={t('language.switchTo', { lang: currentLang === 'zh' ? t('language.en') : t('language.zh') })}
        >
            <Languages className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300 font-medium">
                {currentLang === 'zh' ? '中文' : 'EN'}
            </span>
        </button>
    );
};

export default LanguageSwitcher;
