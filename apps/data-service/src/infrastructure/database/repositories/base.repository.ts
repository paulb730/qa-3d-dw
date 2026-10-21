import type { Kysely } from 'kysely';
import type { Database } from '@qa-3d/database';

export abstract class BaseRepository<T extends string> {
  protected readonly db: Kysely<Database>;
  protected readonly tableName: T;

  constructor(db: Kysely<Database>, tableName: T) {
    this.db = db;
    this.tableName = tableName;
  }

  async findById(id: string) {
    return this.db
      .selectFrom(this.tableName)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findAll(limit = 100, offset = 0) {
    return this.db
      .selectFrom(this.tableName)
      .selectAll()
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc')
      .execute();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom(this.tableName)
      .where('id', '=', id)
      .executeTakeFirst();
    return Number(result.numDeletedRows) > 0;
  }
}
