import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Panes } from "./components/Panes";
import { PanesProvider } from "./context/PanesContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Panes />,
  },
]);

function App() {
  return (
    <PanesProvider>
      <RouterProvider router={router} />
    </PanesProvider>
  );
}

export default App;
