import { useSearchParams } from "react-router-dom";
import { Pane } from "./Pane";
import { Search } from "./Search";
import { useMemo, useRef, useState } from "react";
import { Options } from "./Options";

function WikiPanes() {
  const [searchParams] = useSearchParams();
  const searchParamsArray = searchParams.get("page")?.split(",");

  return (
    <>
      {searchParamsArray?.map((title, key) => (
        <Pane title={title} index={key} key={title} />
      ))}
    </>
  );
}

export function Panes() {
  const [searchOpen, setSearchOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        <WikiPanes />
        {memoizedOptions}
        {memoizedSearch}
      </div>
    </>
  );
}
