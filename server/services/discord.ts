import { DiscordUser } from '@shared/schema';

class DiscordService {
  private userCache = new Map<string, DiscordUser>();

  async getUser(userId: string, botToken?: string): Promise<DiscordUser | null> {
    // Check cache first
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)!;
    }

    // Use environment variable if no token provided
    const token = botToken || process.env.DISCORD_BOT_TOKEN;
    
    if (!token) {
      // Return fallback user without avatar
      const fallbackUser: DiscordUser = {
        id: userId,
        username: `User ${userId.slice(-4)}`,
        avatar: null,
      };
      this.userCache.set(userId, fallbackUser);
      return fallbackUser;
    }

    try {
      const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
        headers: {
          Authorization: `Bot ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status}`);
      }

      const userData = await response.json();
      const user: DiscordUser = {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar 
          ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
          : null,
      };

      // Cache the user data
      this.userCache.set(userId, user);
      return user;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      
      // Return fallback user
      const fallbackUser: DiscordUser = {
        id: userId,
        username: `User ${userId.slice(-4)}`,
        avatar: null,
      };
      this.userCache.set(userId, fallbackUser);
      return fallbackUser;
    }
  }
}

export const discordService = new DiscordService();
