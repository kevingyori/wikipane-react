import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Panes } from "./components/Panes";
import { PanesProvider } from "./context/PanesContext";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Panes />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PanesProvider>
        <RouterProvider router={router} />
      </PanesProvider>
    </QueryClientProvider>
  );
}

export default App;
