import { useSearchParams } from "react-router-dom";
import { Pane } from "./Pane";
import { Search } from "./Search";
import { useMemo, useRef, useState } from "react";
import { Options } from "./Options";

function WikiPanes() {
  const [searchParams] = useSearchParams();
  const memoizedSearchParams = useMemo(
    () => searchParams.getAll("wikiPage"),
    [searchParams],
  );
  const pageRef = useRef<(HTMLDivElement | null)[]>([]);

  const memoizedPanes = useMemo(
    () =>
      memoizedSearchParams.map((title, key) => (
        <div
          key={key}
          className="shadow-xl shadow-gray-300"
          ref={(ref) => (pageRef.current[key] = ref)}
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
  return <>{memoizedPanes}</>;
}

export function Panes() {
  const [searchOpen, setSearchOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const memoizedWikiPanes = useMemo(() => <WikiPanes />, []);

  const memoizedOptions = useMemo(
    () => <Options setSearchOpen={setSearchOpen} />,
    [],
  );
  const memoizedSearch = useMemo(
    () => <Search open={searchOpen} setOpen={setSearchOpen} />,
    [searchOpen],
  );

  return (
    <>
      <div
        className="flex flex-row overflow-x-scroll overflow-y-hidden scrollbar-thin h-screen w-screen"
        ref={ref}
      >
        {memoizedWikiPanes}
        {memoizedOptions}
        {memoizedSearch}
      </div>
    </>
  );
}
