/**
 * kigyodan/facts.ts — 大阪広域水道企業団モードのデータアクセス層。
 * 岸和田市（src/lib/facts.ts＋src/data/facts.json）とは完全分離した別名前空間。
 * 企業団で表示するすべての金額・率・日数・年齢・号給は必ずこの層を経由して
 * kigyodan_facts.json から取り出す（コンポーネントに数値をベタ書きしない）。
 *
 * データ源: src/data/kigyodan_facts.json（公開例規集から抽出・出典つき・全assert PASS）
 */
import factsData from '@/data/kigyodan_facts.json';

/* ===================== 型 ===================== */
export interface Provenance {
  ordinance: string;
  article: string;
  quote: string;
}
export interface Fact<T = unknown> {
  value: T;
  provenance?: Provenance;
  note?: string;
}
export interface KigyodanSalaryTable {
  id: string;
  name: string;
  grades: number;
  cells: Record<string, number[]>;
  saiteiSaininyo?: { note: string; values: number[] };
  provenance: { ordinance: string; article: string; quote: string };
  checks: {
    monotonicPerGrade: boolean;
    crossGradeAscending?: boolean;
    totalCells: number;
    stepCounts: number[];
    endpoints?: Record<string, number>;
  };
}
export interface OrdinanceRef {
  name: string;
  code: string;
  url: string;
}

type FactsRoot = {
  municipality: string;
  entityType?: string;
  unionNameCandidate?: string;
  source: { vendor: string; base: string; fetchedAt: string; structureNote?: string };
  ordinances: Record<string, OrdinanceRef>;
  salaryTables: KigyodanSalaryTable[];
  facts: Record<string, Fact>;
  leave: Record<string, unknown>;
  kaikei: Record<string, unknown>;
  notFound: { key: string; reason: string }[];
};

const F = factsData as unknown as FactsRoot;

export const municipality = F.municipality;
export const entityType = F.entityType;
export const source = F.source;
export const ordinances = F.ordinances;
export const salaryTables = F.salaryTables;
export const leave = F.leave as Record<string, any>;
export const kaikei = F.kaikei as Record<string, any>;
export const notFound = F.notFound;

/** シミュレーター・ビューアで使う給料表（企業職給料表 単一）。 */
export const kigyoTable = F.salaryTables[0];

/** 級番号（1始まり）→ 表示ラベル。企業団は「N級」表記（特級なし）。 */
export function gradeLabel(grade: number): string {
  return `${grade}級`;
}

export function getFact<T = unknown>(key: string): Fact<T> | null {
  const f = F.facts[key];
  return (f as Fact<T>) ?? null;
}

export function factValue<T = unknown>(key: string, fallback: T | null = null): T | null {
  const f = F.facts[key];
  return f ? (f.value as T) : fallback;
}

export function getLeave<T = any>(key: string): T | null {
  return (leave[key] as T) ?? null;
}

export function getTable(id: string): KigyodanSalaryTable | null {
  return salaryTables.find((t) => t.id === id) ?? null;
}

/** 給料月額（1級1号=grade "1", step 1 → cells["1"][0]）。企業団は1級=最下位・級が上がるほど上位。 */
export function getSalary(tableId: string, grade: number, step: number): number | null {
  const t = getTable(tableId);
  if (!t) return null;
  const col = t.cells[String(grade)];
  if (!col) return null;
  return col[step - 1] ?? null;
}

/** ある級の号給数（=その列の要素数）。 */
export function stepCount(tableId: string, grade: number): number {
  const t = getTable(tableId);
  if (!t) return 0;
  return t.cells[String(grade)]?.length ?? 0;
}

/** 条例キー → 正式名称（出典表示用）。 */
export function ordinanceName(key: string): string {
  return ordinances[key]?.name ?? key;
}

/** 条例キー → 規程番号（管理規程第N号等の code）。 */
export function ordinanceCode(key: string): string {
  return ordinances[key]?.code ?? '';
}

export function yen(n: number): string {
  return `${n.toLocaleString('ja-JP')}円`;
}

/** "38:45" 等の h:mm 表記を「38時間45分」へ整形。h:mm でなければそのまま返す。 */
export function formatHm(hm: unknown): string {
  if (typeof hm !== 'string') return String(hm ?? '');
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  if (!m) return hm;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return min === 0 ? `${h}時間` : `${h}時間${min}分`;
}
