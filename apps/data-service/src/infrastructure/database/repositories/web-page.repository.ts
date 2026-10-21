import type { Kysely } from 'kysely';
import { BaseRepository } from './base.repository.js';


type WebPageInsert = {
  user_id: string;
  url: string;
  name: string;
  description?: string | null;
};

export class WebPageRepository extends BaseRepository<'web_pages'> {
  constructor(db: Kysely<any>) {
    super(db, 'web_pages');
  }

  async findByUserId(userId: string) {
    return this.db
      .selectFrom('web_pages')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .execute();
  }

  async create(data: WebPageInsert) {
    return this.db
      .insertInto('web_pages')
      .values({
        user_id: data.user_id,
        url: data.url,
        name: data.name,
        description: data.description || null,
         processing_status: 'pending',
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updateProcessingStatus(id: string, status: string) {
    return this.db
      .updateTable('web_pages')
      .set({ 
        processing_status: status as any,
        last_processed_at: new Date(),
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
