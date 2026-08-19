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

export default function Chart(props: ChartProps) {
  const { plugins, className } = props;

  switch (props.type) {
    case "bar":
      return (
        <Bar data={props.data} options={props.options} plugins={plugins} className={className} />
      );
    case "line":
      return (
        <Line data={props.data} options={props.options} plugins={plugins} className={className} />
      );
    case "pie":
      return (
        <Pie data={props.data} options={props.options} plugins={plugins} className={className} />
      );
    case "doughnut":
      return (
        <Doughnut
          data={props.data}
          options={props.options}
          plugins={plugins}
          className={className}
        />
      );
    default:
      return null;
  }
}
