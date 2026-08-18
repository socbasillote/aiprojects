import { Provider } from "react-redux";

import { BrowserRouter } from "react-router-dom";

import { Toaster } from "sonner";

import store from "./store.js";

const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}

        <Toaster position="bottom-right" richColors />
      </BrowserRouter>
    </Provider>
  );
};

export default Providers;
