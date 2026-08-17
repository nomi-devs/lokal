import { StrictMode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import "./i18n";
import App from "./App";
import { DirectionAwareToaster } from "./components/ui/DirectionAwareToaster";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { store, persistor } from "./store";
import { ThemeProvider } from "./providers/ThemeProvider";
import { DirectionProvider } from "./providers/DirectionProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <DirectionProvider>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <BrowserRouter>
                <App />
                <DirectionAwareToaster />
              </BrowserRouter>
            </PersistGate>
          </Provider>
        </DirectionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
