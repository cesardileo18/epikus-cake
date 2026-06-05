// src/components/admin/ui.tsx
// Design system del panel admin: paleta dark + acento rosa, mobile-first.
import React from "react";

/* ============================================================
   Tipos comunes
   ============================================================ */
export type Tone = "default" | "green" | "amber" | "red" | "pink" | "blue" | "purple";
export type BadgeTone = "green" | "red" | "amber" | "blue" | "purple" | "pink" | "slate";

/* ============================================================
   Clases compartidas (usar en cada vista para inputs/textareas/selects)
   ============================================================ */
export const inputClass =
  "h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white outline-none transition-colors placeholder:text-slate-500 focus:border-pink-500/60 focus:bg-white/[0.06]";

export const textareaClass =
  "w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white outline-none transition-colors placeholder:text-slate-500 focus:border-pink-500/60 focus:bg-white/[0.06]";

export const selectClass = inputClass + " cursor-pointer appearance-none";

/* ============================================================
   AdminPage — wrapper de toda vista admin
   ============================================================ */
export const AdminPage: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`mx-auto w-full max-w-7xl ${className}`}>{children}</div>
);

/* ============================================================
   AdminHeader — header consistente para cada vista
   ============================================================ */
interface AdminHeaderProps {
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  title: string;
  highlight?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  eyebrow,
  eyebrowIcon,
  title,
  highlight,
  description,
  actions,
}) => (
  <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      {eyebrow && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-pink-500/40 bg-pink-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-pink-300">
          {eyebrowIcon}
          {eyebrow}
        </div>
      )}
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        {title}
        {highlight && (
          <>
            {" "}
            <span className="text-pink-400">{highlight}</span>
          </>
        )}
      </h1>
      {description && (
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">{description}</p>
      )}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </section>
);

/* ============================================================
   AdminCard — superficie estandar
   ============================================================ */
export const AdminCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <section
    className={`rounded-xl border border-white/10 bg-[#0c0e1a] p-4 shadow-xl sm:p-5 ${className}`}
  >
    {children}
  </section>
);

/* ============================================================
   SectionTitle — header de card con icono opcional
   ============================================================ */
type IconLike = React.ComponentType<any>;

export const SectionTitle: React.FC<{
  icon?: IconLike;
  title: string;
  description?: string;
}> = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3">
    {Icon && (
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-pink-500/15 text-pink-300 ring-1 ring-pink-500/25">
        <Icon size={18} />
      </div>
    )}
    <div>
      <h2 className="text-sm font-black uppercase tracking-wide text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-500">
          {description}
        </p>
      )}
    </div>
  </div>
);

/* ============================================================
   Field — label arriba + control abajo
   ============================================================ */
export const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">
      {label}
    </span>
    {children}
    {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
  </label>
);

/* ============================================================
   SwitchControl — toggle ON/OFF
   ============================================================ */
export const SwitchControl: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={[
      "relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200",
      checked ? "border-pink-500/40 bg-pink-500" : "border-white/10 bg-slate-700/70",
    ].join(" ")}
  >
    <span
      className={[
        "absolute left-1 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200",
        checked ? "translate-x-5" : "translate-x-0",
      ].join(" ")}
    />
  </button>
);

/* ============================================================
   Buttons
   ============================================================ */
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "subtle";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-pink-600 text-white hover:bg-pink-500 disabled:bg-pink-600/40 disabled:text-white/60",
  secondary:
    "border border-white/15 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08] disabled:opacity-50",
  danger:
    "border border-rose-400/25 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 disabled:opacity-50",
  ghost:
    "text-slate-300 hover:bg-white/[0.06] hover:text-white disabled:opacity-50",
  subtle:
    "border border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/15 disabled:opacity-50",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-4 text-sm",
};

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const AdminButton: React.FC<AdminButtonProps> = ({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth,
  className = "",
  children,
  ...rest
}) => (
  <button
    type="button"
    {...rest}
    className={[
      "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors disabled:cursor-not-allowed",
      buttonVariants[variant],
      buttonSizes[size],
      fullWidth ? "w-full" : "",
      className,
    ].join(" ")}
  >
    {iconLeft}
    {children}
    {iconRight}
  </button>
);

/* ============================================================
   MetricCard / MetricCardMobile
   ============================================================ */
const toneText: Record<Tone, string> = {
  default: "text-white",
  green: "text-emerald-300",
  amber: "text-amber-300",
  red: "text-rose-300",
  pink: "text-pink-300",
  blue: "text-sky-300",
  purple: "text-violet-300",
};

export const MetricCard: React.FC<{
  value: React.ReactNode;
  label: string;
  tone?: Tone;
  icon?: React.ReactNode;
  hint?: string;
}> = ({ value, label, tone = "default", icon, hint }) => (
  <div className="rounded-xl border border-white/10 bg-[#0c0e1a] p-4 shadow-xl sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className={`mt-1.5 text-2xl font-bold sm:text-3xl ${toneText[tone]}`}>
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
      {icon && (
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-pink-500/10 text-pink-300 ring-1 ring-pink-500/20">
          {icon}
        </div>
      )}
    </div>
  </div>
);

export const MetricCardMobile: React.FC<{
  value: React.ReactNode;
  label: string;
  tone?: Tone;
}> = ({ value, label, tone = "default" }) => (
  <div className="snap-center min-w-[46%] rounded-xl border border-white/10 bg-[#0c0e1a] px-4 py-3 shadow-xl">
    <p className={`text-xl font-bold ${toneText[tone]}`}>{value}</p>
    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
      {label}
    </p>
  </div>
);

/* ============================================================
   Chip — pill seleccionable para filtros
   ============================================================ */
export const Chip: React.FC<{
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    type="button"
    className={[
      "h-9 rounded-full border px-3 text-xs font-bold transition-colors",
      active
        ? "border-pink-500/40 bg-pink-500/15 text-pink-200"
        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white",
    ].join(" ")}
  >
    {children}
  </button>
);

/* ============================================================
   Badge — pill estatico
   ============================================================ */
const badgeMap: Record<BadgeTone, string> = {
  green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  red: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  blue: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  purple: "border-violet-400/25 bg-violet-400/10 text-violet-200",
  pink: "border-pink-400/30 bg-pink-400/10 text-pink-200",
  slate: "border-white/10 bg-white/[0.05] text-slate-300",
};

export const Badge: React.FC<{
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}> = ({ tone = "slate", children, className = "" }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${badgeMap[tone]} ${className}`}
  >
    {children}
  </span>
);

/* ============================================================
   IconBtn — boton cuadrado de accion
   ============================================================ */
export const IconBtn: React.FC<{
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "danger";
}> = ({ title, onClick, children, tone = "default" }) => (
  <button
    title={title}
    onClick={onClick}
    type="button"
    aria-label={title}
    className={[
      "grid h-9 w-9 place-items-center rounded-lg border transition-colors",
      tone === "danger"
        ? "border-rose-400/25 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20"
        : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]",
    ].join(" ")}
  >
    <span className="grid place-items-center text-sm leading-none">{children}</span>
  </button>
);

/* ============================================================
   EmptyState — estado vacio reutilizable
   ============================================================ */
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="rounded-xl border border-white/10 bg-[#0c0e1a] px-6 py-12 text-center shadow-xl">
    {icon && <div className="mb-3 grid place-items-center text-3xl text-slate-500">{icon}</div>}
    <h3 className="text-base font-bold text-white">{title}</h3>
    {description && (
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">{description}</p>
    )}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);

/* ============================================================
   Spinner / Loader pantalla completa
   ============================================================ */
export const AdminLoader: React.FC<{ label?: string }> = ({ label = "Cargando..." }) => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="text-center">
      <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-pink-500/30 border-t-pink-500" />
      <p className="text-xs font-medium text-slate-400">{label}</p>
    </div>
  </div>
);

/* ============================================================
   AdminInput / AdminTextarea / AdminSelect — atomos reutilizables
   ============================================================ */
export const AdminInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...rest }, ref) => (
  <input ref={ref} {...rest} className={`${inputClass} ${className}`} />
));
AdminInput.displayName = "AdminInput";

export const AdminTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...rest }, ref) => (
  <textarea ref={ref} {...rest} className={`${textareaClass} ${className}`} />
));
AdminTextarea.displayName = "AdminTextarea";

export const AdminSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className = "", children, ...rest }, ref) => (
  <select ref={ref} {...rest} className={`${selectClass} ${className}`}>
    {children}
  </select>
));
AdminSelect.displayName = "AdminSelect";

/* ============================================================
   Checkbox dark
   ============================================================ */
export const AdminCheckbox: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { labelText?: string; hint?: string }
> = ({ labelText, hint, className = "", ...rest }) => (
  <label className="flex cursor-pointer items-start gap-3">
    <input
      type="checkbox"
      {...rest}
      className={`mt-1 h-4 w-4 rounded border-white/15 bg-white/[0.04] accent-pink-500 ${className}`}
    />
    {labelText && (
      <span>
        <span className="block text-sm font-bold text-white">{labelText}</span>
        {hint && <span className="block text-xs text-slate-400">{hint}</span>}
      </span>
    )}
  </label>
);
