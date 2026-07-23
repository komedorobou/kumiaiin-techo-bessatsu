/**
 * facts.ts — このテンプレの心臓部。
 * 表示するすべての金額・率・日数・年齢・号給は必ずこの層を経由して facts.json から取り出す。
 * コンポーネントに数値をベタ書きしない（唯一の例外は src/lib/slots/ の市専用スロット）。
 *
 * データ源: src/data/facts.json（岸和田市例規集＋組合員手帳別冊から抽出・出典つき）
 */
import factsData from '@/data/facts.json';

/* ===================== 型 ===================== */
export interface Provenance {
  ordinance: string;
  article: string;
  quote: string;
  tableLabel?: string;
}
export interface Fact<T = unknown> {
  value: T;
  provenance: Provenance;
  note?: string;
  basis?: string;
}
export interface SalaryTable {
  id: string;
  name: string;
  grades: number;
  gradeDirection?: string;
  /** 級番号（1..grades）に対応する表示ラベル（例: "特1級","1級"）。給料表により「特」級を含むため保持。 */
  gradeLabels?: string[];
  /** 給料シミュレーターの職種セレクトに載せる表か（教育職・会計年度は false）。 */
  sim?: boolean;
  cells: Record<string, number[]>;
  provenance: { ordinance: string; tableLabel: string };
  checks: {
    monotonicPerGrade: boolean;
    stepCounts: number[];
    gradeCrossConsistent?: boolean;
    contiguousGokyu?: boolean;
    monotonicDetail?: Record<string, boolean>;
  };
}
export interface OrdinanceRef {
  name: string;
  code: string;
  url: string;
}

/* ===================== 素データ ===================== */
type FactsRoot = {
  municipality: string;
  unionNameCandidate?: string;
  source: { vendor: string; base: string; fetchedAt: string };
  structureNote?: string;
  ordinances: Record<string, OrdinanceRef>;
  facts: Record<string, Fact>;
  leave: Record<string, unknown>;
  kaikei: Record<string, unknown>;
  notFound: { key: string; reason: string }[];
  salaryTables: SalaryTable[];
};

const F = factsData as unknown as FactsRoot;

export const municipality = F.municipality;
export const unionName = F.unionNameCandidate ?? `${F.municipality}職員労働組合`;
export const source = F.source;
export const ordinances = F.ordinances;
export const salaryTables = F.salaryTables;
/** 正職員向けの給料表（会計年度=id:'kaikei' を除く。給料表ビューアはこの全表を対象）。 */
export const seishokuTables = F.salaryTables.filter((t) => t.id !== 'kaikei');
/** 給料シミュレーターの職種セレクト対象（sim:true の表＝行政職・医療職(一)(二)・消防職）。 */
export const simTables = seishokuTables.filter((t) => t.sim !== false && (t as SalaryTable).sim);
/** 級番号（1始まり）→ 表示ラベル。gradeLabels があればそれ、無ければ "N級"。 */
export function gradeLabel(t: SalaryTable, grade: number): string {
  return t.gradeLabels?.[grade - 1] ?? `${grade}級`;
}
export const leave = F.leave as Record<string, any>;
export const kaikei = F.kaikei as Record<string, any>;
export const notFound = F.notFound;
export const structureNote = F.structureNote;

/** facts.facts[key] を取り出す。無ければ null（テンプレ側で「導入時に反映」に落とす）。 */
export function getFact<T = unknown>(key: string): Fact<T> | null {
  const f = F.facts[key];
  return (f as Fact<T>) ?? null;
}

/** facts.facts[key].value のみ。無ければ fallback（既定 null）。 */
export function factValue<T = unknown>(key: string, fallback: T | null = null): T | null {
  const f = F.facts[key];
  return f ? (f.value as T) : fallback;
}

export function getLeave<T = any>(key: string): T | null {
  return (leave[key] as T) ?? null;
}
export function getKaikei<T = any>(key: string): T | null {
  return (kaikei[key] as T) ?? null;
}

export function getTable(id: string): SalaryTable | null {
  return salaryTables.find((t) => t.id === id) ?? null;
}

/** 給料月額（1級1号=grade "1", step 1 → cells["1"][0]）。無ければ null。 */
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

/** 数値を「円」付き文字列に（tsxに金額リテラルを置かないための整形関数）。 */
export function yen(n: number): string {
  return `${n.toLocaleString('ja-JP')}円`;
}

/** "38:45" 等の h:mm 表記を「38時間45分」へ整形（本編・/sources 共通の唯一の変換点）。
 *  h:mm でない文字列はそのまま返す。 */
export function formatHm(hm: unknown): string {
  if (typeof hm !== 'string') return String(hm ?? '');
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  if (!m) return hm;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return min === 0 ? `${h}時間` : `${h}時間${min}分`;
}
