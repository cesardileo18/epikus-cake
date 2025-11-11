// src/components/admin/ui.tsx
import React from "react";

/* ---------- Tipos comunes ---------- */
type Tone = "default" | "green" | "amber" | "red";
type BadgeTone = "green" | "red" | "amber" | "blue" | "purple";

/* ---------- UI helpers ---------- */
export const MetricCard: React.FC<{ value: number; label: string; color?: string }> = ({ value, label, color }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 text-center">
    <p className={`text-3xl font-bold ${color ?? "text-gray-900"}`}>{value}</p>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

export const MetricCardMobile: React.FC<{ value: number; label: string; tone: Tone }> = ({ value, label, tone }) => {
  const toneMap: Record<Tone, string> = {
    default: "text-gray-900",
    green: "text-green-600",
    amber: "text-yellow-600",
    red: "text-red-600",
  };
  return (
    <div className="snap-center bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl min-w-[46%] px-4 py-3">
      <p className={`text-2xl font-bold ${toneMap[tone]}`}>{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
};

export const Chip: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm border transition ${
      active ? "bg-pink-100 text-pink-700 border-pink-200" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
    }`}
    type="button"
  >
    {children}
  </button>
);

export const Badge: React.FC<{ tone: BadgeTone; children: React.ReactNode }> = ({ tone, children }) => {
  const map: Record<BadgeTone, string> = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    amber: "bg-yellow-100 text-yellow-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
  };
  return <span className={`px-2 py-0.5 text-xs rounded-full ${map[tone]}`}>{children}</span>;
};

export const IconBtn: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({ title, onClick, children }) => (
  <button
    title={title}
    onClick={onClick}
    className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition grid place-items-center"
    type="button"
    aria-label={title}
  >
    <span className="text-base leading-none">{children}</span>
  </button>
);

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-800">{label}</label>
    {children}
  </div>
);
