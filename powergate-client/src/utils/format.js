// Display helpers. Keep formatting decisions in one place.

export function formatHours(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toFixed(1)} h`;
}

// 18.5 -> "18h 30m"
export function formatHoursMinutes(value) {
  const num = Number(value);
  if (value === null || value === undefined || value === "" || Number.isNaN(num)) return "—";
  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(num);
  let h = Math.floor(abs);
  let m = Math.round((abs - h) * 60);
  if (m === 60) {
    h += 1;
    m = 0;
  }
  return `${sign}${h}h ${m}m`;
}

export function formatDate(value) {
  if (!value) return "—";
  // Creator returns dd-MMM-yyyy (optionally with time); pass the date part through untouched.
  if (/^\d{2}-[A-Za-z]{3}-\d{4}/.test(value)) return value.slice(0, 11);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/ /g, "-");
}

export function percent(part, total) {
  const p = Number(part);
  const t = Number(total);
  if (!t || Number.isNaN(p) || Number.isNaN(t)) return 0;
  return Math.max(0, Math.min(100, Math.round((p / t) * 100)));
}

export function initialsFrom(nameOrEmail) {
  if (!nameOrEmail) return "PG";
  const raw = nameOrEmail.includes("@") ? nameOrEmail.split("@")[0] : nameOrEmail;
  const base = raw.replace(/[^A-Za-z0-9\s._-]/g, "") || "PG";
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : base.slice(0, 2);
  return letters.toUpperCase();
}

export function wordCount(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

// Map any approval / work / request status to a pill tone.
export function statusTone(status) {
  const s = String(status || "").toLowerCase();
  if (["approved", "active", "closed", "completed", "done"].includes(s)) return "success";
  if (["pending", "waiting", "sent", "awaiting approval", "in review"].includes(s)) return "warning";
  if (["rejected", "cancelled", "canceled", "inactive", "declined"].includes(s)) return "error";
  if (["needs discussion", "in progress", "open"].includes(s)) return "info";
  return "neutral";
}

// Battery colour vs the project's approval threshold.
export function batteryTone(available, threshold) {
  const a = Number(available);
  const t = Number(threshold) || 0;
  if (Number.isNaN(a)) return "neutral";
  if (a <= t) return "error";
  if (a <= t * 2 + 4) return "warning";
  return "success";
}
