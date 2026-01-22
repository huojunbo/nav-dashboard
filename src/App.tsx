import React from 'react';
import Layout from './components/Layout';
import ClockWidget from './components/ClockWidget';
import SearchBar from './components/SearchBar';
import LinkGrid from './components/LinkGrid';
import WeatherWidget from './components/WeatherWidget';
import TodoWidget from './components/TodoWidget';

function App(): React.JSX.Element {
  return (
    <Layout>
      {/* Top Section */}
      <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in-down">
        <ClockWidget />
      </div>

      {/* Search Section */}
      <div className="w-full py-8 animate-fade-in-up">
        <SearchBar />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full animate-fade-in">

        {/* Left Column: Link Grid (Spans 2 columns on large screens) */}
        <div className="lg:col-span-2">
          <LinkGrid />
        </div>

        {/* Right Column: Widgets */}
        <div className="flex flex-col space-y-8">
          <WeatherWidget />
          <TodoWidget />
        </div>

      </div>
    </Layout>
  );
}

export default App;
