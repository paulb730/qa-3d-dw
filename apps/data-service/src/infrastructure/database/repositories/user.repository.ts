import type { Kysely } from 'kysely';
import { BaseRepository } from './base.repository.js';
import type { Databae, UsersTable } from '@qa-3d/database';

type UserInsert = Omit<UsersTable, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'last_login_at'>;
type UserUpdate = Partial<Pick<UsersTable, 'name' | 'avatar_url' | 'role'>>;

export class UserRepository extends BaseRepository<'users'> {
  constructor(db: Kysely<Database>) {
    super(db, 'users');
  }

  async findByEmail(email: string) {
    return this.db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();
  }

  async create(data: UserInsert) {
    return this.db
      .insertInto('users')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, data: UserUpdate) {
    return this.db
      .updateTable('users')
      .set({ ...data, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async updateLastLogin(id: string) {
    return this.db
      .updateTable('users')
      .set({ last_login_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
