"use client";

import React from "react";
import * as Recharts from "recharts";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/presentation/components/ui/chart";
import { Button } from "@/presentation/components/ui/button";

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
          content={<ChartTooltipContent />}
          cursor={{ fill: "hsl(var(--muted))" }}
        />
        <Recharts.Bar
          dataKey={dataKey}
          fill="var(--color-sessions)"
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
  // Helper function to get a display label for the offset period
  const getPeriodLabel = (
    offset: number,
    unit: "week" | "month" | "year"
  ): string => {
    if (offset === 0) return `Current ${unit}`;
    const unitPlural = Math.abs(offset) === 1 ? unit : `${unit}s`; // Corrected pluralization for -1, 0, 1
    if (offset < 0) return `${Math.abs(offset)} ${unitPlural} ago`;
    return `${offset} ${unitPlural} from now`;
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-primary mb-3">
        Activity Overview
      </h2>
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-md">
          <TabsTrigger
            value="weekly"
            className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Weekly
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Monthly
          </TabsTrigger>
          <TabsTrigger
            value="yearly"
            className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Yearly
          </TabsTrigger>
        </TabsList>
        <TabsContent value="weekly" className="p-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <Button variant="outline" size="sm" onClick={onPrevWeek}>
              Prev
            </Button>
            <span className="text-xs font-medium text-muted-foreground">
              {getPeriodLabel(weekOffset, "week")}
            </span>
            <Button variant="outline" size="sm" onClick={onNextWeek}>
              Next
            </Button>
          </div>
          {weeklyChartData.length > 0 &&
          weeklyChartData.some((d) => d.sessions > 0) ? (
            <InternalChartComponent // InternalChartComponent should not receive navigation props
              data={weeklyChartData}
              config={chartConfig}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">
              No session data for the{" "}
              {getPeriodLabel(weekOffset, "week").toLowerCase()}.
            </p>
          )}
        </TabsContent>
        <TabsContent value="monthly" className="p-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <Button variant="outline" size="sm" onClick={onPrevMonth}>
              Prev
            </Button>
            <span className="text-xs font-medium text-muted-foreground">
              {getPeriodLabel(monthOffset, "month")}
            </span>
            <Button variant="outline" size="sm" onClick={onNextMonth}>
              Next
            </Button>
          </div>
          {monthlyChartData.some((d) => d.sessions > 0) ? (
            <InternalChartComponent // InternalChartComponent should not receive navigation props
              data={monthlyChartData}
              config={chartConfig}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">
              No session data for the{" "}
              {getPeriodLabel(monthOffset, "month").toLowerCase()}.
            </p>
          )}
        </TabsContent>
        <TabsContent value="yearly" className="p-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <Button variant="outline" size="sm" onClick={onPrevYear}>
              Prev
            </Button>
            <span className="text-xs font-medium text-muted-foreground">
              {getPeriodLabel(yearOffset, "year")}
            </span>
            <Button variant="outline" size="sm" onClick={onNextYear}>
              Next
            </Button>
          </div>
          {yearlyChartData.some((d) => d.sessions > 0) ? (
            <InternalChartComponent // InternalChartComponent should not receive navigation props
              data={yearlyChartData}
              config={chartConfig}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">
              No session data for the{" "}
              {getPeriodLabel(yearOffset, "year").toLowerCase()}.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
