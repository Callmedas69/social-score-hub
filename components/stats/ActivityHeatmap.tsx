"use client";

import { memo, useMemo } from "react";
import type { DailyCount } from "@/hooks/useOnchainActivity";

interface ActivityHeatmapProps {
  dailyCounts: DailyCount[];
}

const CELL_SIZE = 10;
const CELL_GAP = 2;
const WEEKS = 52;
const DAYS = 7;

const COLORS = [
  "bg-gray-100", // Level 0: 0 transactions
  "bg-blue-200", // Level 1: 1-2 transactions
  "bg-blue-400", // Level 2: 3-5 transactions
  "bg-blue-600", // Level 3: 6-10 transactions
  "bg-blue-800", // Level 4: 11+ transactions
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getColorLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

function generateGrid(dailyCounts: DailyCount[]) {
  const countsMap = new Map(dailyCounts.map((d) => [d.date, d.count]));

  // Start from today and go back 52 weeks
  const today = new Date();
  const grid: { date: string; count: number; level: number }[][] = [];

  // Calculate the start date (52 weeks ago, aligned to Sunday)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (WEEKS * 7) - today.getDay());

  for (let week = 0; week < WEEKS; week++) {
    const weekData: { date: string; count: number; level: number }[] = [];

    for (let day = 0; day < DAYS; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + week * 7 + day);

      // Don't show future dates
      if (currentDate > today) {
        weekData.push({ date: "", count: 0, level: -1 });
        continue;
      }

      const dateStr = currentDate.toISOString().split("T")[0];
      const count = countsMap.get(dateStr) || 0;

      weekData.push({
        date: dateStr,
        count,
        level: getColorLevel(count),
      });
    }

    grid.push(weekData);
  }

  return grid;
}

function getMonthLabels() {
  const labels: { month: string; weekIndex: number }[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (WEEKS * 7) - today.getDay());

  let lastMonth = -1;

  for (let week = 0; week < WEEKS; week++) {
    const weekDate = new Date(startDate);
    weekDate.setDate(startDate.getDate() + week * 7);
    const month = weekDate.getMonth();

    if (month !== lastMonth) {
      const monthLabel = month === 0
        ? `${MONTHS[month]} '${String(weekDate.getFullYear()).slice(-2)}`
        : MONTHS[month];
      labels.push({ month: monthLabel, weekIndex: week });
      lastMonth = month;
    }
  }

  return labels;
}

export const ActivityHeatmap = memo(function ActivityHeatmap({ dailyCounts }: ActivityHeatmapProps) {
  const grid = useMemo(() => generateGrid(dailyCounts), [dailyCounts]);
  const monthLabels = useMemo(() => getMonthLabels(), []);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-fit">
        {/* Month labels */}
        <div className="relative h-4 mb-1 text-[8px] text-gray-500">
          {monthLabels.map((label, i) => (
            <span
              key={i}
              className="absolute"
              style={{
                left: `${label.weekIndex * (CELL_SIZE + CELL_GAP)}px`,
              }}
            >
              {label.month}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5">
          {/* Weeks */}
          {grid.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-[10px] h-[10px] rounded-sm ${
                    day.level === -1 ? "bg-transparent" : COLORS[day.level]
                  }`}
                  title={
                    day.date
                      ? `${day.date}: ${day.count} transaction${day.count !== 1 ? "s" : ""}`
                      : ""
                  }
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-2 text-[8px] text-gray-500">
          <span>Less</span>
          {COLORS.map((color, i) => (
            <div
              key={i}
              className={`w-[10px] h-[10px] rounded-sm ${color}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
});
