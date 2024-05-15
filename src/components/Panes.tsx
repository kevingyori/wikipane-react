import { useSearchParams } from "react-router-dom";
import { Pane } from "./Pane";
import { Search } from "./Search";
import { useEffect, useMemo, useState } from "react";

export function Panes() {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const memoizedSearchParams = useMemo(
    () => searchParams.getAll("wikiPage"),
    [searchParams],
  );
  const memoizedPanes = useMemo(
    () =>
      memoizedSearchParams.map((title, key) => (
        <div
          key={key}
          className="shadow-xl shadow-gray-300"
          style={{
            position: "sticky",
            left: key * 40,
            right: -650 + (memoizedSearchParams.length - key - 1) * 40,
          }}
        >
          <Pane title={title} index={key} />
        </div>
      )),
    [memoizedSearchParams],
  );

  useEffect(() => {
    if (searchParams.getAll("wikiPage").length === 0) {
      setOpen(true);
    }
  }, [searchParams]);

  return (
    <>
      <div className="flex flex-row overflow-x-scroll overflow-y-hidden scrollbar-thin h-screen w-screen">
        <Search open={open} setOpen={setOpen} />
        {memoizedPanes}
      </div>
    </>
  );
}
