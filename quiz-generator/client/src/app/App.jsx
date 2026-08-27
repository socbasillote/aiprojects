import { BrowserRouter } from "react-router-dom";

import Providers from "./providers";
import AppRouter from "../routes/AppRouter";

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppRouter />
      </Providers>
    </BrowserRouter>
  );
}
