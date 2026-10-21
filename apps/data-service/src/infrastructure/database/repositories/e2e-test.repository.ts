import type { Kysely } from 'kysely';
import { BaseRepository } from './base.repository.js';

import type { Database, E2eTestsTable } from '@qa-3d/database';

type E2eTestInsert = {
  user_id: string;
  name: string;
  description?: string | null;
  status?: 'draft' | 'published' | 'archived';
  canvas_config_json?: unknown;
};

export class E2eTestRepository extends BaseRepository<'e2e_tests'> {
  constructor(db: Kysely<any>) {
    super(db, 'e2e_tests');
  }

  async findByUserId(userId: string) {
    return this.db
      .selectFrom('e2e_tests')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .execute();
  }

  async create(data: E2eTestInsert) {
    return this.db
      .insertInto('e2e_tests')
      .values({
        ...data,
        canvas_config_json: data.canvas_config_json || {},
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, data: Partial<E2eTestInsert>) {

    const updateData: Record<string, any> = { updated_at: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.canvas_config_json !== undefined) updateData.canvas_config_json = data.canvas_config_json as any;
    return this.db
      .updateTable('e2e_tests')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
