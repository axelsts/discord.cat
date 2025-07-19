import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { SearchResults as SearchResultsType, SearchFilters, DiscordUser } from "@shared/schema";

interface SearchResultsProps {
  filters: SearchFilters;
  onPageChange: (page: number) => void;
}

export function SearchResults({ filters, onPageChange }: SearchResultsProps) {
  const { data: results, isLoading, error } = useQuery<SearchResultsType>({
    queryKey: ["/api/search", filters],
    enabled: Object.values(filters).some(value => value && value !== ""),
  });

  // Cache for user data
  const [userCache, setUserCache] = useState<Record<string, DiscordUser>>({});

  // Fetch user data for messages
  const { data: users } = useQuery<Record<string, DiscordUser>>({
    queryKey: ["/api/users", results?.messages.map(m => m.author_id).join(",")],
    queryFn: async () => {
      if (!results?.messages.length) return {};
      
      const uniqueUserIds = [...new Set(results.messages.map(m => m.author_id))];
      const userPromises = uniqueUserIds.map(async (userId) => {
        if (userCache[userId]) return { [userId]: userCache[userId] };
        
        try {
          const response = await fetch(`/api/user/${userId}`);
          if (response.ok) {
            const user = await response.json();
            return { [userId]: user };
          }
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
        }
        
        return { [userId]: { id: userId, username: `User ${userId.slice(-4)}`, avatar: null } };
      });

      const userResults = await Promise.all(userPromises);
      const usersMap = userResults.reduce((acc, userObj) => ({ ...acc, ...userObj }), {});
      setUserCache(prev => ({ ...prev, ...usersMap }));
      return usersMap;
    },
    enabled: !!results?.messages.length,
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
  };

  if (!Object.values(filters).some(value => value && value !== "")) {
    return (
      <div className="w-full max-w-4xl">
        <Card className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-300">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Start searching to see results</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl">
        <Card className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-300">
          <CardContent className="pt-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl">
        <Card className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-300">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-red-500">Error loading search results. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results || results.messages.length === 0) {
    return (
      <div className="w-full max-w-4xl">
        <Card className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-300">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No messages found matching your search.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-4">
      <Card className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-300">
        <CardContent className="pt-6">
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Found {results.total.toLocaleString()} messages
          </div>
          
          <div className="space-y-4">
            {results.messages.map((message) => {
              const user = users?.[message.author_id];
              return (
                <div key={message.message_id} className="flex items-start space-x-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.username} />
                    <AvatarFallback>
                      {user?.username?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {user?.username || `User ${message.author_id.slice(-4)}`}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-2 break-words">
                      {message.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Guild: {message.guild_id}</span>
                      <span>Channel: {message.channel_id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {(results.page > 1 || results.has_more) && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(results.page - 1)}
            disabled={results.page <= 1}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
            Page {results.page}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(results.page + 1)}
            disabled={!results.has_more}
            className="flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
