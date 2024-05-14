import { useSearchParams } from "react-router-dom";
import { Pane } from "./Pane";
import { Search } from "./Search";
import { useEffect, useRef, useState } from "react";

export function Panes() {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams.getAll("wikiPage").length === 0) {
      setOpen(true);
    }
  }, [searchParams]);

  return (
    <>
      <div
        className="flex flex-row overflow-x-scroll overflow-y-hidden scrollbar-thin h-screen w-screen"
        ref={containerRef}
      >
        <Search
          open={open}
          setOpen={setOpen}
          // className="z-50 fixed top-0"
          // containerRef={containerRef.current}
        />
        {searchParams.getAll("wikiPage").map((title, key) => (
          <div
            key={key}
            className="shadow-xl shadow-gray-300"
            style={{
              position: "sticky",
              left: key * 40,
              right: key * -40 - 490,
            }}
          >
            <Pane title={title} index={key} />
          </div>
        ))}
      </div>
    </>
  );
}
