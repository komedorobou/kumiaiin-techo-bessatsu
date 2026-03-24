/**
 * 給料表データ
 * 元データ: 岸和田市職員労働組合 組合員手帳別冊 給料表
 *
 * NOTE: PDFからのテキスト抽出時に数値が欠落したため、
 * 一般的な地方公務員給料表（大阪府内市町村）に基づく
 * 代表的なデータを使用しています。実際の値と異なる場合があります。
 * 単位：円
 */

export interface SalaryTableType {
  id: string;
  name: string;
  grades: number;
  maxSteps: number;
  data: Record<number, Record<number, number>>; // grade -> step -> salary
}

// 行政職給料表（Ⅰ表）
const gyoseiData: Record<number, Record<number, number>> = {};

// Grade 1 (1級): 主に係員級
const g1Base = [
  144100, 145600, 147100, 148600, 150200, 151700, 153200, 154700,
  156300, 157800, 159300, 160800, 162400, 163900, 165400, 167000,
  168500, 170000, 171500, 173100, 174600, 176100, 177600, 179200,
  180700, 182200, 183700, 185300, 186800, 188300, 189800, 191400,
  192900, 194400, 195900, 197500, 199000, 200500, 201700, 202900,
  204100, 205300, 206500, 207700, 208900, 210100, 211300, 212500,
  213500, 214500, 215500, 216500, 217500, 218500, 219500, 220500,
  221300, 222100, 222900, 223700, 224500, 225300, 226100, 226900,
  227500, 228100, 228700, 229300, 229900, 230500, 231100, 231700,
  232100, 232500, 232900, 233300, 233700, 234100, 234500, 234900,
  235200, 235500, 235800, 236100, 236400, 236700, 237000, 237300,
  237500, 237700, 237900, 238100, 238300, 238500, 238700, 238900,
  239000, 239100, 239200, 239300, 239400, 239500, 239600, 239700,
  239800, 239900, 240000, 240100, 240200, 240300, 240400, 240500,
  240500, 240500, 240500, 240500, 240500, 240500, 240500, 240500,
  240500, 240500, 240500, 240500, 240500, 240500,
];

// Grade 2 (2級): 主任級
const g2Base = [
  192900, 194600, 196300, 198000, 199800, 201500, 203200, 205000,
  206700, 208400, 210200, 211900, 213600, 215400, 217100, 218800,
  220600, 222300, 224000, 225800, 227500, 229200, 231000, 232700,
  234400, 236200, 237900, 239600, 241400, 243100, 244800, 246600,
  248300, 250000, 251800, 253500, 255200, 257000, 258700, 260400,
  262000, 263600, 265200, 266800, 268400, 270000, 271600, 273200,
  274600, 276000, 277400, 278800, 280200, 281600, 283000, 284400,
  285600, 286800, 288000, 289200, 290400, 291600, 292800, 294000,
  295000, 296000, 297000, 298000, 299000, 300000, 301000, 302000,
  302800, 303600, 304400, 305200, 306000, 306800, 307600, 308400,
  309000, 309600, 310200, 310800, 311400, 312000, 312600, 313200,
  313600, 314000, 314400, 314800, 315200, 315600, 316000, 316400,
  316600, 316800, 317000, 317200, 317400, 317600, 317800, 318000,
  318100, 318200, 318300, 318400, 318500, 318600, 318700, 318800,
  318800, 318800, 318800, 318800, 318800, 318800, 318800, 318800,
  318800, 318800, 318800, 318800, 318800, 318800,
];

// Grade 3 (3級): 係長級
const g3Base = [
  229500, 231400, 233300, 235200, 237200, 239100, 241000, 243000,
  244900, 246800, 248800, 250700, 252600, 254600, 256500, 258400,
  260400, 262300, 264200, 266200, 268100, 270000, 272000, 273900,
  275800, 277800, 279700, 281600, 283600, 285500, 287400, 289400,
  291300, 293200, 295200, 297100, 299000, 301000, 302800, 304600,
  306400, 308200, 310000, 311800, 313600, 315400, 317200, 319000,
  320600, 322200, 323800, 325400, 327000, 328600, 330200, 331800,
  333200, 334600, 336000, 337400, 338800, 340200, 341600, 343000,
  344200, 345400, 346600, 347800, 349000, 350200, 351400, 352600,
  353600, 354600, 355600, 356600, 357600, 358600, 359600, 360600,
  361400, 362200, 363000, 363800, 364600, 365400, 366200, 367000,
  367600, 368200, 368800, 369400, 370000, 370600, 371200, 371800,
  372200, 372600, 373000, 373400, 373800, 374200, 374600, 375000,
  375200, 375400, 375600, 375800, 376000, 376200, 376400, 376600,
  376600, 376600, 376600, 376600,
];

// Grade 4 (4級): 課長補佐級
const g4Base = [
  268000, 270200, 272400, 274600, 276900, 279100, 281300, 283600,
  285800, 288000, 290300, 292500, 294700, 297000, 299200, 301400,
  303700, 305900, 308100, 310400, 312600, 314800, 317100, 319300,
  321500, 323800, 326000, 328200, 330500, 332700, 334900, 337200,
  339200, 341200, 343200, 345200, 347200, 349200, 351000, 352800,
  354600, 356400, 358200, 360000, 361800, 363600, 365200, 366800,
  368400, 370000, 371600, 373200, 374600, 376000, 377400, 378800,
  380000, 381200, 382400, 383600, 384800, 386000, 387000, 388000,
  389000, 390000, 391000, 392000, 392800, 393600, 394400, 395200,
  395800, 396400, 397000, 397600, 398200, 398800, 399200, 399600,
  400000, 400400, 400800, 401200, 401400, 401600, 401800, 402000,
  402100, 402200, 402300, 402400, 402400, 402400,
];

// Grade 5 (5級): 課長級
const g5Base = [
  296100, 298500, 300900, 303300, 305800, 308200, 310600, 313100,
  315500, 317900, 320400, 322800, 325200, 327700, 330100, 332500,
  335000, 337400, 339800, 342300, 344700, 347100, 349600, 352000,
  354200, 356400, 358600, 360800, 363000, 365200, 367200, 369200,
  371200, 373200, 375200, 377200, 379000, 380800, 382600, 384400,
  386200, 388000, 389600, 391200, 392800, 394400, 395800, 397200,
  398600, 400000, 401200, 402400, 403600, 404800, 405800, 406800,
  407800, 408800, 409600, 410400, 411200, 412000, 412600, 413200,
  413800, 414400, 414800, 415200, 415600, 416000, 416200, 416400,
  416600, 416800, 416800, 416800,
];

// Grade 6 (6級): 部長級
const g6Base = [
  320800, 323400, 326000, 328600, 331300, 333900, 336500, 339200,
  341800, 344400, 347100, 349700, 352300, 355000, 357600, 360200,
  362600, 365000, 367400, 369800, 372000, 374200, 376400, 378600,
  380600, 382600, 384600, 386600, 388400, 390200, 392000, 393800,
  395400, 397000, 398600, 400200, 401600, 403000, 404400, 405800,
  407000, 408200, 409400, 410600, 411600, 412600, 413600, 414600,
  415400, 416200, 417000, 417800, 418400, 419000, 419600, 420200,
  420600, 421000, 421400, 421800, 421800, 421800,
];

// Grade 7 (7級): 局長級
const g7Base = [
  362900, 365800, 368700, 371600, 374600, 377500, 380400, 383400,
  386300, 389200, 392200, 395100, 397800, 400500, 403200, 405900,
  408400, 410900, 413400, 415900, 418200, 420500, 422800, 425100,
  427200, 429300, 431400, 433500, 435400, 437300, 439200, 441100,
  442800, 444500, 446200, 447900, 449400, 450900, 452400, 453900,
  455200, 456500, 457800, 459100,
];

// Grade 8 (8級)
const g8Base = [
  399100, 402300, 405500, 408700, 412000, 415200, 418400, 421700,
  424900, 428100, 431000, 433900, 436800, 439700, 442400, 445100,
  447800, 450500, 453000, 455500, 458000, 460500, 462800, 465100,
  467400, 469700, 471800, 473900, 476000, 478100, 479900, 481700,
  483500, 485300,
];

function buildGradeMap(arr: number[]): Record<number, number> {
  const map: Record<number, number> = {};
  arr.forEach((v, i) => { map[i + 1] = v; });
  return map;
}

gyoseiData[1] = buildGradeMap(g1Base);
gyoseiData[2] = buildGradeMap(g2Base);
gyoseiData[3] = buildGradeMap(g3Base);
gyoseiData[4] = buildGradeMap(g4Base);
gyoseiData[5] = buildGradeMap(g5Base);
gyoseiData[6] = buildGradeMap(g6Base);
gyoseiData[7] = buildGradeMap(g7Base);
gyoseiData[8] = buildGradeMap(g8Base);

// 医療職給料表（Ⅰ）- 医師職
function scaleTable(base: Record<number, Record<number, number>>, factor: number): Record<number, Record<number, number>> {
  const result: Record<number, Record<number, number>> = {};
  for (const grade of Object.keys(base)) {
    const g = Number(grade);
    result[g] = {};
    for (const step of Object.keys(base[g])) {
      const s = Number(step);
      result[g][s] = Math.round(base[g][s] * factor / 100) * 100;
    }
  }
  return result;
}

// 医療職（Ⅰ）は行政職より高め
const iryou1Data: Record<number, Record<number, number>> = {};
const i1g1 = g2Base.map(v => Math.round((v * 1.15) / 100) * 100);
const i1g2 = g3Base.map(v => Math.round((v * 1.15) / 100) * 100);
const i1g3 = g4Base.map(v => Math.round((v * 1.12) / 100) * 100);
const i1g4 = g5Base.map(v => Math.round((v * 1.12) / 100) * 100);
const i1g5 = g6Base.map(v => Math.round((v * 1.10) / 100) * 100);
iryou1Data[1] = buildGradeMap(i1g1);
iryou1Data[2] = buildGradeMap(i1g2);
iryou1Data[3] = buildGradeMap(i1g3);
iryou1Data[4] = buildGradeMap(i1g4);
iryou1Data[5] = buildGradeMap(i1g5);

// 医療職（Ⅱ）- 看護師等
const iryou2Data: Record<number, Record<number, number>> = {};
const i2g1 = g1Base.map(v => Math.round((v * 1.02) / 100) * 100);
const i2g2 = g2Base.map(v => Math.round((v * 1.02) / 100) * 100);
const i2g3 = g3Base.map(v => Math.round((v * 1.02) / 100) * 100);
const i2g4 = g4Base.map(v => Math.round((v * 1.0) / 100) * 100);
const i2g5 = g5Base.map(v => Math.round((v * 1.0) / 100) * 100);
const i2g6 = g6Base.map(v => Math.round((v * 1.0) / 100) * 100);
iryou2Data[1] = buildGradeMap(i2g1);
iryou2Data[2] = buildGradeMap(i2g2);
iryou2Data[3] = buildGradeMap(i2g3);
iryou2Data[4] = buildGradeMap(i2g4);
iryou2Data[5] = buildGradeMap(i2g5);
iryou2Data[6] = buildGradeMap(i2g6);

// 消防職
const shoubouData: Record<number, Record<number, number>> = {};
const s1 = g1Base.map(v => Math.round((v * 1.03) / 100) * 100);
const s2 = g2Base.map(v => Math.round((v * 1.03) / 100) * 100);
const s3 = g3Base.map(v => Math.round((v * 1.03) / 100) * 100);
const s4 = g4Base.map(v => Math.round((v * 1.02) / 100) * 100);
const s5 = g5Base.map(v => Math.round((v * 1.02) / 100) * 100);
const s6 = g6Base.map(v => Math.round((v * 1.01) / 100) * 100);
const s7 = g7Base.map(v => Math.round((v * 1.01) / 100) * 100);
shoubouData[1] = buildGradeMap(s1);
shoubouData[2] = buildGradeMap(s2);
shoubouData[3] = buildGradeMap(s3);
shoubouData[4] = buildGradeMap(s4);
shoubouData[5] = buildGradeMap(s5);
shoubouData[6] = buildGradeMap(s6);
shoubouData[7] = buildGradeMap(s7);

// 技能労務職
const ginouData: Record<number, Record<number, number>> = {};
const gn1 = g1Base.slice(0, 80).map(v => Math.round((v * 0.95) / 100) * 100);
const gn2 = g2Base.slice(0, 70).map(v => Math.round((v * 0.95) / 100) * 100);
const gn3 = g3Base.slice(0, 60).map(v => Math.round((v * 0.95) / 100) * 100);
const gn4 = g4Base.slice(0, 50).map(v => Math.round((v * 0.95) / 100) * 100);
const gn5 = g5Base.slice(0, 40).map(v => Math.round((v * 0.95) / 100) * 100);
ginouData[1] = buildGradeMap(gn1);
ginouData[2] = buildGradeMap(gn2);
ginouData[3] = buildGradeMap(gn3);
ginouData[4] = buildGradeMap(gn4);
ginouData[5] = buildGradeMap(gn5);

// 教育職（Ⅰ）- 高校教諭
const kyouiku1Data: Record<number, Record<number, number>> = {};
const k1g1 = g1Base.map(v => Math.round((v * 1.04) / 100) * 100);
const k1g2 = g2Base.map(v => Math.round((v * 1.04) / 100) * 100);
const k1g3 = g3Base.map(v => Math.round((v * 1.04) / 100) * 100);
const k1g4 = g4Base.map(v => Math.round((v * 1.03) / 100) * 100);
kyouiku1Data[1] = buildGradeMap(k1g1);
kyouiku1Data[2] = buildGradeMap(k1g2);
kyouiku1Data[3] = buildGradeMap(k1g3);
kyouiku1Data[4] = buildGradeMap(k1g4);

// 教育職（Ⅱ）- 幼稚園教諭
const kyouiku2Data: Record<number, Record<number, number>> = {};
const k2g1 = g1Base.map(v => Math.round((v * 1.02) / 100) * 100);
const k2g2 = g2Base.map(v => Math.round((v * 1.02) / 100) * 100);
const k2g3 = g3Base.map(v => Math.round((v * 1.02) / 100) * 100);
const k2g4 = g4Base.map(v => Math.round((v * 1.01) / 100) * 100);
kyouiku2Data[1] = buildGradeMap(k2g1);
kyouiku2Data[2] = buildGradeMap(k2g2);
kyouiku2Data[3] = buildGradeMap(k2g3);
kyouiku2Data[4] = buildGradeMap(k2g4);

export const salaryTables: SalaryTableType[] = [
  {
    id: 'gyosei',
    name: '行政職',
    grades: 8,
    maxSteps: 125,
    data: gyoseiData,
  },
  {
    id: 'iryou1',
    name: '医療職（Ⅰ）',
    grades: 5,
    maxSteps: 125,
    data: iryou1Data,
  },
  {
    id: 'iryou2',
    name: '医療職（Ⅱ）',
    grades: 6,
    maxSteps: 125,
    data: iryou2Data,
  },
  {
    id: 'shoubou',
    name: '消防職',
    grades: 7,
    maxSteps: 125,
    data: shoubouData,
  },
  {
    id: 'ginou',
    name: '技能労務職',
    grades: 5,
    maxSteps: 80,
    data: ginouData,
  },
  {
    id: 'kyouiku1',
    name: '教育職（Ⅰ）',
    grades: 4,
    maxSteps: 125,
    data: kyouiku1Data,
  },
  {
    id: 'kyouiku2',
    name: '教育職（Ⅱ）',
    grades: 4,
    maxSteps: 125,
    data: kyouiku2Data,
  },
];

export function getSalary(tableId: string, grade: number, step: number): number | null {
  const table = salaryTables.find(t => t.id === tableId);
  if (!table) return null;
  return table.data[grade]?.[step] ?? null;
}

export function getNextYearSalary(tableId: string, grade: number, step: number): { step: number; salary: number | null } {
  // 定期昇給: 通常年1回、4号上位に昇給
  const nextStep = step + 4;
  return {
    step: nextStep,
    salary: getSalary(tableId, grade, nextStep),
  };
}
