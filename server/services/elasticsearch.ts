import { Client } from '@elastic/elasticsearch';
import { DiscordMessage, Statistics, SearchFilters, SearchResults } from '@shared/schema';

class ElasticsearchService {
  private client: Client;
  private indices = ['chunk1', 'chunk2', 'chunk3', 'chunk4', 'chunk5'];

  constructor() {
    const cloudId = process.env.ELASTICSEARCH_CLOUD_ID;
    const username = process.env.ELASTICSEARCH_USERNAME;
    const password = process.env.ELASTICSEARCH_PASSWORD;

    if (!cloudId || !username || !password) {
      throw new Error('Elasticsearch credentials not configured');
    }

    this.client = new Client({
      cloud: { id: cloudId },
      auth: { username, password },
    });
  }

  async getStatistics(): Promise<Statistics> {
    try {
      const [totalMessages, uniqueUsers, uniqueGuilds] = await Promise.all([
        this.getTotalMessages(),
        this.getUniqueUsers(),
        this.getUniqueGuilds(),
      ]);

      return {
        total_messages: totalMessages,
        unique_users: uniqueUsers,
        unique_guilds: uniqueGuilds,
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error('Failed to fetch statistics');
    }
  }

  private async getTotalMessages(): Promise<number> {
    const response = await this.client.count({
      index: this.indices,
    });
    
    // Handle both old and new response formats
    const count = response.count || response.body?.count;
    if (typeof count !== 'number') {
      console.error('Unexpected count response format:', JSON.stringify(response, null, 2));
      throw new Error('Invalid count response format');
    }
    
    return count;
  }

  private async getUniqueUsers(): Promise<number> {
    try {
      const response = await this.client.search({
        index: this.indices,
        size: 0,
        aggs: {
          unique_users: {
            cardinality: {
              field: 'author_id',
            },
          },
        },
      });
      
      // Handle both old and new response formats
      const aggregations = response.aggregations || response.body?.aggregations;
      
      if (!aggregations || !aggregations.unique_users) {
        console.error('No aggregations found in response');
        return 0; // Return 0 instead of throwing to keep the app working
      }
      
      return aggregations.unique_users.value || 0;
    } catch (error) {
      console.error('Error in getUniqueUsers:', error);
      return 0; // Return 0 instead of throwing to keep the app working
    }
  }

  private async getUniqueGuilds(): Promise<number> {
    try {
      const response = await this.client.search({
        index: this.indices,
        size: 0,
        aggs: {
          unique_guilds: {
            cardinality: {
              field: 'guild_id',
            },
          },
        },
      });
      
      // Handle both old and new response formats
      const aggregations = response.aggregations || response.body?.aggregations;
      
      if (!aggregations || !aggregations.unique_guilds) {
        console.error('No aggregations found in response');
        return 0; // Return 0 instead of throwing to keep the app working
      }
      
      return aggregations.unique_guilds.value || 0;
    } catch (error) {
      console.error('Error in getUniqueGuilds:', error);
      return 0; // Return 0 instead of throwing to keep the app working
    }
  }

  async searchMessages(filters: SearchFilters): Promise<SearchResults> {
    try {
      const pageSize = 50;
      const from = (filters.page - 1) * pageSize;

      const query: any = {
        bool: {
          must: [],
        },
      };

      // Add content filter if provided - improved search
      if (filters.content) {
        query.bool.must.push({
          bool: {
            should: [
              // Exact phrase match (highest priority)
              {
                match_phrase: {
                  content: {
                    query: filters.content,
                    boost: 3,
                  },
                },
              },
              // Phrase prefix match
              {
                match_phrase_prefix: {
                  content: {
                    query: filters.content,
                    boost: 2,
                  },
                },
              },
              // Fuzzy match for typos
              {
                match: {
                  content: {
                    query: filters.content,
                    fuzziness: 'AUTO',
                    boost: 1,
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        });
      }

      // Add exact match filters
      if (filters.author_id) {
        query.bool.must.push({
          term: { 'author_id': filters.author_id },
        });
      }

      if (filters.channel_id) {
        query.bool.must.push({
          term: { 'channel_id': filters.channel_id },
        });
      }

      if (filters.guild_id) {
        query.bool.must.push({
          term: { 'guild_id': filters.guild_id },
        });
      }

      // If no filters provided, match all
      if (query.bool.must.length === 0) {
        query.bool.must.push({ match_all: {} });
      }

      const response = await this.client.search({
        index: this.indices,
        query,
        sort: [
          {
            timestamp: {
              order: filters.sort,
            },
          },
        ],
        from,
        size: pageSize,
      });

      // Handle both old and new response formats
      const hits = response.hits || response.body?.hits;
      if (!hits) {
        console.error('Unexpected search response format:', JSON.stringify(response, null, 2));
        throw new Error('Invalid search response format');
      }
      
      const messages: DiscordMessage[] = hits.hits.map((hit: any) => hit._source);
      const total = typeof hits.total === 'number' ? hits.total : hits.total?.value || 0;
      const hasMore = from + pageSize < total;

      return {
        messages,
        total,
        page: filters.page,
        has_more: hasMore,
      };
    } catch (error) {
      console.error('Error searching messages:', error);
      throw new Error('Failed to search messages');
    }
  }
}

export const elasticsearchService = new ElasticsearchService();
