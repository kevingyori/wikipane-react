import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Panes } from "./components/Panes";

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
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
