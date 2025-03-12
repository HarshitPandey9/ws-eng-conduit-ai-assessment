import { EntityRepository } from '@mikro-orm/mysql';
import { User } from './user.entity';
import { ConduitRosterEntry } from './user.types'; // Import the type

export class UserRepository extends EntityRepository<User> {
  async getConduitRoster(): Promise<ConduitRosterEntry[]> {
    const roster = await this.createQueryBuilder('u')
      .select([
        'u.username',
        'COUNT(a.id) as totalArticlesAuthored',
        'COALESCE(SUM(a.favoritesCount), 0) as totalFavoritesReceived',
        'MIN(a.createdAt) as dateOfFirstPostedArticle',
      ])
      .leftJoin('u.articles', 'a')
      .groupBy('u.id')
      .orderBy({
        totalFavoritesReceived: 'DESC',
        totalArticlesAuthored: 'DESC',
        dateOfFirstPostedArticle: 'ASC',
      })
      .execute();

    return roster.map((user: Record<string, any>) => ({
      username: user.username as string,
      totalArticlesAuthored: Number(user.totalArticlesAuthored) || 0,
      totalFavoritesReceived: Number(user.totalFavoritesReceived) || 0,
      dateOfFirstPostedArticle: user.dateOfFirstPostedArticle || null,
    }));
  }
}


