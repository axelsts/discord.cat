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
    return response.count;
  }

  private async getUniqueUsers(): Promise<number> {
    const response = await this.client.search({
      index: this.indices,
      size: 0,
      body: {
        aggs: {
          unique_users: {
            cardinality: {
              field: 'author_id.keyword',
            },
          },
        },
      },
    });
    return response.body.aggregations.unique_users.value;
  }

  private async getUniqueGuilds(): Promise<number> {
    const response = await this.client.search({
      index: this.indices,
      size: 0,
      body: {
        aggs: {
          unique_guilds: {
            cardinality: {
              field: 'guild_id.keyword',
            },
          },
        },
      },
    });
    return response.body.aggregations.unique_guilds.value;
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

      // Add content filter if provided
      if (filters.content) {
        query.bool.must.push({
          multi_match: {
            query: filters.content,
            fields: ['content'],
            type: 'phrase_prefix',
          },
        });
      }

      // Add exact match filters
      if (filters.author_id) {
        query.bool.must.push({
          term: { 'author_id.keyword': filters.author_id },
        });
      }

      if (filters.channel_id) {
        query.bool.must.push({
          term: { 'channel_id.keyword': filters.channel_id },
        });
      }

      if (filters.guild_id) {
        query.bool.must.push({
          term: { 'guild_id.keyword': filters.guild_id },
        });
      }

      // If no filters provided, match all
      if (query.bool.must.length === 0) {
        query.bool.must.push({ match_all: {} });
      }

      const response = await this.client.search({
        index: this.indices,
        body: {
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
        },
      });

      const messages: DiscordMessage[] = response.body.hits.hits.map((hit: any) => hit._source);
      const total = response.body.hits.total.value;
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
