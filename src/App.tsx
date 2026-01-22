import React from 'react';
import Layout from './components/Layout';
import ClockWidget from './components/ClockWidget';
import SearchBar from './components/SearchBar';
import LinkGrid from './components/LinkGrid';
import WeatherWidget from './components/WeatherWidget';
import TodoWidget from './components/TodoWidget';
import AuthForm from './components/AuthForm';

import { useAuth } from './context/AuthContext';
import LanguageSwitcher from './components/LanguageSwitcher';

const Dashboard = () => (
    <Layout>
      <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in-down">
        <ClockWidget />
      </div>
      <div className="w-full py-8 animate-fade-in-up">
        <SearchBar />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full animate-fade-in">
        <div className="lg:col-span-2">
          <LinkGrid />
        </div>
        <div className="flex flex-col space-y-8">
          <WeatherWidget />
          <TodoWidget />
        </div>
      </div>
    </Layout>
);

const AppContent = () => {
  const { isAuthenticated, login } = useAuth();
  console.log('AppContent rendering, auth:', isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md">
           <AuthForm onSuccess={(tk, user) => login(tk, user)} />
        </div>
        <footer className="absolute bottom-6 text-slate-500 text-sm">
           <p>&copy; {new Date().getFullYear()} Navigation Dashboard</p>
        </footer>
      </div>
    );
  }

  return <Dashboard />;
};

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900 text-white p-8 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <pre className="bg-black/50 p-4 rounded text-sm overflow-auto max-w-full">
                {this.state.error?.toString()}
            </pre>
            <button 
                className="mt-4 px-4 py-2 bg-white text-red-900 rounded hover:bg-gray-200"
                onClick={() => {
                    localStorage.removeItem('auth_token');
                    window.location.reload();
                }}
            >
                Reset & Reload
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App(): React.JSX.Element {
  console.log('App rendering');
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
