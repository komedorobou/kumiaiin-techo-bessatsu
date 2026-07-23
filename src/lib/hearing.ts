/**
 * hearing.ts — 導入時ヒアリングの検出ロジック（純関数）。
 *
 * facts.json に対して hearingMaster の各項目を detect し、
 *   { confirmed: 例規で確認済み, toAsk: 導入時に組合へ確認 }
 * に仕分ける。
 *
 * scope で検索範囲を切り替え、正職員向け項目（scope:'leave'）は facts.leave のみを見る。
 * これにより「会計年度にのみ夏季休暇がある」自治体で、正職員の夏季を誤検出しない
 * （夏季休暇が会計年度任用職員のみの自治体では正職員側は要ヒアリングに落ちる）。
 * 'all' は notFound / structureNote を除いた実収録データのみを検索対象にする
 * （notFound の理由文＝「〜が無い」という記述に detectWords が引っかかる誤検出を防ぐ）。
 *
 * このファイルは src/lib 配下＝check_hardcode の走査対象外。
 */
import factsData from '@/data/facts.json';
import { hearingMaster, type HearingItem, type HearingScope } from '@/data/hearingMaster';

const F = factsData as unknown as Record<string, any>;

/** ドット区切りパスで facts を辿る。存在しなければ undefined。 */
function resolvePath(obj: any, path: string): unknown {
  return path.split('.').reduce<any>((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

/** scope に応じた検索対象JSON文字列を返す。 */
function corpusFor(scope: HearingScope): string {
  if (scope === 'leave') return JSON.stringify(F.leave ?? {});
  if (scope === 'kaikei') return JSON.stringify(F.kaikei ?? {});
  // 'all': notFound（＝無い項目の説明）と structureNote（構造の注記）を除く実収録データのみ
  const { notFound: _n, structureNote: _s, ...recorded } = F;
  return JSON.stringify(recorded);
}

/** 1項目が例規で確認済みか。detectKeys（キー存在）→ detectWords（語の包含）の順に判定。 */
function isConfirmed(item: HearingItem): boolean {
  if (item.detectKeys?.some((k) => resolvePath(F, k) != null)) return true;
  if (item.detectWords && item.detectWords.length > 0) {
    const corpus = corpusFor(item.scope ?? 'all');
    if (item.detectWords.some((w) => corpus.includes(w))) return true;
  }
  return false;
}

export type HearingResult = { confirmed: HearingItem[]; toAsk: HearingItem[] };

/** hearingMaster を confirmed / toAsk に仕分ける純関数。 */
export function analyzeHearing(items: HearingItem[] = hearingMaster): HearingResult {
  const confirmed: HearingItem[] = [];
  const toAsk: HearingItem[] = [];
  for (const item of items) {
    (isConfirmed(item) ? confirmed : toAsk).push(item);
  }
  return { confirmed, toAsk };
}
