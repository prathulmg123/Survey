import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App.tsx";
import { GlobalLoader } from "@/components/ui/Loader";
import "./index.css";

const Root = () => (
  <Provider store={store}>
    <GlobalLoader />
    <App />
  </Provider>
);

createRoot(document.getElementById("root")!).render(<Root />);
