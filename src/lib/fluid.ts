/**
 * fluid.ts — ヒーローのWebGL流体（Navier-Stokes）初期化。
 * 数値設定（解像度・力）をコンポーネントから分離し、page.tsx にマジックナンバーを残さない。
 * 失敗時（WebGL不可）は静かに何もしない＝CSSのインク雲フォールバックが見える。
 */

export function initFluid(container: HTMLElement): () => void {
  let fluid: { stop: () => void } | null = null;
  let ambient: ReturnType<typeof setInterval> | null = null;
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  (async () => {
    try {
      const mod = await import('webgl-fluid-enhanced');
      const FluidClass = mod.default;
      const f = new FluidClass(container);
      const lite = window.matchMedia('(max-width: 900px)').matches;
      f.setConfig({
        simResolution: lite ? 96 : 128,
        dyeResolution: lite ? 512 : 1024,
        densityDissipation: 0.32,
        velocityDissipation: 0.22,
        pressure: 0.8,
        pressureIterations: lite ? 12 : 20,
        curl: 26,
        splatRadius: 0.28,
        splatForce: 5200,
        shading: true,
        colorful: false,
        colorPalette: ['#1B4D4F', '#2A6F72', '#3E8487', '#5D9496', '#A88652'],
        hover: true,
        backgroundColor: '#FAF9F4',
        transparent: false,
        brightness: 0.9,
        bloom: false,
        sunrays: false,
      });
      f.start();
      fluid = f;
      const wrap = document.getElementById('fluidWrap');
      if (wrap) wrap.style.opacity = '1';
      timeouts.push(setTimeout(() => f.multipleSplats(6), 150));
      timeouts.push(setTimeout(() => f.multipleSplats(4), 650));
      timeouts.push(setTimeout(() => f.multipleSplats(3), 1400));
      ambient = setInterval(() => {
        if (!document.hidden && window.scrollY < window.innerHeight) {
          f.multipleSplats(2 + Math.floor(Math.random() * 2));
        }
      }, 3800);
    } catch {
      /* WebGL不可: CSSインク雲フォールバックがそのまま見える */
    }
  })();

  return () => {
    timeouts.forEach(clearTimeout);
    if (ambient) clearInterval(ambient);
    fluid?.stop();
  };
}
