import { useSearchParams } from "react-router-dom";
import { Pane } from "./Pane";

export function Panes() {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <>
      <div className="flex flex-row overflow-x-scroll">
        {searchParams.getAll("wikiPage").map((title, key) => (
          <div key={key} className="border-2">
            <Pane title={title} index={key} />
          </div>
        ))}
      </div>
    </>
  );
}
