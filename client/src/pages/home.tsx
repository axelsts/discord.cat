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
          <div className="w-10 h-10 text-blue-600 dark:text-blue-400">
            <svg viewBox="0 0 32 32" fill="currentColor" className="w-full h-full">
              {/* Cat body */}
              <ellipse cx="16" cy="20" rx="7" ry="5" fill="currentColor"/>
              
              {/* Cat head */}
              <circle cx="16" cy="12" r="6" fill="currentColor"/>
              
              {/* Left ear */}
              <path d="M10 8L12 12L8 11Z" fill="currentColor"/>
              {/* Right ear */}
              <path d="M22 8L24 11L20 12Z" fill="currentColor"/>
              
              {/* Inner ears */}
              <path d="M10.5 9L11.5 11.5L9 10.5Z" fill="white" opacity="0.8"/>
              <path d="M21.5 9L23 10.5L20.5 11.5Z" fill="white" opacity="0.8"/>
              
              {/* Eyes */}
              <ellipse cx="13" cy="11" rx="1.5" ry="2" fill="white"/>
              <ellipse cx="19" cy="11" rx="1.5" ry="2" fill="white"/>
              <ellipse cx="13" cy="11.2" rx="0.8" ry="1.2" fill="currentColor"/>
              <ellipse cx="19" cy="11.2" rx="0.8" ry="1.2" fill="currentColor"/>
              <ellipse cx="13" cy="10.5" rx="0.3" ry="0.5" fill="white"/>
              <ellipse cx="19" cy="10.5" rx="0.3" ry="0.5" fill="white"/>
              
              {/* Nose */}
              <path d="M15 13.5L16 12.5L17 13.5L16 14Z" fill="#FF69B4"/>
              
              {/* Mouth */}
              <path d="M14 15C14.5 16 15.2 16.5 16 16.5C16.8 16.5 17.5 16 18 15" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round"/>
              <path d="M16 14L16 15.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
              
              {/* Whiskers */}
              <path d="M8 11L12 10.5M8 12L12 11.5M8 13L12 12.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
              <path d="M24 11L20 10.5M24 12L20 11.5M24 13L20 12.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
              
              {/* Tail - curved and fluffy */}
              <path d="M23 18C25 16 27 14 28 10C29 12 27 16 25 18C24 19 23 19 23 18Z" fill="currentColor"/>
              <path d="M24 17C26 15 27.5 13 28.5 10.5C29 12 28 15 26 17C25.2 17.8 24.2 17.8 24 17Z" fill="white" opacity="0.3"/>
              
              {/* Paws */}
              <ellipse cx="12" cy="24" rx="1.5" ry="1" fill="currentColor"/>
              <ellipse cx="20" cy="24" rx="1.5" ry="1" fill="currentColor"/>
              <ellipse cx="12" cy="24" rx="1" ry="0.5" fill="white" opacity="0.6"/>
              <ellipse cx="20" cy="24" rx="1" ry="0.5" fill="white" opacity="0.6"/>
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
