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
    // Only search if there's actual content to search for
    if (!filters.content?.trim() && !filters.author_id?.trim() && !filters.channel_id?.trim() && !filters.guild_id?.trim()) {
      setHasSearched(false);
      return;
    }
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
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 text-blue-600 dark:text-blue-400">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              {/* Cat body - side view */}
              <ellipse cx="12" cy="16" rx="5" ry="3" fill="currentColor"/>
              
              {/* Cat head - side view */}
              <circle cx="8" cy="10" r="4" fill="currentColor"/>
              
              {/* Ear */}
              <path d="M6 7L8 6L9 9Z" fill="currentColor"/>
              
              {/* Eye */}
              <circle cx="7" cy="9" r="1" fill="white"/>
              <circle cx="7" cy="9" r="0.5" fill="currentColor"/>
              
              {/* Nose */}
              <circle cx="4.5" cy="10.5" r="0.3" fill="#FF69B4"/>
              
              {/* Whiskers */}
              <path d="M1 9L4 9.5M1 10L4 10M1 11L4 10.5" stroke="white" strokeWidth="0.5" strokeLinecap="round"/>
              
              {/* Tail - curved upward */}
              <path d="M17 16C19 14 20 12 19 8C20 10 19 13 17 15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
              
              {/* Legs */}
              <rect x="9" y="18" width="1" height="2" fill="currentColor"/>
              <rect x="13" y="18" width="1" height="2" fill="currentColor"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
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
