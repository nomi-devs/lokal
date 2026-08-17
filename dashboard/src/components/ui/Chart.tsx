/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
  type Plugin,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export type ChartProps = (
  | { type: "line"; data: ChartData<"line">; options?: ChartOptions<"line"> }
  | { type: "bar"; data: ChartData<"bar">; options?: ChartOptions<"bar"> }
  | { type: "pie"; data: ChartData<"pie">; options?: ChartOptions<"pie"> }
  | { type: "doughnut"; data: ChartData<"doughnut">; options?: ChartOptions<"doughnut"> }
) & {
  plugins?: Plugin[];
  className?: string;
};

export default function Chart({ type, data, options, plugins, className }: ChartProps) {
  const props = { data, options, plugins, className } as any;

  switch (type) {
    case "bar":
      return <Bar {...props} />;
    case "line":
      return <Line {...props} />;
    case "pie":
      return <Pie {...props} />;
    case "doughnut":
      return <Doughnut {...props} />;
    default:
      return null;
  }
}
