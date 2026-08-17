import { useSelector } from "react-redux";

import AppRoutes from "./routes";
import type { RootState } from "./store";

export default function App() {
  const state = useSelector((state: RootState) => state);
  console.log("App state:", state);

  return <AppRoutes />;
}
