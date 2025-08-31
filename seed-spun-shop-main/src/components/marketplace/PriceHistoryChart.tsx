import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface PriceHistoryData {
  date: Date;
  price: number;
}

interface PriceHistoryChartProps {
  data: PriceHistoryData[];
}

export function PriceHistoryChart({ data }: PriceHistoryChartProps) {

  const chartData = data
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((item) => ({
      date: format(item.date, 'MMM dd'),
      price: item.price,
      fullDate: item.date,
    }));

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const currentPrice = data[data.length - 1]?.price || 0;
  const firstPrice = data[0]?.price || 0;
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-floating">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-primary">
            Price: <span className="font-bold">${payload[0].value.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Price Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Current Price</p>
          <p className="text-lg font-bold text-primary">${currentPrice.toFixed(2)}</p>
        </div>
        
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Price Change</p>
          <p className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}
          </p>
        </div>
        
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">% Change</p>
          <p className={`text-lg font-bold ${priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
          </p>
        </div>
        
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Price Range</p>
          <p className="text-sm font-medium text-foreground">
            ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              domain={['dataMin - 10', 'dataMax + 10']}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ 
                fill: 'hsl(var(--primary))', 
                strokeWidth: 2, 
                r: 4 
              }}
              activeDot={{ 
                r: 6, 
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="text-xs text-muted-foreground text-center">
        Price history over the last {data.length} days • Data refreshed daily
      </div>
    </div>
  );
}