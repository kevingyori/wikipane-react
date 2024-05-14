import { useSearchParams } from "react-router-dom";
import { Pane } from "./Pane";
import { Search } from "./Search";

export function Panes() {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <>
      <div className="flex flex-row overflow-x-scroll">
        {searchParams.getAll("wikiPage").length === 0 ? <Search /> : null}
        {searchParams.getAll("wikiPage").map((title, key) => (
          <div key={key} className="border-2">
            <Pane title={title} index={key} />
          </div>
        ))}
      </div>
    </>
  );
}
