import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
export default function StatisticCard() {
  const data = [
    { mois: "Jan", frequence: 45 },
    { mois: "Fév", frequence: 52 },
    { mois: "Mar", frequence: 10 },
    { mois: "Avr", frequence: 65 },
    { mois: "Mai", frequence: 48 },
    { mois: "Juin", frequence: 20 },
    { mois: "Juil", frequence: 55 },
    { mois: "Août", frequence: 60 },
    { mois: "Sep", frequence: 50 },
    { mois: "Oct", frequence: 35 },
    { mois: "Nov", frequence: 58 },
    { mois: "Déc", frequence: 72 },
  ];
  return (
    <LineChart
      style={{
        width: "100%",
        maxWidth: "700px",
        height: "100%",
        maxHeight: "60vh",
        aspectRatio: 1.618,
        backgroundColor: "#101828",
        borderRadius: "0.5rem",
        padding: "1rem",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#334155",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.5)",
      }}
      responsive
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" vertical={false} />
      <XAxis
        dataKey="mois"
        stroke="#a78bfa"
        tick={{ fontSize: 13, fill: "#ddd6fe" }}
      />
      <YAxis width="auto" stroke="#a78bfa" tick={{ fontSize: 13, fill: "#ddd6fe" }} />
      <Tooltip
        cursor={{
          stroke: "#a78bfa",
        }}
        contentStyle={{
          backgroundColor: "#1e1b4b",
          borderColor: "#7c3aed",
          color: "#fff",
          fontSize: 14,
          borderRadius: "0.75rem",
        }}
        labelStyle={{ color: "#fff" }}
      />
      <Legend wrapperStyle={{ fontSize: 14, color: "#e0e7ff" }} />
      <Line
        type="monotone"
        dataKey="frequence"
        name="Fréquence"
        stroke="#a78bfa"
        strokeWidth={3}
        dot={{
          fill: "#fff",
          stroke: "#7c3aed",
        }}
        activeDot={{ r: 7, fill: "#fff", stroke: "#7c3aed" }}
      />
    </LineChart>
  );
}
