import React, { ReactNode } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
  showLogout?: boolean;
}

const Layout = ({ children, showLogout = true }: LayoutProps): React.JSX.Element => {
    const { t } = useTranslation();
    
    // Safely try to get auth context
    let logout: () => void = () => console.warn('Auth context not available');
    try {
        const auth = useAuth();
        logout = auth.logout;
    } catch (e) {
        console.warn('Layout rendered outside AuthProvider');
    }

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-10 px-4 sm:px-8 transition-colors duration-500">
            <div className="w-full max-w-5xl space-y-8">
                {/* Top Section: Clock & Date */}

                {/* Middle Section: Search */}

                {/* Bottom Section: Widgets & Links */}
                {children}
            </div>

            {/* Language Switcher & Logout */}
            <div className="fixed top-4 right-4 flex gap-4 items-center">
                <LanguageSwitcher />
                {showLogout && (
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title={t('auth.logout')}
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Footer / Credits */}
            <footer className="mt-auto py-6 text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Navigation Dashboard</p>
            </footer>
        </div>
    );
};

export default Layout;
