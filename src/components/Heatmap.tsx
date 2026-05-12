type Props = {
  data: { day: string; count: number }[];
  days?: number;
};

function toUTCDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shade(count: number, max: number): string {
  if (count === 0) return "bg-zinc-200 dark:bg-zinc-800";
  const ratio = max ? count / max : 0;
  if (ratio < 0.25) return "bg-rose-200 dark:bg-rose-900";
  if (ratio < 0.5) return "bg-rose-300 dark:bg-rose-800";
  if (ratio < 0.75) return "bg-rose-400 dark:bg-rose-700";
  return "bg-rose-600 dark:bg-rose-500";
}

export function Heatmap({ data, days = 91 }: Props) {
  const map = new Map(data.map((d) => [d.day, d.count]));
  const max = data.reduce((m, d) => Math.max(m, d.count), 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const cells: { day: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const key = toUTCDay(d);
    cells.push({ day: key, count: map.get(key) ?? 0 });
  }

  const cols = Math.ceil(days / 7);
  const grid: { day: string; count: number }[][] = Array.from({ length: 7 }, () => []);
  cells.forEach((c, i) => grid[i % 7].push(c));

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${cols}, 12px)`, gridTemplateRows: `repeat(7, 12px)` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              title={`${cell.day} · ${cell.count} attempt${cell.count === 1 ? "" : "s"}`}
              className={`h-3 w-3 rounded-[2px] ${shade(cell.count, max)}`}
              style={{ gridRow: r + 1, gridColumn: c + 1 }}
            />
          )),
        )}
      </div>
    </div>
  );
}
