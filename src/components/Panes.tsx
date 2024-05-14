import { useSearchParams } from "react-router-dom";
import { Pane } from "./Pane";
import { Search } from "./Search";

export function Panes() {
  const [searchParams] = useSearchParams();
  return (
    <>
      <div className="flex flex-row overflow-x-scroll overflow-y-hidden scrollbar-thin">
        {searchParams.getAll("wikiPage").length === 0 ? <Search /> : null}
        {searchParams.getAll("wikiPage").map((title, key) => (
          <div
            key={key}
            className="shadow-xl shadow-gray-300"
            style={{
              position: "sticky",
              left: key * 40,
              right: key * -40 - 450,
            }}
          >
            <Pane title={title} index={key} />
          </div>
        ))}
      </div>
    </>
  );
}
