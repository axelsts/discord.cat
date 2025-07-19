import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { AnimatedCounter } from "@/components/animated-counter";
import { SearchInterface } from "@/components/search-interface";
import { SearchResults } from "@/components/search-results";
import { Statistics, SearchFilters } from "@shared/schema";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}

function HomePage() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    content: "",
    author_id: "",
    channel_id: "",
    guild_id: "",
    sort: "desc",
    page: 1,
  });

  const [hasSearched, setHasSearched] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<Statistics>({
    queryKey: ["/api/stats"],
  });

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setHasSearched(true);
  };

  const handlePageChange = (page: number) => {
    setSearchFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 text-gray-800 dark:text-gray-200">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17C15.24 5.06 14.32 5 13.39 5C11.1 5 8.8 5.18 6.53 5.52L5.8 4.8L4.39 6.21L6 7.81V9C6 10.1 6.9 11 8 11V19C8 20.1 8.9 21 10 21H14C15.1 21 16 20.1 16 19V11C17.1 11 18 10.1 18 9Z"/>
            </svg>
          </div>
          <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            discord.cat
          </span>
        </div>
        
        {/* Theme Toggle */}
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-8 py-16">
        {/* Stats Counter */}
        <div className="flex items-center justify-center space-x-16 mb-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-32 rounded"></div>
              ) : (
                <AnimatedCounter value={stats?.total_messages || 0} />
              )}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              TOTAL MESSAGES
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-24 rounded"></div>
              ) : (
                <AnimatedCounter value={stats?.unique_users || 0} />
              )}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              TOTAL USERS
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-16 rounded"></div>
              ) : (
                <AnimatedCounter value={stats?.unique_guilds || 0} />
              )}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              TOTAL SERVERS
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mb-12">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            Discord.cat
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Advanced Discord message exploration and analytics platform. Search through 
            conversations, analyze user activity, and discover insights with precision and style.
          </p>
        </div>

        {/* Search Interface */}
        <SearchInterface onSearch={handleSearch} />

        {/* Search Results */}
        {hasSearched && (
          <div className="mt-8 w-full flex justify-center">
            <SearchResults 
              filters={searchFilters} 
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider defaultTheme="light">
      <HomePage />
    </ThemeProvider>
  );
}
