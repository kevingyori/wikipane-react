import { memo } from "react";
import { useSearchParams } from "react-router-dom";
import { PaneSidebar } from "./PaneSidebar";
import { PaneContent } from "./PaneContent";

export const Pane = memo(
  ({ title, index }: { title: string; index: number }) => {
    const [searchParams] = useSearchParams();

    const searchParamsArray = searchParams.get("page")?.split(",") ?? [];

    const left = index * 40;
    const right = -650 + (searchParamsArray.length - index - 1) * 40;

    return (
      <div
        className="shadow-xl shadow-gray-300"
        style={{
          position: "sticky",
          left: left,
          right: right,
        }}
      >
        <div className="flex bg-white scrollbar-thin">
          <PaneSidebar title={title} index={index} />
          <PaneContent title={title} />
        </div>
      </div>
    );
  },
);
