import { useSearchParams } from "react-router-dom";
import { Pane } from "./Pane";
import { Search } from "./Search";
import { useState } from "react";
import { Options } from "./Options";

function WikiPanes() {
  const [searchParams] = useSearchParams();
  const searchParamsArray = searchParams.get("page")?.split(",");

  return (
    <>
      {searchParamsArray?.map((title, index) => (
        <Pane title={title} index={index} key={title} />
      ))}
    </>
  );
}

export function Panes() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="flex h-screen w-screen flex-row overflow-y-hidden overflow-x-scroll scrollbar-thin">
        <WikiPanes />
        <Search open={searchOpen} setOpen={setSearchOpen} />
        <Options setSearchOpen={setSearchOpen} />
      </div>
    </>
  );
}
