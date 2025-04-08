import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { getDayOfWeek } from "@/utils/date-utils";
import { MoodLog } from "@/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MoodChartProps {
  moodData: MoodLog[];
}

interface FormattedMoodData {
  day: string;
  score: number;
  date: string;
}

export function MoodChart({ moodData }: MoodChartProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [chartData, setChartData] = useState<FormattedMoodData[]>([]);
  
  useEffect(() => {
    // Format data for the chart
    const formatted = moodData.map(log => {
      // Handle both Date objects and string date representations
      const dateValue = log.date instanceof Date ? log.date : new Date(log.date);
      return {
        day: getDayOfWeek(dateValue),
        score: log.score,
        date: dateValue.toISOString()
      };
    });
    
    setChartData(formatted);
  }, [moodData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium text-neutral-800">Mood Tracking</CardTitle>
        <div className="flex space-x-2 text-sm">
          <button 
            className={`px-3 py-1 rounded-full ${
              period === 'week' 
                ? 'bg-primary-100 text-primary-700 font-medium' 
                : 'text-neutral-500 hover:bg-neutral-100'
            }`}
            onClick={() => setPeriod('week')}
          >
            Week
          </button>
          <button 
            className={`px-3 py-1 rounded-full ${
              period === 'month' 
                ? 'bg-primary-100 text-primary-700 font-medium' 
                : 'text-neutral-500 hover:bg-neutral-100'
            }`}
            onClick={() => setPeriod('month')}
          >
            Month
          </button>
          <button 
            className={`px-3 py-1 rounded-full ${
              period === 'year' 
                ? 'bg-primary-100 text-primary-700 font-medium' 
                : 'text-neutral-500 hover:bg-neutral-100'
            }`}
            onClick={() => setPeriod('year')}
          >
            Year
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(79, 134, 247, 0.8)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="rgba(79, 134, 247, 0.2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis 
                domain={[0, 100]} 
                axisLine={false} 
                tickLine={false}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                formatter={(value) => [`${value}`, 'Mood Score']}
                labelFormatter={(_, data) => {
                  if (data && data[0]) {
                    const item = data[0].payload;
                    return `${item.day}`;
                  }
                  return '';
                }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#4F86F7" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#moodGradient)" 
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default MoodChart;
