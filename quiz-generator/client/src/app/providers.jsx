import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "../store";
import EditorPersistence from "../features/editor/EditorPersistence";
const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <EditorPersistence />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}
