import React, { ReactNode } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps): React.JSX.Element => {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-10 px-4 sm:px-8 transition-colors duration-500">
            <div className="w-full max-w-5xl space-y-8">
                {/* Top Section: Clock & Date */}

                {/* Middle Section: Search */}

                {/* Bottom Section: Widgets & Links */}
                {children}
            </div>

            {/* Language Switcher */}
            <div className="fixed top-4 right-4">
                <LanguageSwitcher />
            </div>

            {/* Footer / Credits */}
            <footer className="mt-auto py-6 text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Navigation Dashboard</p>
            </footer>
        </div>
    );
};

export default Layout;
