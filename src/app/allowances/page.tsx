'use client';

import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';

type TabId = 'fuyo' | 'jukyo' | 'tsukin' | 'bonus' | 'overtime' | 'tokushu' | 'shokyu' | 'over61' | 'payment';

interface TabItem {
  id: TabId;
  label: string;
  shortLabel: string;
}

const tabs: TabItem[] = [
  { id: 'fuyo', label: '扶養手当', shortLabel: '扶養' },
  { id: 'jukyo', label: '住居手当', shortLabel: '住居' },
  { id: 'tsukin', label: '通勤手当', shortLabel: '通勤' },
  { id: 'bonus', label: '期末・勤勉手当', shortLabel: '賞与' },
  { id: 'overtime', label: '超過勤務手当', shortLabel: '超勤' },
  { id: 'tokushu', label: '特殊勤務手当', shortLabel: '特殊' },
  { id: 'shokyu', label: '昇給について', shortLabel: '昇給' },
  { id: 'over61', label: '61歳以後の給与', shortLabel: '61歳~' },
  { id: 'payment', label: '給与の支払い', shortLabel: '支払' },
];

export default function AllowancesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('fuyo');

  return (
    <PageLayout
      title="手当ガイド"
      subtitle="給与に関する各種手当・制度を確認できます"
    >
      {/* Tab Navigation */}
      <div className="mb-8 -mx-4 px-4 overflow-x-auto animate-fade-in">
        <div className="flex gap-1 min-w-max pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-accent text-white shadow-md'
                  : 'text-charcoal/50 hover:text-accent hover:bg-accent/5'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'fuyo' && <FuyoTeate />}
        {activeTab === 'jukyo' && <JukyoTeate />}
        {activeTab === 'tsukin' && <TsukinTeate />}
        {activeTab === 'bonus' && <BonusSection />}
        {activeTab === 'overtime' && <OvertimeSection />}
        {activeTab === 'tokushu' && <TokushuSection />}
        {activeTab === 'shokyu' && <ShokyuSection />}
        {activeTab === 'over61' && <Over61Section />}
        {activeTab === 'payment' && <PaymentSection />}
      </div>
    </PageLayout>
  );
}

/* ===================== Section Components ===================== */

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="glass-card-strong rounded-2xl p-5 sm:p-7 mb-4">
      {title && <h3 className="text-base font-semibold text-charcoal mb-4">{title}</h3>}
      {children}
    </div>
  );
}

function InfoBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
      {children}
    </span>
  );
}

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-2">
      <div className="min-w-full inline-block align-middle px-2">
        {children}
      </div>
    </div>
  );
}

/* ==================== 扶養手当 ==================== */

function FuyoTeate() {
  return (
    <div className="space-y-4">
      <SectionCard title="扶養手当の額">
        <InfoBadge>正規職員のみ</InfoBadge>
        <TableWrapper>
          <table className="w-full mt-4 text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-charcoal/40 font-medium text-xs">扶養親族</th>
                <th className="text-right py-2 px-4 text-charcoal/40 font-medium text-xs">令和7年度</th>
                <th className="text-right py-2 pl-4 text-charcoal/40 font-medium text-xs">令和8年度以降</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-charcoal/70">配偶者</td>
                <td className="py-3 px-4 text-right font-semibold text-accent">3,000円</td>
                <td className="py-3 pl-4 text-right text-charcoal/40">支給なし</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-charcoal/70">子</td>
                <td className="py-3 px-4 text-right font-semibold text-accent">11,500円</td>
                <td className="py-3 pl-4 text-right font-semibold text-accent">13,000円</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-charcoal/70">父母等（課長級以下）</td>
                <td className="py-3 px-4 text-right font-semibold text-accent">6,500円</td>
                <td className="py-3 pl-4 text-right text-charcoal/40">支給なし</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-charcoal/70">父母等（部長級）</td>
                <td className="py-3 px-4 text-right font-semibold text-accent">3,500円</td>
                <td className="py-3 pl-4 text-right text-charcoal/40">支給なし</td>
              </tr>
            </tbody>
          </table>
        </TableWrapper>
        <p className="mt-4 text-xs text-charcoal/40 leading-relaxed">
          16歳から22歳の子については、上記の額に5,000円を加算します。
        </p>
      </SectionCard>

      <SectionCard title="扶養親族の範囲">
        <ul className="space-y-2 text-sm text-charcoal/70">
          <li className="flex gap-2"><span className="text-accent shrink-0">1.</span>配偶者（事実上の婚姻関係も含む）</li>
          <li className="flex gap-2"><span className="text-accent shrink-0">2.</span>満22歳に達する日以後最初の3月31日までの子・孫・弟妹</li>
          <li className="flex gap-2"><span className="text-accent shrink-0">3.</span>満60歳以上の父母・祖父母</li>
          <li className="flex gap-2"><span className="text-accent shrink-0">4.</span>重度心身障害者</li>
        </ul>
      </SectionCard>

      <SectionCard title="認定条件">
        <ul className="space-y-2 text-sm text-charcoal/70">
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>他に生計の道がないこと</li>
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>全ての収入の合計額が向こう1年間130万円未満であること（月額108,333円未満）</li>
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>主として職員の扶養を受けていること（同居、生計維持）</li>
        </ul>
      </SectionCard>

      <SectionCard title="基礎となる手当">
        <p className="text-sm text-charcoal/70 leading-relaxed">
          扶養手当の額は以下の計算にも影響します。
        </p>
        <ul className="mt-3 space-y-1 text-sm text-charcoal/60">
          <li>&bull; 地域手当 = （給料 + 扶養手当 + 管理職手当）&times; 10%</li>
          <li>&bull; 期末勤勉手当 = （給料 + 役職加算額 + 扶養手当 + 地域手当）&times; 支給率</li>
        </ul>
      </SectionCard>
    </div>
  );
}

/* ==================== 住居手当 ==================== */

function JukyoTeate() {
  const [rent, setRent] = useState('');

  const allowance = useMemo(() => {
    const r = parseInt(rent, 10);
    if (isNaN(r) || r <= 0) return null;
    if (r <= 16000) return 0;
    if (r <= 27000) return r - 16000;
    if (r < 61000) return Math.floor((r - 27000) / 2) + 11000;
    return 28000;
  }, [rent]);

  return (
    <div className="space-y-4">
      <SectionCard title="住居手当シミュレーター">
        <InfoBadge>正規職員・再任用職員（短時間含む）のみ</InfoBadge>
        <div className="mt-4">
          <label className="block text-xs text-charcoal/40 mb-2">月額家賃（円）</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="例: 55000"
              className="w-48 px-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
            />
            <span className="text-sm text-charcoal/40">円</span>
          </div>
          {allowance !== null && (
            <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/10">
              <p className="text-xs text-charcoal/40">住居手当月額</p>
              <p className="text-2xl font-bold text-accent mt-1">
                {allowance.toLocaleString()}円
              </p>
              {allowance === 0 && (
                <p className="text-xs text-charcoal/40 mt-1">家賃16,000円以下のため支給対象外です</p>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="手当額の計算方法">
        <TableWrapper>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-charcoal/40 font-medium text-xs">家賃額</th>
                <th className="text-left py-2 pl-4 text-charcoal/40 font-medium text-xs">手当額</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-charcoal/70">16,000円以下</td>
                <td className="py-3 pl-4 text-charcoal/40">支給なし</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-charcoal/70">16,000円超 ~ 27,000円以下</td>
                <td className="py-3 pl-4 text-charcoal/70">家賃額 - 16,000円</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-charcoal/70">27,000円超 ~ 61,000円未満</td>
                <td className="py-3 pl-4 text-charcoal/70">（家賃額 - 27,000）&times; 1/2 + 11,000円</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-charcoal/70">61,000円超</td>
                <td className="py-3 pl-4 font-semibold text-accent">28,000円（上限）</td>
              </tr>
            </tbody>
          </table>
        </TableWrapper>
      </SectionCard>

      <SectionCard title="対象条件">
        <ul className="space-y-2 text-sm text-charcoal/70">
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>自ら居住するための住宅を借り受け、家賃を支払っている職員</li>
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>生活の本拠となっている住宅を借り受けていること</li>
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>住宅の借主であること（配偶者・1親等の親族との共同名義を含む）</li>
        </ul>
        <p className="mt-3 text-xs text-charcoal/40 leading-relaxed">
          家賃に含まれないもの: 権利金、敷金、礼金、保証金、共益費、電気・水道・ガス等の料金
        </p>
      </SectionCard>
    </div>
  );
}

/* ==================== 通勤手当 ==================== */

const commuteCarData = [
  { distance: '4km未満', car: 6200, bike: 3600, bicycle: 3000 },
  { distance: '4km ~ 6km未満', car: 7800, bike: 4400, bicycle: 3500 },
  { distance: '6km ~ 8km未満', car: 9400, bike: 5200, bicycle: 4000 },
  { distance: '8km ~ 10km未満', car: 11000, bike: 6000, bicycle: 4500 },
  { distance: '10km ~ 12km未満', car: 12600, bike: 6800, bicycle: 5000 },
  { distance: '12km ~ 14km未満', car: 14200, bike: 7600, bicycle: 0 },
  { distance: '14km ~ 16km未満', car: 15800, bike: 8400, bicycle: 0 },
  { distance: '16km ~ 18km未満', car: 17400, bike: 9200, bicycle: 0 },
  { distance: '18km ~ 20km未満', car: 19000, bike: 10000, bicycle: 0 },
  { distance: '20km ~ 25km未満', car: 22900, bike: 12000, bicycle: 0 },
];

type VehicleType = 'car' | 'bike' | 'bicycle';

function TsukinTeate() {
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [distanceIndex, setDistanceIndex] = useState(0);

  const result = useMemo(() => {
    const row = commuteCarData[distanceIndex];
    if (!row) return 0;
    return row[vehicleType];
  }, [vehicleType, distanceIndex]);

  return (
    <div className="space-y-4">
      <SectionCard title="通勤手当シミュレーター（交通用具）">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs text-charcoal/40 mb-2">交通用具の種類</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as VehicleType)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
            >
              <option value="car">自動車</option>
              <option value="bike">二輪車・原付</option>
              <option value="bicycle">自転車</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-charcoal/40 mb-2">片道直線距離</label>
            <select
              value={distanceIndex}
              onChange={(e) => setDistanceIndex(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
            >
              {commuteCarData.map((row, i) => (
                <option key={i} value={i}>{row.distance}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/10">
          <p className="text-xs text-charcoal/40">通勤手当月額</p>
          <p className="text-2xl font-bold text-accent mt-1">
            {result > 0 ? `${result.toLocaleString()}円` : '対象外'}
          </p>
          {vehicleType === 'bicycle' && distanceIndex >= 5 && (
            <p className="text-xs text-charcoal/40 mt-1">自転車は片道12km未満までが支給対象です（正規職員）</p>
          )}
        </div>
        <p className="mt-3 text-xs text-charcoal/40">
          25km以上は5km増すごとに3,900円加算（限度額46,300円）。片道2km未満は原則支給なし。
        </p>
      </SectionCard>

      <SectionCard title="交通用具 手当額一覧（正規職員）">
        <TableWrapper>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-charcoal/40 font-medium text-xs">距離区分</th>
                <th className="text-right py-2 text-charcoal/40 font-medium text-xs">自動車</th>
                <th className="text-right py-2 text-charcoal/40 font-medium text-xs">二輪・原付</th>
                <th className="text-right py-2 text-charcoal/40 font-medium text-xs">自転車</th>
              </tr>
            </thead>
            <tbody>
              {commuteCarData.map((row, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 text-charcoal/70 text-xs">{row.distance}</td>
                  <td className="py-2 text-right text-charcoal/70">{row.car.toLocaleString()}</td>
                  <td className="py-2 text-right text-charcoal/70">{row.bike.toLocaleString()}</td>
                  <td className="py-2 text-right text-charcoal/70">{row.bicycle > 0 ? row.bicycle.toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      </SectionCard>

      <SectionCard title="交通機関利用者">
        <ul className="space-y-2 text-sm text-charcoal/70">
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>6ヶ月定期代を毎年5月及び11月に支給</li>
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>最も経済的かつ合理的な通常の経路及び方法によるもの</li>
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>片道2km以内は特段の事情がない限り支給なし</li>
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>会計年度任用職員は月18,000円を限度</li>
        </ul>
      </SectionCard>
    </div>
  );
}

/* ==================== 期末・勤勉手当 ==================== */

function BonusSection() {
  return (
    <div className="space-y-4">
      <SectionCard title="支給率一覧（正規・任期付・会計年度任用職員）">
        <TableWrapper>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-charcoal/40 font-medium text-xs"></th>
                <th className="text-right py-2 text-charcoal/40 font-medium text-xs">6月30日</th>
                <th className="text-right py-2 text-charcoal/40 font-medium text-xs">12月10日</th>
                <th className="text-right py-2 text-charcoal/40 font-medium text-xs">合計</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-charcoal/70">期末手当</td>
                <td className="py-3 text-right font-semibold text-accent">1.25ヶ月</td>
                <td className="py-3 text-right font-semibold text-accent">1.25ヶ月</td>
                <td className="py-3 text-right font-bold text-accent">2.5ヶ月</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-charcoal/70">勤勉手当</td>
                <td className="py-3 text-right font-semibold text-accent">1.05ヶ月</td>
                <td className="py-3 text-right font-semibold text-accent">1.05ヶ月</td>
                <td className="py-3 text-right font-bold text-accent">2.1ヶ月</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-charcoal">合計</td>
                <td className="py-3 text-right font-bold text-accent">2.3ヶ月</td>
                <td className="py-3 text-right font-bold text-accent">2.3ヶ月</td>
                <td className="py-3 text-right font-bold text-accent text-lg">4.6ヶ月</td>
              </tr>
            </tbody>
          </table>
        </TableWrapper>
      </SectionCard>

      <SectionCard title="再任用職員">
        <TableWrapper>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-charcoal/40 font-medium text-xs"></th>
                <th className="text-right py-2 text-charcoal/40 font-medium text-xs">6月30日</th>
                <th className="text-right py-2 text-charcoal/40 font-medium text-xs">12月10日</th>
                <th className="text-right py-2 text-charcoal/40 font-medium text-xs">合計</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-charcoal/70">期末手当</td>
                <td className="py-3 text-right text-accent">0.7ヶ月</td>
                <td className="py-3 text-right text-accent">0.7ヶ月</td>
                <td className="py-3 text-right font-semibold text-accent">1.4ヶ月</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-charcoal/70">勤勉手当</td>
                <td className="py-3 text-right text-accent">0.5ヶ月</td>
                <td className="py-3 text-right text-accent">0.5ヶ月</td>
                <td className="py-3 text-right font-semibold text-accent">1.0ヶ月</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-charcoal">合計</td>
                <td className="py-3 text-right font-bold text-accent">1.2ヶ月</td>
                <td className="py-3 text-right font-bold text-accent">1.2ヶ月</td>
                <td className="py-3 text-right font-bold text-accent">2.4ヶ月</td>
              </tr>
            </tbody>
          </table>
        </TableWrapper>
      </SectionCard>

      <SectionCard title="役職加算率">
        <p className="text-sm text-charcoal/60 mb-3">
          加算額 = （給料 + 給料 &times; 10%地域手当率）&times; 加算率
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { role: '部長級', rate: '20%' },
            { role: '課長級', rate: '15%' },
            { role: '主幹級', rate: '10%' },
            { role: '担当長・主査・主任級', rate: '5%' },
          ].map((item) => (
            <div key={item.role} className="p-3 rounded-xl bg-accent/5 text-center">
              <p className="text-xs text-charcoal/40">{item.role}</p>
              <p className="text-lg font-bold text-accent mt-1">{item.rate}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-charcoal/40">当該年度中に満44歳に達する者は10%加算</p>
      </SectionCard>

      <SectionCard title="支給条件">
        <div className="space-y-3 text-sm text-charcoal/70">
          <div>
            <p className="font-medium text-charcoal mb-1">支給される者</p>
            <ul className="space-y-1 text-charcoal/60">
              <li>&bull; 基準日（6月1日・12月1日）に在職している者</li>
              <li>&bull; 基準日前1ヶ月以内の退職者</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-charcoal mb-1">支給されない者</p>
            <ul className="space-y-1 text-charcoal/60">
              <li>&bull; 無給休職中・刑事休職中・停職中・専従休職中の者</li>
              <li>&bull; 育児休業中で勤務期間がない者</li>
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ==================== 超過勤務手当 ==================== */

function OvertimeSection() {
  return (
    <div className="space-y-4">
      <SectionCard title="超過勤務手当の支給率">
        <TableWrapper>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-charcoal/40 font-medium text-xs">勤務区分</th>
                <th className="text-left py-2 text-charcoal/40 font-medium text-xs">時間帯</th>
                <th className="text-right py-2 text-charcoal/40 font-medium text-xs">支給率</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-charcoal/70" rowSpan={2}>平日</td>
                <td className="py-3 text-charcoal/60 text-xs">5:00 ~ 22:00</td>
                <td className="py-3 text-right font-semibold text-accent">125/100</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-charcoal/60 text-xs">22:00 ~ 翌5:00（深夜）</td>
                <td className="py-3 text-right font-semibold text-accent">150/100</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-charcoal/70" rowSpan={2}>週休日（土日）</td>
                <td className="py-3 text-charcoal/60 text-xs">5:00 ~ 22:00</td>
                <td className="py-3 text-right font-semibold text-accent">135/100</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-charcoal/60 text-xs">22:00 ~ 翌5:00（深夜）</td>
                <td className="py-3 text-right font-semibold text-accent">160/100</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-charcoal/70" rowSpan={2}>休日（祝日等）</td>
                <td className="py-3 text-charcoal/60 text-xs">正規の勤務時間</td>
                <td className="py-3 text-right font-semibold text-accent">135/100</td>
              </tr>
              <tr>
                <td className="py-3 text-charcoal/60 text-xs">超過勤務部分</td>
                <td className="py-3 text-right font-semibold text-accent">135/100</td>
              </tr>
            </tbody>
          </table>
        </TableWrapper>
      </SectionCard>

      <SectionCard title="勤務1時間あたりの給与額">
        <div className="p-4 rounded-xl bg-accent/5 text-sm text-charcoal/70">
          <p className="font-mono text-center">
            （給料 + 給料 &times; 0.1）&times; 12 &divide; 1,860時間
          </p>
          <p className="text-xs text-charcoal/40 text-center mt-2">
            1,860時間 = 52週 &times; 38.75時間 - 20日 &times; 7.75時間
          </p>
        </div>
      </SectionCard>

      <SectionCard title="夜間勤務手当">
        <p className="text-sm text-charcoal/70">
          正規の勤務時間が深夜（22時 ~ 翌日5時）にわたる場合、勤務1時間につき給与額の
          <span className="font-semibold text-accent"> 25/100 </span>を支給。
        </p>
      </SectionCard>

      <SectionCard title="管理職員特別勤務手当">
        <p className="text-sm text-charcoal/70 mb-2">
          管理職手当を支給されている職員には超過勤務手当・休日給は支給されません。ただし、以下の業務については管理職員特別勤務手当（定額）を支給します。
        </p>
        <ul className="space-y-1 text-sm text-charcoal/60">
          <li>&bull; 選挙・住民投票に係る事務（前日・当日）</li>
          <li>&bull; 地域防災計画に基づく災害応急対策業務</li>
          <li>&bull; 市長が必要と認めて指定する業務</li>
        </ul>
      </SectionCard>

      <SectionCard title="会計年度任用職員の超過勤務">
        <ul className="space-y-2 text-sm text-charcoal/70">
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>1日の勤務時間が7時間45分まで: 100/100</li>
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>1日の勤務時間が7時間45分超: 125/100</li>
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>22時 ~ 翌5時: 150/100</li>
        </ul>
      </SectionCard>
    </div>
  );
}

/* ==================== 特殊勤務手当 ==================== */

const tokushuData = [
  { name: '税務手当（賦課・評価調査）', amount: '1日200円', target: '市民税課・固定資産税課' },
  { name: '税務手当（納付指導・徴収）', amount: '1日100円', target: '納税課' },
  { name: '税務手当（滞納処分）', amount: '調書作成1件20円/物件引揚1件30円', target: '納税課（外勤+200円、月上限1万円）' },
  { name: '国民健康保険料徴収手当', amount: '1日100円（滞納処分は別途）', target: '健康保険課（月上限1万円）' },
  { name: '病原菌接触手当', amount: '1日150円', target: '市民病院 検査技師・医師' },
  { name: '防疫作業従事手当', amount: '1日150円', target: '感染症防疫作業従事者' },
  { name: '保護世帯調査手当', amount: '1日200円', target: '生活福祉課' },
  { name: '介護認定・支援費支給調査手当', amount: '1日100円（4件以上200円）', target: '障害者支援課・介護保険課' },
  { name: '放射線作業手当', amount: '1日150円', target: '市民病院 診療放射線技師・医師' },
  { name: '死体火葬手当', amount: '1日375円', target: '葬儀事務所' },
  { name: '市営住宅使用料徴収手当', amount: '外勤1日200円', target: '住宅政策課' },
  { name: '災害応急作業等手当', amount: '1日710円', target: '災害応急対策・避難所開設等' },
  { name: '緊急消防援助隊手当', amount: '1日2,160円', target: '消防本部（署）' },
  { name: '危険作業従事手当', amount: '1回300円（2時間以上500円）', target: '消防本部（署）火災出場等' },
  { name: '救急業務手当', amount: '出場1回100円', target: '消防本部（署）' },
  { name: '救急救命士手当', amount: '1当務1,000円', target: '消防本部（署）救急救命士' },
  { name: '高所作業手当', amount: '1当務300円', target: '消防本部（署）はしご車等' },
  { name: '清掃業務従事手当', amount: '外勤1日350円（繁忙期500円）', target: '廃棄物対策課' },
  { name: '清掃作業従事手当', amount: '1日200円（繁忙期300円）', target: 'じん芥処理場' },
  { name: '下水道使用料・負担金徴収手当', amount: '外勤1日200円', target: '下水道河川総務課' },
  { name: '終末処理場・ポンプ場業務手当', amount: '1日150円', target: '終末処理場・下水道中継ポンプ場' },
  { name: '夜間看護手当', amount: '4h以上5,000円/2-4h4,400円/2h未満3,000円', target: '市民病院 看護師等' },
  { name: '医師手当', amount: '給料月額×職位別割合/日', target: '市民病院 医師' },
  { name: '救急医療業務手当', amount: '患者1人2,000円（入院4,000円）', target: '市民病院 医師' },
  { name: '分娩介助手当', amount: '医師1胎9,000円/助産師1胎5,000円', target: '市民病院 医師・助産師' },
];

function TokushuSection() {
  return (
    <div className="space-y-4">
      <SectionCard title="特殊勤務手当一覧">
        <InfoBadge>令和7年4月1日現在</InfoBadge>
        <div className="mt-4 space-y-3">
          {tokushuData.map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/50 border border-gray-100">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal">{item.name}</p>
                  <p className="text-xs text-charcoal/40 mt-0.5">{item.target}</p>
                </div>
                <span className="text-sm font-semibold text-accent whitespace-nowrap">{item.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ==================== 昇給について ==================== */

function ShokyuSection() {
  return (
    <div className="space-y-4">
      <SectionCard title="普通昇給">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-4 rounded-xl bg-accent/5 text-center">
            <p className="text-xs text-charcoal/40">昇給日</p>
            <p className="text-lg font-bold text-accent">毎年1月1日</p>
          </div>
          <div className="p-4 rounded-xl bg-accent/5 text-center">
            <p className="text-xs text-charcoal/40">通常昇給</p>
            <p className="text-lg font-bold text-accent">4号給</p>
          </div>
          <div className="p-4 rounded-xl bg-accent/5 text-center">
            <p className="text-xs text-charcoal/40">部長級</p>
            <p className="text-lg font-bold text-accent">1号給</p>
          </div>
        </div>
        <p className="text-sm text-charcoal/60">
          昇給対象期間（1月~12月）に良好な成績で勤務した時、年1回昇給します。
        </p>
      </SectionCard>

      <SectionCard title="昇給しない場合">
        <ul className="space-y-2 text-sm text-charcoal/70">
          <li className="flex gap-2"><span className="text-red-400 shrink-0">1.</span>1月1日時点で育児休業・病気休暇・介護休暇・休職中の場合</li>
          <li className="flex gap-2"><span className="text-red-400 shrink-0">2.</span>満58歳に達した次の年度以降</li>
          <li className="flex gap-2"><span className="text-red-400 shrink-0">3.</span>停職もしくは減給6ヶ月の懲戒処分を受けた場合</li>
        </ul>
      </SectionCard>

      <SectionCard title="昇給号数を調整する場合">
        <ul className="space-y-2 text-sm text-charcoal/70">
          <li className="flex gap-2"><span className="text-amber-500 shrink-0">1.</span>昇給対象期間中に育児休業・病気休暇・介護休暇・休職していた場合</li>
          <li className="flex gap-2"><span className="text-amber-500 shrink-0">2.</span>減給3ヶ月・減給1ヶ月・戒告の懲戒処分を受けた場合</li>
          <li className="flex gap-2"><span className="text-amber-500 shrink-0">3.</span>管理監督責任以外による訓告を受けた場合</li>
        </ul>
      </SectionCard>

      <SectionCard title="長期休職者等の昇給">
        <p className="text-sm text-charcoal/60 mb-3">
          復職時に昇給期間を満たしている者は、復職の翌月初日に昇給します。
        </p>
        <ul className="space-y-2 text-sm text-charcoal/70">
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>育児休業・介護休暇: 期間の1/2を勤務期間とみなす（育休は最大マイナス5号調整）</li>
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>休職: 期間の1/3を勤務期間とみなす</li>
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>病気休暇（引き続き休職）: 日数の1/3を勤務期間とみる</li>
          <li className="flex gap-2"><span className="text-accent/60 shrink-0">&bull;</span>結核（病気休暇・休職）: 日数の1/2を勤務期間とみる</li>
        </ul>
        <div className="mt-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-charcoal/60">
          病気休暇・介護休暇は期間換算後60日以内、育児休業は90日以内であれば昇給調整なし
        </div>
      </SectionCard>
    </div>
  );
}

/* ==================== 61歳以後の給与 ==================== */

function Over61Section() {
  return (
    <div className="space-y-4">
      <SectionCard>
        <p className="text-sm text-charcoal/70 leading-relaxed">
          令和5年4月1日より定年延長制度の施行に伴い、職員（医師を除く）の定年が段階的に65歳まで引き上げられます。
          60歳に達した翌年度から働き方が変わり、管理監督職（主幹級以上）は原則61歳になる年度以後、担当長級へ降任となります。
        </p>
      </SectionCard>

      <SectionCard title="7割水準になるもの">
        <div className="flex flex-wrap gap-2">
          {['給料', '地域手当', '時間外勤務手当', '休日給', '夜間勤務手当', '期末手当', '勤勉手当', '給料の調整額', '管理職手当', '初任給調整手当', '管理職員特別勤務手当'].map((item) => (
            <span key={item} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium">
              {item}
            </span>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="7割にならないもの（満額支給）">
        <div className="flex flex-wrap gap-2">
          {['扶養手当', '住居手当', '通勤手当', '単身赴任手当', '特殊勤務手当', '宿日直手当'].map((item) => (
            <span key={item} className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium">
              {item}
            </span>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="給料の調整額">
        <p className="text-sm text-charcoal/60 mb-3">
          市立岸和田市民病院に勤務する看護職員等（看護師・准看護師・保健師・助産師）に支給
        </p>
        <TableWrapper>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-charcoal/40 font-medium text-xs">区分</th>
                <th className="text-right py-2 text-charcoal/40 font-medium text-xs">月額</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-charcoal/70">職員</td>
                <td className="py-2 text-right font-semibold text-accent">9,000円</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-charcoal/70">職員（当該年度61歳以上）</td>
                <td className="py-2 text-right font-semibold text-accent">6,300円</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-charcoal/70">再任用職員</td>
                <td className="py-2 text-right font-semibold text-accent">6,300円</td>
              </tr>
              <tr>
                <td className="py-2 text-charcoal/70">再任用短時間（週31時間）</td>
                <td className="py-2 text-right font-semibold text-accent">5,040円</td>
              </tr>
            </tbody>
          </table>
        </TableWrapper>
      </SectionCard>
    </div>
  );
}

/* ==================== 給与の支払い ==================== */

function PaymentSection() {
  return (
    <div className="space-y-4">
      <SectionCard title="支給日">
        <div className="p-4 rounded-xl bg-accent/5 text-center mb-4">
          <p className="text-xs text-charcoal/40">毎月の給与支給日</p>
          <p className="text-3xl font-bold text-accent mt-1">21日</p>
          <p className="text-xs text-charcoal/40 mt-1">土曜・日曜・祝日の場合はその前日又は前々日</p>
        </div>
        <ul className="space-y-1 text-sm text-charcoal/60">
          <li>&bull; 新たに職員となった日から支給を開始し、退職した日をもって終了</li>
          <li>&bull; 死亡した場合はその月分を全額支給</li>
        </ul>
      </SectionCard>

      <SectionCard title="控除項目">
        <div className="space-y-3">
          {[
            {
              title: '共済組合掛金',
              items: [
                '長期: 標準報酬月額 × 91.5/1000',
                '年金払い退職給付: 標準報酬月額 × 7.5/1000',
                '短期: 標準報酬月額 × 52.9/1000',
                '福祉: 標準報酬月額 × 1.6/1000',
                '介護: 標準報酬月額 × 8.0/1000',
              ],
            },
            {
              title: '所得税',
              items: ['12月給与で年末調整を実施'],
            },
            {
              title: '住民税',
              items: ['毎年6月より変更'],
            },
            {
              title: 'その他',
              items: [
                '各種償還金（共済・互助・労金等）',
                '各種保険料（生命保険・損害保険等）',
                '厚生会費・厚生会物品購入代金・駐車場料金等',
              ],
            },
          ].map((section) => (
            <div key={section.title} className="p-3 rounded-xl bg-white/50 border border-gray-100">
              <p className="text-sm font-medium text-charcoal mb-1">{section.title}</p>
              <ul className="space-y-0.5">
                {section.items.map((item, i) => (
                  <li key={i} className="text-xs text-charcoal/50">&bull; {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="給料の減額">
        <p className="text-sm text-charcoal/70 leading-relaxed">
          勤務しないときは、特に承認があった場合を除き、勤務1時間あたりの給料月額に勤務しなかった時間数を乗じて得た額を減額します。
        </p>
        <div className="mt-3 p-3 rounded-xl bg-accent/5 text-xs text-charcoal/60 font-mono text-center">
          勤務1時間あたり = （給料 + 給料 &times; 0.1）&times; 12 &divide; 1,860時間
        </div>
      </SectionCard>
    </div>
  );
}
