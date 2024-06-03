import { useQuery } from "@tanstack/react-query";
import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useTransition,
} from "react";
import { useSearchParams } from "react-router-dom";
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

export const Pane = memo(function Pane({
  title,
  index,
}: {
  title: string;
  index: number;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryKey = useMemo(() => ["page", title], [title]);
  const fetchPageMemoized = useCallback(() => fetchPage(title), [title]);
  const [, startTransition] = useTransition();

  const { data, isPending, isError } = useQuery({
    queryKey: queryKey,
    queryFn: fetchPageMemoized,
    enabled: title !== "search",
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    _optimisticResults: "optimistic",
  });

  const parseHTML = useCallback((data: string) => {
    return new DOMParser().parseFromString(data, "text/html");
  }, []);

  const html = useMemo(() => parseHTML(data ?? ""), [data, parseHTML]);

  const pageTitle = useMemo(
    () => html.querySelector("head")?.querySelector("title")?.textContent ?? "",
    [html],
  );

  function closePane() {
    startTransition(() => {
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
    });
  }

  const searchParamsArray = searchParams.get("page")?.split(",") ?? [];

  const left = useDeferredValue(index * 40);
  const right = useDeferredValue(
    -650 + (searchParamsArray.length - index - 1) * 40,
  );

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
          pageTitle={pageTitle}
        />
      </div>
    </div>
  );
});
