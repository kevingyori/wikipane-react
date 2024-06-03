import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { SetURLSearchParams, useSearchParams } from "react-router-dom";
import { Globe, SquareX } from "lucide-react";
import { WikiTitle } from "./WikiTitle";
import { WikiPage } from "./WikiPage";
import { WikiSidebar } from "./WikiSidebar";
import { WikiContent } from "./WikiContent";

async function fetchPage(title: string) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/html/${title}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.text();
  } catch (error) {
    throw new Error("Network response was not ok");
  }
}

export function Pane({ title, index }: { title: string; index: number }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryKey = useMemo(() => ["page", title], [title]);
  const fetchPageMemoized = useCallback(() => fetchPage(title), [title]);

  const { data, isPending, isError } = useQuery({
    queryKey: queryKey,
    queryFn: fetchPageMemoized,
    enabled: title !== "search",
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    _optimisticResults: "optimistic",
  });

  console.time("parsing html");
  const parseHTML = useCallback((data: string) => {
    // console.log("parsing html");
    return new DOMParser().parseFromString(data, "text/html");
  }, []);
  console.timeEnd("parsing html");

  const html = useMemo(() => parseHTML(data ?? ""), [data, parseHTML]);

  const pageTitle = useMemo(
    () => html.querySelector("head")?.querySelector("title")?.textContent ?? "",
    [html],
  );

  function closePane() {
    console.time("closePane");
    setSearchParams((prev) => {
      const wikiPages = prev.get("page")?.split(",");
      if (!wikiPages) {
        return prev;
      }
      if (wikiPages.length === 1) {
        prev.delete("page");
        return prev;
      }
      wikiPages.splice(index, 1);
      prev.set("page", wikiPages.join(","));
      return prev;
    });
    console.timeEnd("closePane");
  }

  const searchParamsArray = searchParams.get("page")?.split(",") ?? [];

  return (
    <div
      className="shadow-xl shadow-gray-300"
      style={{
        position: "sticky",
        left: index * 40,
        right: -650 + (searchParamsArray.length - index - 1) * 40,
      }}
    >
      <div className="flex bg-white scrollbar-thin">
        <WikiSidebar
          title={title}
          index={index}
          closePane={closePane}
          isPending={isPending}
          isError={isError}
          pageTitle={pageTitle}
        />
        <WikiContent
          html={html}
          isPending={isPending}
          isError={isError}
          title={title}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          pageTitle={pageTitle}
        />
      </div>
    </div>
  );
}
