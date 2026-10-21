import type { Kysely  } from 'kysely';
import type { Database } from '@qa-3d/database';

export interface IdentifiableTable {
  id: any;
}

type TablesWithId<DB> = {
  [K in keyof DB]: DB[K] extends IdentifiableTable ? K : never;
}[keyof DB];

export abstract class BaseRepository<T extends TablesWithId<Database>> {
  protected readonly db: Kysely<Database>;
  protected readonly tableName: T;

  constructor(db: Kysely<Database>, tableName: T) {
    this.db = db;
    this.tableName = tableName;
  }

  async findById(id: string) {
    type IdType = Database[T] extends { id: infer I } ? I : never;
    const query = this.db.selectFrom(this.tableName) as any;
    return query
      .selectAll()
      .where('id' as any, '=', id as unknown as IdType)
      .executeTakeFirst();
  }

  async findAll(limit = 100, offset = 0) {
    const query = this.db.selectFrom(this.tableName) as any;
    return query
      .selectAll()
      .limit(limit)
      .offset(offset)
      .orderBy('created_at' as any, 'desc')
      .execute();
  }

  async delete(id: string): Promise<boolean> {
    type IdType = Database[T] extends { id: infer I } ? I : never;
    const query = this.db.deleteFrom(this.tableName) as any;

    const result = query
          .where('id', '=', id as unknown as IdType)
      .executeTakeFirst();
      
    return Number(result.numDeletedRows) > 0;
  }
}
