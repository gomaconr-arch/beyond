import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartTheme, formatDate } from "../../data/clientMetrics";

export default function FatMuscleChart({ measurements = [] }) {
  const data = measurements.map((m) => ({
    date: formatDate(m.date),
    fat: m.fat_pct,
    muscle: m.muscle_mass,
  }));

  return (
    <div className="card-surface h-72 p-3">
      <h4 className="font-display mb-2 text-sm text-slate-700">Body Fat % and Muscle Mass Trend</h4>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid stroke={chartTheme.gridColor} />
          <XAxis dataKey="date" stroke={chartTheme.axisColor} />
          <YAxis yAxisId="left" stroke={chartTheme.axisColor} label={{ value: "Fat %", angle: -90, position: "insideLeft" }} />
          <YAxis yAxisId="right" orientation="right" stroke={chartTheme.axisColor} label={{ value: "Muscle Mass", angle: -90, position: "insideRight" }} />
          <Tooltip
            contentStyle={{
              background: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
              color: chartTheme.tooltipTextColor,
            }}
          />
          <Area yAxisId="left" type="monotone" dataKey="fat" fill="rgba(220,38,38,0.3)" stroke={chartTheme.colors.fat} />
          <Line yAxisId="right" type="monotone" dataKey="muscle" stroke={chartTheme.colors.muscle} strokeWidth={2.5} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
