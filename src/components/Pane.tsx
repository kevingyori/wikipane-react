import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

async function fetchPage(title: string) {
  const url = `https://en.wikipedia.org/w/rest.php/v1/page/${title}/html`;
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

function WikiPage({
  pageRef,
  data,
}: {
  pageRef: React.MutableRefObject<HTMLDivElement | null>;
  data: string;
}) {
  // const html = data.replace('<base href="//en.wikipedia.org/wiki/">', "");
  const html = new DOMParser()
    .parseFromString(data, "text/html")
    .querySelector("body");
  // html?.querySelector("base")?.remove();
  console.log(html);

  return (
    <div
      ref={pageRef}
      className="overflow-hidden fade-in"
      dangerouslySetInnerHTML={{ __html: html?.innerHTML }}
    />
  );
}

function WikiTitle({ title }: { title: string }) {
  return (
    <p
      className="font-medium text-lg rotate-90 pb-1.5 w-screen origin-bottom-left"
      dangerouslySetInnerHTML={{ __html: title }}
    />
  );
}

export function Pane({
  title,
  index,
  isInactive,
}: {
  title: string;
  index: number;
  isInactive: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageRef = useRef<HTMLDivElement>(null);
  const [pageTitle, setPageTitle] = useState("");

  const queryKey = useMemo(() => ["page", title], [title]);
  const fetchPageMemoized = useCallback(() => fetchPage(title), [title]);
  const addEventListeners = useCallback(() => {
    pageRef.current?.querySelectorAll("a").forEach((link) => {
      if (link.getAttribute("rel") !== "mw:WikiLink") {
        // console.log("link isn't a wiki link", link.getAttribute("rel"));
        return;
      }

      if (
        searchParams
          .getAll("wikiPage")
          .includes(link.getAttribute("title") as string)
      ) {
        link.classList.add("bg-blue-200");
      } else {
        link.classList.remove("bg-blue-200");
      }

      // don't add an event listener multiple times
      if (link.getAttribute("data-event-listener")) {
        // console.log("event listener already added");
        return;
      }

      // add attribute to prevent adding event listener multiple times
      link.setAttribute("data-event-listener", "true");
      // console.log("event listener added");

      link.addEventListener("click", (e) => {
        if (link.querySelector("img")) {
          e.preventDefault();
          return;
        }

        const title = link.getAttribute("title");

        if (title !== null) {
          if (index < searchParams.getAll("wikiPage").length - 1) {
            setSearchParams((prev) => {
              const wikiPages = prev.getAll("wikiPage");
              wikiPages.splice(index + 1, wikiPages.length - index - 1);
              prev.delete("wikiPage");
              wikiPages.forEach((wikiPage) => {
                prev.append("wikiPage", wikiPage);
              });
              return prev;
            });
          }
          e.preventDefault();

          setSearchParams((prev) => {
            prev.append("wikiPage", title);
            return prev;
          });
        }
      });
    });
  }, [searchParams, setSearchParams, index]);

  const { data, isPending, isError } = useQuery({
    queryKey: queryKey,
    queryFn: fetchPageMemoized,
    enabled: title !== "search",
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    _optimisticResults: "optimistic",
  });
  // const [pageState, setPageState] = useState<"bottom" | "middle" | "top">(
  //   "top",
  // );

  useEffect(() => {
    // delete base url html tag from htmlPage
    pageRef.current?.querySelector("base")?.remove();
    setPageTitle(
      (prev) => pageRef.current?.querySelector("title")?.textContent ?? prev,
    );

    const html = new DOMParser().parseFromString(data, "text/html");
    const title = html.querySelector("title")?.textContent;
    // console.log(title, html);

    addEventListeners();
  }, [addEventListeners, data]);

  // const memoizedWikiPage = useMemo(
  //   () => <WikiPage pageRef={pageRef} data={data || ""} />,
  //   [data],
  // );

  function closePane() {
    setSearchParams((prev) => {
      const wikiPages = prev.getAll("wikiPage");
      wikiPages.splice(index, 1);
      prev.delete("wikiPage");
      wikiPages.forEach((wikiPage) => {
        prev.append("wikiPage", wikiPage);
      });
      return prev;
    });
  }

  if (isPending) {
    return (
      <div
        className="h-screen p-3 scroll-y overflow-y-scroll overflow-x-hidden min-w-[650px] w-[650px] bg-white sticky"
        style={{ zIndex: index, right: index * 40, scrollbarWidth: "thin" }}
      ></div>
    );
  }

  if (isError) {
    return null;
  }

  if (data) {
    return (
      <div className="flex bg-white scrollbar-thin">
        <div
          className="w-10 min-w-10 sticky cursor-vertical-text text-gray-700"
          style={{ zIndex: index, right: index * 40 }}
        >
          <button onClick={closePane}>X</button>
          {!isPending ? <WikiTitle title={pageTitle} /> : " "}
          {/* {isInactive ? "i" : "a"} */}
        </div>
        <div className="h-[calc(100vh-20px)] py-3 pr-3 scroll-y overflow-y-scroll overflow-x-hidden min-w-[650px] w-[650px] scrollbar-thin">
          <div
            className="text-2xl font-bold"
            dangerouslySetInnerHTML={{ __html: pageTitle }}
          ></div>
          {!isInactive ? <WikiPage pageRef={pageRef} data={data} /> : " "}
        </div>
      </div>
    );
  }

  return <div className="bg-white sticky min-w-[650px]"> </div>;
}
