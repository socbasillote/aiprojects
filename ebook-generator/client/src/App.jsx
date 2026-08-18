import { useEffect } from "react";

import { useDispatch } from "react-redux";

import { initializeAuth } from "./features/auth/authSlice.js";

import AppRouter from "./app/router.jsx";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <AppRouter />;
};

export default App;
