import { Pane } from "./Pane";
import { usePanes } from "../context/PanesContext";

export function Panes() {
  const { list, addPane } = usePanes();

  return (
    <>
      <button onClick={addPane}>add pane</button>
      <div className="flex h-screen w-screen flex-row overflow-y-hidden overflow-x-scroll scrollbar-thin">
        {list?.map((title, index) => (
          <Pane title={title} index={index} key={title} />
        ))}
      </div>
    </>
  );
}
