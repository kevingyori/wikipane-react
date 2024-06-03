import { SquareX } from "lucide-react";
import { WikiTitle } from "./WikiTitle";
import { startTransition } from "react";
import { useSearchParams } from "react-router-dom";

export function WikiSidebar({
  title,
  index,
  isPending,
  isError,
  pageTitle,
}: {
  title: string;
  index: number;
  isPending: boolean;
  isError: boolean;
  pageTitle: string;
}) {
  const [, setSearchParams] = useSearchParams();

  function closePane() {
    startTransition(() => {
      setSearchParams((prev) => {
        const wikiPages = prev.get("page")?.split(",");
        if (!wikiPages) {
          return prev;
        }
        if (wikiPages.length === 1) {
          prev.delete("page");
          return prev;
        }
        wikiPages.splice(index, 1);
        prev.set("page", wikiPages.join(","));
        return prev;
      });
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
      {isPending ? (
        <>
          <WikiTitle title={title} />
        </>
      ) : null}
      {isError && <WikiTitle title="Error" />}
      {isPending || isError ? null : <WikiTitle title={pageTitle} />}
    </div>
  );
}
