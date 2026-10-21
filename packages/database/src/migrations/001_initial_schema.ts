import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  
  // ============================================
  // 1. USERS
  // ============================================
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('password_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('avatar_url', 'text')
    .addColumn('role', 'varchar(50)', (col) => col.notNull().defaultTo('qa_engineer'))
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('last_login_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  // ============================================
  // 2. SESSIONS
  // ============================================
  await db.schema
    .createTable('sessions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('token_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('ip_address', 'varchar(45)')
    .addColumn('user_agent', 'text')
    .addColumn('expires_at', 'timestamp', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema.createIndex('sessions_user_id_idx').on('sessions').column('user_id').execute();

  // ============================================
  // 3. WEB PAGES
  // ============================================
  await db.schema
    .createTable('web_pages')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('url', 'text', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('processing_status', 'varchar(50)', (col) => col.notNull().defaultTo('pending'))
    .addColumn('last_processed_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema.createIndex('web_pages_user_id_idx').on('web_pages').column('user_id').execute();

  // ============================================
  // 4. DOM SNAPSHOTS
  // ============================================
  await db.schema
    .createTable('dom_snapshots')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('web_page_id', 'uuid', (col) => col.notNull().references('web_pages.id').onDelete('cascade'))
    .addColumn('html_content', 'text', (col) => col.notNull())
    .addColumn('total_elements_found', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('processing_duration_ms', 'integer')
    .addColumn('status', 'varchar(50)', (col) => col.notNull().defaultTo('success'))
    .addColumn('error_message', 'text')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema.createIndex('dom_snapshots_web_page_id_idx').on('dom_snapshots').column('web_page_id').execute();

  // ============================================
  // 5. COMPONENT TYPES
  // ============================================
  await db.schema
    .createTable('component_types')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(100)', (col) => col.notNull().unique())
    .addColumn('html_tag', 'varchar(50)', (col) => col.notNull())
    .addColumn('category', 'varchar(50)', (col) => col.notNull())
    .addColumn('icon_3d', 'varchar(255)')
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  // ============================================
  // 6. LOCATORS
  // ============================================
  await db.schema
    .createTable('locators')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('dom_snapshot_id', 'uuid', (col) => col.notNull().references('dom_snapshots.id').onDelete('cascade'))
    .addColumn('component_type_id', 'uuid', (col) => col.notNull().references('component_types.id'))
    .addColumn('locator_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('locator_value', 'text', (col) => col.notNull())
    .addColumn('element_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('element_text', 'text')
    .addColumn('stability_score', sql`numeric(5,2)` , (col) => col.notNull().defaultTo(0))
    .addColumn('is_default_stable', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('position_x', 'numeric')
    .addColumn('position_y', 'numeric')
    .addColumn('screenshot_url', 'text')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema.createIndex('locators_dom_snapshot_id_idx').on('locators').column('dom_snapshot_id').execute();
  await db.schema.createIndex('locators_component_type_id_idx').on('locators').column('component_type_id').execute();

  // ============================================
  // 7. E2E TESTS
  // ============================================
  await db.schema
    .createTable('e2e_tests')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('status', 'varchar(50)', (col) => col.notNull().defaultTo('draft'))
    .addColumn('canvas_config_json', 'jsonb', (col) => col.notNull().defaultTo('{}'))
    .addColumn('version', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema.createIndex('e2e_tests_user_id_idx').on('e2e_tests').column('user_id').execute();

  // ============================================
  // 8. TEST NODES
  // ============================================
  await db.schema
    .createTable('test_nodes')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('e2e_test_id', 'uuid', (col) => col.notNull().references('e2e_tests.id').onDelete('cascade'))
    .addColumn('locator_id', 'uuid', (col) => col.notNull().references('locators.id'))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('action_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('action_config_json', 'jsonb', (col) => col.notNull().defaultTo('{}'))
    .addColumn('position_x', 'numeric', (col) => col.notNull().defaultTo(0))
    .addColumn('position_y', 'numeric', (col) => col.notNull().defaultTo(0))
    .addColumn('position_z', 'numeric', (col) => col.notNull().defaultTo(0))
    .addColumn('order_index', 'integer', (col) => col.notNull())
    .addColumn('parent_node_id', 'uuid')
    .addColumn('timeout_ms', 'integer', (col) => col.notNull().defaultTo(30000))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema.createIndex('test_nodes_e2e_test_id_idx').on('test_nodes').column('e2e_test_id').execute();
  await db.schema.createIndex('test_nodes_locator_id_idx').on('test_nodes').column('locator_id').execute();

  // ============================================
  // 9. TEST EXECUTIONS
  // ============================================
  await db.schema
    .createTable('test_executions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('e2e_test_id', 'uuid', (col) => col.notNull().references('e2e_tests.id').onDelete('cascade'))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id'))
    .addColumn('status', 'varchar(50)', (col) => col.notNull().defaultTo('queued'))
    .addColumn('started_at', 'timestamp')
    .addColumn('completed_at', 'timestamp')
    .addColumn('duration_ms', 'integer')
    .addColumn('total_steps', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('passed_steps', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('failed_steps', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('error_summary', 'text')
    .addColumn('browser_info_json', 'jsonb', (col) => col.notNull().defaultTo('{}'))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema.createIndex('test_executions_e2e_test_id_idx').on('test_executions').column('e2e_test_id').execute();
  await db.schema.createIndex('test_executions_user_id_idx').on('test_executions').column('user_id').execute();
  await db.schema.createIndex('test_executions_status_idx').on('test_executions').column('status').execute();

  // ============================================
  // 10. TEST STEPS
  // ============================================
  await db.schema
    .createTable('test_steps')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('test_execution_id', 'uuid', (col) => col.notNull().references('test_executions.id').onDelete('cascade'))
    .addColumn('test_node_id', 'uuid', (col) => col.notNull().references('test_nodes.id'))
    .addColumn('step_index', 'integer', (col) => col.notNull())
    .addColumn('status', 'varchar(50)', (col) => col.notNull().defaultTo('pending'))
    .addColumn('action_performed', 'text')
    .addColumn('locator_used', 'text')
    .addColumn('locator_type_used', 'varchar(50)')
    .addColumn('screenshot_url', 'text')
    .addColumn('video_clip_url', 'text')
    .addColumn('error_message', 'text')
    .addColumn('duration_ms', 'integer')
    .addColumn('executed_at', 'timestamp')
    .execute();

  await db.schema.createIndex('test_steps_execution_id_idx').on('test_steps').column('test_execution_id').execute();
  await db.schema.createIndex('test_steps_node_id_idx').on('test_steps').column('test_node_id').execute();

  // ============================================
  // 11. BUGS
  // ============================================
  await db.schema
    .createTable('bugs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('test_execution_id', 'uuid', (col) => col.notNull().references('test_executions.id').onDelete('cascade'))
    .addColumn('test_step_id', 'uuid')
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('severity', 'varchar(50)', (col) => col.notNull().defaultTo('major'))
    .addColumn('status', 'varchar(50)', (col) => col.notNull().defaultTo('open'))
    .addColumn('steps_to_reproduce_json', 'jsonb')
    .addColumn('expected_result', 'text')
    .addColumn('actual_result', 'text')
    .addColumn('screenshot_url', 'text')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema.createIndex('bugs_execution_id_idx').on('bugs').column('test_execution_id').execute();

  // ============================================
  // 12. TEST RESULT EXPORTS
  // ============================================
  await db.schema
    .createTable('test_result_exports')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('test_execution_id', 'uuid', (col) => col.notNull().references('test_executions.id').onDelete('cascade'))
    .addColumn('export_format', 'varchar(50)', (col) => col.notNull())
    .addColumn('export_data_json', 'jsonb', (col) => col.notNull().defaultTo('{}'))
    .addColumn('file_url', 'text')
    .addColumn('exported_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  // ============================================
  // 13. TEST COMPARISONS
  // ============================================
  await db.schema
    .createTable('test_comparisons')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('e2e_test_id', 'uuid', (col) => col.notNull().references('e2e_tests.id'))
    .addColumn('execution_ids_json', 'jsonb', (col) => col.notNull().defaultTo('[]'))
    .addColumn('comparison_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('comparison_result_json', 'jsonb', (col) => col.notNull().defaultTo('{}'))
    .addColumn('space_3d_config_json', 'jsonb', (col) => col.notNull().defaultTo('{}'))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema.createIndex('test_comparisons_user_id_idx').on('test_comparisons').column('user_id').execute();
  await db.schema.createIndex('test_comparisons_e2e_test_id_idx').on('test_comparisons').column('e2e_test_id').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('test_comparisons').execute();
  await db.schema.dropTable('test_result_exports').execute();
  await db.schema.dropTable('bugs').execute();
  await db.schema.dropTable('test_steps').execute();
  await db.schema.dropTable('test_executions').execute();
  await db.schema.dropTable('test_nodes').execute();
  await db.schema.dropTable('e2e_tests').execute();
  await db.schema.dropTable('locators').execute();
  await db.schema.dropTable('component_types').execute();
  await db.schema.dropTable('dom_snapshots').execute();
  await db.schema.dropTable('web_pages').execute();
  await db.schema.dropTable('sessions').execute();
  await db.schema.dropTable('users').execute();
}
