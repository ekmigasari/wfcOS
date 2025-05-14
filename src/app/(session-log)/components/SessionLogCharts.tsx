"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";
import * as Recharts from "recharts";

import { playSound } from "@/infrastructure/lib/utils";
import { Button } from "@/presentation/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/presentation/components/ui/chart";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/ui/tabs";

interface ChartDataPoint {
  name: string;
  sessions: number;
}

// Updated SessionLogChartsProps to include navigation handlers and offsets
interface SessionLogChartsProps {
  weeklyChartData: ChartDataPoint[];
  monthlyChartData: ChartDataPoint[];
  yearlyChartData: ChartDataPoint[];
  chartConfig: ChartConfig;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  weekOffset: number;
  monthOffset: number;
  yearOffset: number;
}

// Reusable Chart Component (internal to SessionLogCharts)
// This component should NOT have navigation props or logic
const InternalChartComponent = ({
  data,
  config,
  dataKey = "sessions",
  XAxisKey = "name",
}: {
  data: ChartDataPoint[];
  config: ChartConfig;
  dataKey?: string;
  XAxisKey?: string;
}) => (
  <ChartContainer config={config} className="h-[200px] w-full">
    <Recharts.ResponsiveContainer width="100%" height="100%">
      <Recharts.BarChart
        data={data}
        margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
      >
        <Recharts.CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
        <Recharts.XAxis
          dataKey={XAxisKey}
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <Recharts.YAxis
          allowDecimals={false}
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent className="bg-white border rounded-md shadow-sm" />
          }
          cursor={{ fill: "hsl(var(--muted))" }}
        />
        <Recharts.Bar
          dataKey={dataKey}
          fill="var(--color-chart-4)"
          radius={[3, 3, 0, 0]}
          barSize={20}
        />
      </Recharts.BarChart>
    </Recharts.ResponsiveContainer>
  </ChartContainer>
);

export const SessionLogCharts: React.FC<SessionLogChartsProps> = ({
  weeklyChartData,
  monthlyChartData,
  yearlyChartData,
  chartConfig,
  onPrevWeek,
  onNextWeek,
  onPrevMonth,
  onNextMonth,
  onPrevYear,
  onNextYear,
  weekOffset,
  monthOffset,
  yearOffset,
}) => {
  const handleInteractionSound = () => {
    playSound("/sounds/click.mp3", "ui-interaction");
  };

  // Updated Helper function to get a display label for the offset period
  const getPeriodLabel = (
    offset: number,
    unit: "week" | "month" | "year"
  ): string => {
    const today = new Date(); // Base for calculations, uses user's local time

    if (unit === "week") {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + offset * 7);

      const dayOfWeek = targetDate.getDay(); // 0 (Sun) - 6 (Sat)
      const startDate = new Date(targetDate);
      startDate.setDate(targetDate.getDate() - dayOfWeek);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
      };
      const yearOption: Intl.DateTimeFormatOptions = { year: "numeric" };

      const startStr = startDate.toLocaleDateString(undefined, options);
      const endStr = endDate.toLocaleDateString(undefined, options);
      const yearStr = endDate.getFullYear(); // Or startDate, should be same for typical week display

      // Handle cases where the week might span across different years for the start/end display
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      if (startYear !== endYear) {
        return `${startDate.toLocaleDateString(undefined, {
          ...options,
          ...yearOption,
        })} - ${endDate.toLocaleDateString(undefined, {
          ...options,
          ...yearOption,
        })}`;
      }
      return `${startStr} - ${endStr}, ${yearStr}`;
    }

    if (unit === "month") {
      const targetDate = new Date(today);
      targetDate.setDate(1); // Set to first day of month to avoid issues with month rollovers
      targetDate.setMonth(today.getMonth() + offset);
      const options: Intl.DateTimeFormatOptions = {
        month: "long",
        year: "numeric",
      };
      return targetDate.toLocaleDateString(undefined, options);
    }

    if (unit === "year") {
      const targetDate = new Date(today);
      targetDate.setFullYear(today.getFullYear() + offset);
      const options: Intl.DateTimeFormatOptions = { year: "numeric" };
      return targetDate.toLocaleDateString(undefined, options);
    }

    // Fallback (should not be reached)
    if (offset === 0) return `Current ${unit}`;
    const unitPlural = Math.abs(offset) === 1 ? unit : `${unit}s`;
    if (offset < 0) return `${Math.abs(offset)} ${unitPlural} ago`;
    return `${offset} ${unitPlural} from now`;
  };

  return (
    <div className="mb-6">
      <Tabs
        defaultValue="weekly"
        className="w-full flex flex-col items-center justify-center"
        onValueChange={handleInteractionSound}
      >
        <TabsList className="grid w-full grid-cols-3 mb-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-md">
          <TabsTrigger
            value="weekly"
            className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Week
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Month
          </TabsTrigger>
          <TabsTrigger
            value="yearly"
            className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Year
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="weekly"
          className="p-1 flex flex-col items-center justify-center w-full"
        >
          <div className="flex items-center gap-2 mb-3  w-fit border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onPrevWeek();
                handleInteractionSound();
              }}
              className="hover:bg-secondary/20"
            >
              <ChevronLeftIcon className="w-4 h-4 " />
            </Button>
            <span className="text-xs font-medium text-muted-foreground px-2">
              {getPeriodLabel(weekOffset, "week")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onNextWeek();
                handleInteractionSound();
              }}
              className="hover:bg-secondary/20"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
          <InternalChartComponent data={weeklyChartData} config={chartConfig} />
        </TabsContent>
        <TabsContent
          value="monthly"
          className="p-1 flex flex-col items-center justify-center w-full"
        >
          <div className="flex items-center gap-2 mb-3 w-fit border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onPrevMonth();
                handleInteractionSound();
              }}
              className="hover:bg-secondary/20"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground px-2">
              {getPeriodLabel(monthOffset, "month")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onNextMonth();
                handleInteractionSound();
              }}
              className="hover:bg-secondary/20"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
          <InternalChartComponent
            data={monthlyChartData}
            config={chartConfig}
          />
        </TabsContent>
        <TabsContent
          value="yearly"
          className="p-1 flex flex-col items-center justify-center w-full"
        >
          <div className="flex items-center gap-2 mb-3 w-fit border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onPrevYear();
                handleInteractionSound();
              }}
              className="hover:bg-secondary/20"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground px-2">
              {getPeriodLabel(yearOffset, "year")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onNextYear();
                handleInteractionSound();
              }}
              className="hover:bg-secondary/20"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
          <InternalChartComponent data={yearlyChartData} config={chartConfig} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
