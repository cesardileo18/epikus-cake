import React, { useEffect, useRef } from "react";

type Props = {
  /** Repetir cada X ms (ej: 7000 = cada 7s). Si no pasás nada, solo al montar. */
  intervalMs?: number;
  /** Cantidad base (se ajusta sola según ancho). */
  count?: number;
  /** Origen relativo (0..1) dentro del contenedor. */
  originX?: number;
  originY?: number;
  /** Sombra en los papelitos (desactívala si querés aún más perf). */
  shadow?: boolean;
};

const ConfettiBurst: React.FC<Props> = ({
  intervalMs,
  count = 70,
  originX = 0.5,
  originY = 0.33,
  shadow = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const launch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Tamaño del canvas con DPR limitado (mejor perf en móvil)
    const parent = canvas.parentElement!;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const cssW = parent.clientWidth;
    const cssH = parent.clientHeight;
    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));
    // Dibujamos en "pixeles CSS"
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const COLORS = ["#FF7BAC", "#D81E77", "#9B5DE5", "#FDE68A", "#93C5FD", "#86EFAC"];
    const baseCount = Math.round(count * (cssW < 480 ? 0.7 : 1)); // menos en pantallas chicas
    const N = baseCount * 2; // izquierda + derecha

    const cx = cssW * originX;
    const cy = cssH * originY;

    type P = { x:number;y:number;vx:number;vy:number;g:number;w:number;h:number;r:number;vr:number;c:string;life:number; };

    const rand = (a:number,b:number)=> Math.random()*(b-a)+a;
    const spread = (40 * Math.PI) / 180; // ±40°

    const parts: P[] = Array.from({ length: N }).map((_, i) => {
      const rightSide = i >= N / 2;
      // Ángulos bien simétricos:
      //   derecha:  -spread..+spread
      //   izquierda: π-spread .. π+spread  => vx negativo
      const angle = rightSide ? rand(-spread, spread) : Math.PI + rand(-spread, spread);
      const speed = 5 + Math.random() * 6;

      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5,
        g: 0.20 + Math.random() * 0.18,
        w: 6 + Math.random() * 6,
        h: 10 + Math.random() * 10,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        life: 85 + Math.random() * 28,
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, cssW, cssH);

      for (const p of parts) {
        p.life -= 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.g;
        p.r += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        if (shadow) {
          ctx.shadowColor = "rgba(0,0,0,.15)";
          ctx.shadowBlur = 6;
        }
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      // seguir mientras haya vida y esté en pantalla
      if (parts.some((p) => p.life > 0 && p.y < cssH + 40)) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
  };

  // Resize con DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const ro = new ResizeObserver(() => {
      // no dibujamos aquí para no gastar; se reescala en el próximo launch
      const p = canvas.parentElement!;
      canvas.style.width = p.clientWidth + "px";
      canvas.style.height = p.clientHeight + "px";
    });
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  // Lanzar al montar + repetir si intervalMs
  useEffect(() => {
    launch();
    if (intervalMs) {
      timerRef.current = window.setInterval(launch, intervalMs) as unknown as number;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, count, originX, originY, shadow]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    />
  );
};

export default ConfettiBurst;
