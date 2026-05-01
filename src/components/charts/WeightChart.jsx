import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartTheme, formatDate } from "../../data/clientMetrics";

export default function WeightChart({ measurements = [] }) {
  const data = measurements.map((m) => ({
    date: formatDate(m.date),
    weight: m.weight_lbs,
  }));

  return (
    <div className="card-surface h-72 p-3">
      <h4 className="font-display mb-2 text-sm text-slate-700">Body Weight Trend</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke={chartTheme.gridColor} />
          <XAxis dataKey="date" stroke={chartTheme.axisColor} />
          <YAxis stroke={chartTheme.axisColor} />
          <Tooltip
            formatter={(value) => [`${value} lbs`, "Body Weight"]}
            contentStyle={{
              background: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
              color: chartTheme.tooltipTextColor,
            }}
          />
          <Line type="monotone" dataKey="weight" stroke={chartTheme.colors.weight} strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
