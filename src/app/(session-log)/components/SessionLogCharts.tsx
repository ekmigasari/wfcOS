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

interface ChartDataPoint {
  name: string;
  sessions: number;
}

interface SessionLogChartsProps {
  weeklyChartData: ChartDataPoint[];
  monthlyChartData: ChartDataPoint[];
  yearlyChartData: ChartDataPoint[];
  chartConfig: ChartConfig;
}

// Reusable Chart Component (internal to SessionLogCharts)
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
}) => {
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
          {weeklyChartData.length > 0 &&
          weeklyChartData.some((d) => d.sessions > 0) ? (
            <InternalChartComponent
              data={weeklyChartData}
              config={chartConfig}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">
              No session data for the last 7 days.
            </p>
          )}
        </TabsContent>
        <TabsContent value="monthly" className="p-1">
          {monthlyChartData.some((d) => d.sessions > 0) ? (
            <InternalChartComponent
              data={monthlyChartData}
              config={chartConfig}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">
              No session data for this month.
            </p>
          )}
        </TabsContent>
        <TabsContent value="yearly" className="p-1">
          {yearlyChartData.some((d) => d.sessions > 0) ? (
            <InternalChartComponent
              data={yearlyChartData}
              config={chartConfig}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">
              No session data for this year.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
