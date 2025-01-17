import { SquareX } from "lucide-react";
import { startTransition } from "react";
import { usePanes } from "../context/PanesContext";

export function PaneSidebar({
  title,
  index,
}: {
  title: string;
  index: number;
}) {
  const { removePane } = usePanes();

  function closePane() {
    startTransition(() => {
      removePane(index);
    });
  }

  return (
    <div
      className="group sticky w-10 min-w-10 cursor-vertical-text text-gray-700"
      style={{ zIndex: index, right: index * 40 }}
    >
      <button onClick={closePane} className="p-2">
        <SquareX className="text-gray-200 transition-colors group-hover:text-gray-400 hover:!text-red-600" />
      </button>
      <div className="w-screen origin-bottom-left rotate-90 bg-white pb-1.5 text-lg font-medium">
        {title}
      </div>
    </div>
  );
}
