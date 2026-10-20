import { Generated } from 'kysely';

// ============================================
// DATABASE ROOT INTERFACE
// ============================================
export interface Database {
  users: UsersTable;
  sessions: SessionsTable;
  web_pages: WebPagesTable;
  dom_snapshots: DomSnapshotsTable;
  component_types: ComponentTypesTable;
  locators: LocatorsTable;
  e2e_tests: E2eTestsTable;
  test_nodes: TestNodesTable;
  test_executions: TestExecutionsTable;
  test_steps: TestStepsTable;
  bugs: BugsTable;
  test_result_exports: TestResultExportsTable;
  test_comparisons: TestComparisonsTable;
}

// ============================================
// 1. USERS - Autenticación y perfil
// ============================================
export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  name: string;
  avatar_url: string | null;
  role: 'admin' | 'qa_engineer' | 'viewer';
  is_active: Generated<boolean>;
  last_login_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// ============================================
// 2. SESSIONS - Sesiones de usuario
// ============================================
export interface SessionsTable {
  id: Generated<string>;
  user_id: string;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: Date;
  created_at: Generated<Date>;
}

// ============================================
// 3. WEB PAGES - Páginas web registradas
// ============================================
export interface WebPagesTable {
  id: Generated<string>;
  user_id: string;
  url: string;
  name: string;
  description: string | null;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  last_processed_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// ============================================
// 4. DOM SNAPSHOTS - Resultados del procesamiento del DOM
// ============================================
export interface DomSnapshotsTable {
  id: Generated<string>;
  web_page_id: string;
  html_content: string;
  total_elements_found: Generated<number>;
  processing_duration_ms: number | null;
  status: 'success' | 'partial' | 'error';
  error_message: string | null;
  created_at: Generated<Date>;
}

// ============================================
// 5. COMPONENT TYPES - Clasificación de componentes HTML
// ============================================
export interface ComponentTypesTable {
  id: Generated<string>;
  name: string; // Ej: 'button', 'input', 'select', 'table', 'modal'
  html_tag: string; // Ej: 'button', 'input', 'select'
  category: 'interactive' | 'display' | 'container' | 'form' | 'navigation';
  icon_3d: string | null; // Referencia al modelo 3D para representar el componente
  description: string | null;
  created_at: Generated<Date>;
}

// ============================================
// 6. LOCATORS - Localizadores extraídos del DOM
// ============================================
export interface LocatorsTable {
  id: Generated<string>;
  dom_snapshot_id: string;
  component_type_id: string;
  locator_type: 'css' | 'xpath' | 'id' | 'data-testid' | 'aria-label' | 'text';
  locator_value: string;
  element_name: string; // Nombre o descripción del componente capturado
  element_text: string | null; // Texto visible del elemento
  stability_score: Generated<number>; // 0-100, el sistema elige el más estable
  is_default_stable: Generated<boolean>; // El localizador elegido por defecto
  position_x: number | null; // Posición en el DOM para representación visual
  position_y: number | null;
  screenshot_url: string | null; // Captura visual del componente
  created_at: Generated<Date>;
}

// ============================================
// 7. E2E TESTS - Definiciones de pruebas E2E (canvas 3D)
// ============================================
export interface E2eTestsTable {
  id: Generated<string>;
  user_id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  canvas_config_json: unknown; // Configuración del layout 3D (posiciones de nodos, cámara, etc.)
  version: Generated<number>; // Versionado de la prueba
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// ============================================
// 8. TEST NODES - Nodos de la fábrica de producción 3D
// ============================================
export interface TestNodesTable {
  id: Generated<string>;
  e2e_test_id: string;
  locator_id: string;
  name: string; // Nombre o descripción del nodo
  action_type: 'click' | 'type' | 'select' | 'file_select' | 'date_select' | 'hover' | 'scroll' | 'navigate' | 'assert';
  action_config_json: unknown; // { value: "text to type", file_path: "...", etc. }
  position_x: Generated<number>; // Posición en el canvas 3D
  position_y: Generated<number>;
  position_z: Generated<number>;
  order_index: number; // Orden de ejecución en la prueba
  parent_node_id: string | null; // Para nodos anidados o flujos condicionales
  timeout_ms: Generated<number>; // Timeout por defecto para esta acción
  created_at: Generated<Date>;
}

// ============================================
// 9. TEST EXECUTIONS - Ejecuciones de pruebas
// ============================================
export interface TestExecutionsTable {
  id: Generated<string>;
  e2e_test_id: string;
  user_id: string;
  status: 'queued' | 'running' | 'passed' | 'failed' | 'error' | 'cancelled';
  started_at: Date | null;
  completed_at: Date | null;
  duration_ms: number | null;
  total_steps: Generated<number>;
  passed_steps: Generated<number>;
  failed_steps: Generated<number>;
  error_summary: string | null;
  browser_info_json: unknown; // { browser: "chromium", version: "120", viewport: "1920x1080" }
  created_at: Generated<Date>;
}

// ============================================
// 10. TEST STEPS - Pasos individuales de cada ejecución
// ============================================
export interface TestStepsTable {
  id: Generated<string>;
  test_execution_id: string;
  test_node_id: string;
  step_index: number;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  action_performed: string; // Descripción legible de la acción realizada
  locator_used: string; // El localizador específico que se usó
  locator_type_used: string;
  screenshot_url: string | null;
  video_clip_url: string | null; // Fragmento de video de la animación 3D
  error_message: string | null;
  duration_ms: number | null;
  executed_at: Date | null;
}

// ============================================
// 11. BUGS - Hallazgos de bugs
// ============================================
export interface BugsTable {
  id: Generated<string>;
  test_execution_id: string;
  test_step_id: string | null;
  title: string;
  description: string | null;
  severity: 'critical' | 'major' | 'minor' | 'trivial';
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix' | 'duplicate';
  steps_to_reproduce_json: unknown; // Pasos JSON para reproducir
  expected_result: string | null;
  actual_result: string | null;
  screenshot_url: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// ============================================
// 12. TEST RESULT EXPORTS - Exportaciones de resultados
// ============================================
export interface TestResultExportsTable {
  id: Generated<string>;
  test_execution_id: string;
  export_format: 'json' | 'pdf' | 'html' | 'csv';
  export_data_json: unknown; // Datos completos exportados
  file_url: string | null; // URL del archivo generado
  exported_at: Generated<Date>;
}

// ============================================
// 13. TEST COMPARISONS - Comparativa histórica 3D
// ============================================
export interface TestComparisonsTable {
  id: Generated<string>;
  user_id: string;
  e2e_test_id: string;
  execution_ids_json: unknown; // Array de execution_ids comparados
  comparison_type: 'error_convergence' | 'performance' | 'full';
  comparison_result_json: unknown; // { total_errors_over_time: [], convergence_rate: 0.85 }
  space_3d_config_json: unknown; // Configuración del espacio 3D de comparación
  created_at: Generated<Date>;
}
