import { EntityRepository } from '@mikro-orm/mysql';
import { User } from './user.entity';

export class UserRepository extends EntityRepository<User> {
  async getConduitRoster() {
    return this.createQueryBuilder('u')
      .select([
        'u.id',
        'u.username',
        'COUNT(a.id) as totalArticles',
        'SUM(a.favoritesCount) as totalFavorites',
        'MIN(a.createdAt) as firstArticleDate',
      ])
      .leftJoin('u.articles', 'a')
      .groupBy('u.id')
      .orderBy({
        totalFavorites: 'DESC',
        totalArticles: 'DESC',
        firstArticleDate: 'ASC',
      })
      .getResult();
  }
}

