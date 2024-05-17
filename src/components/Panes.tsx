import { useSearchParams } from "react-router-dom";
import { Pane } from "./Pane";
import { Search } from "./Search";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWindowSize } from "@uidotdev/usehooks";

function WikiPanes({
  parentRef,
}: {
  parentRef: React.RefObject<HTMLDivElement>;
}) {
  const [searchParams] = useSearchParams();
  const memoizedSearchParams = useMemo(
    () => searchParams.getAll("wikiPage"),
    [searchParams],
  );
  const pageRef = useRef<(HTMLDivElement | null)[]>([]);

  const [inactivePanes, setInactivePanes] = useState<Array<number | null>>([]);
  const size = useWindowSize();

  const handleScroll = useCallback(() => {
    // Loop through each pane element and get its bounding rect
    if (!pageRef.current) return;
    const OFFSET = 40;
    pageRef.current.forEach((pane, index) => {
      const current = pane?.getBoundingClientRect();
      // check if the pane is the first or last
      // if so, then we don't need to check for prev or next
      // if not, then we can check for prev and next
      let prev, next;
      if (index !== 0) {
        prev = pageRef.current[index - 1]?.getBoundingClientRect();
      }
      if (index !== memoizedSearchParams.length - 1) {
        next = pageRef.current[index + 1]?.getBoundingClientRect();
      }

      // calculate the offset of the pane
      // if (current?.x === OFFSET * index) {
      //   console.log(`Pane ${index + 1}:`, "is docked to the left");
      // }

      const prevIsNear =
        prev?.width > size.width - prev?.x + (OFFSET + 20) * index;
      const nextIsNear = next?.x - 100 < OFFSET * (index + 1) + current?.width;
      console.log(!nextIsNear, index);
      if (next?.x === OFFSET * (index + 1)) {
        // console.log("Next pane is docked to the left");
        // console.log(`Pane ${index + 1}:`, "should be hidden");
        setInactivePanes((prev) => [...prev, index]);
      } else if (prevIsNear) {
        // console.log(`Pane ${index + 1}:`, "is docked to the right");
        setInactivePanes((prev) => [...prev, index]);
      } else {
        console.log(`Pane ${index + 1}:`, "is active");
        setInactivePanes((prev) => prev.filter((pane) => pane !== index));
      }
      // console.log(`Pane ${index + 1}:`, next);
      // console.log("size", size);
    });
  }, [memoizedSearchParams, size.width]);

  useEffect(() => {
    // Attach scroll event listener
    const ref = parentRef.current;
    ref?.addEventListener("scroll", handleScroll);

    // Detach scroll event listener on cleanup
    return () => {
      ref?.removeEventListener("scroll", handleScroll);
    };
  }, [memoizedSearchParams, parentRef, handleScroll]);

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
          <Pane
            title={title}
            index={key}
            // isInactive={inactivePanes.includes(key)}
            isInactive={false}
          />
        </div>
      )),
    [memoizedSearchParams],
  );
  return <>{memoizedPanes}</>;
}

export function Panes() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <div
        className="flex flex-row overflow-x-scroll overflow-y-hidden scrollbar-thin h-screen w-screen"
        ref={ref}
      >
        <WikiPanes parentRef={ref} />
        <Search />
      </div>
    </>
  );
}
