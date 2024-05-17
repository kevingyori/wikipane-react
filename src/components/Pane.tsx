import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SetURLSearchParams, useSearchParams } from "react-router-dom";
import "../wikipedia.css";

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

function WikiPage({
  body,
  searchParams,
  setSearchParams,
  isInactive,
}: {
  body: HTMLBodyElement | null;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  isInactive: boolean;
}) {
  const styleLinks = useCallback(
    (link: HTMLAnchorElement) => {
      if (
        searchParams
          .getAll("wikiPage")
          .includes(link.getAttribute("title") as string)
      ) {
        link.classList.add("bg-blue-200");
      } else {
        link.classList.remove("bg-blue-200");
      }
    },
    [searchParams],
  );

  const addEventListener = useCallback(
    (e: MouseEvent, link: HTMLAnchorElement) => {
      // don't add an event listener multiple times
      if (link.getAttribute("data-event-listener")) {
        // console.log("event listener already added");
        return;
      }

      // add attribute to prevent adding event listener multiple times
      link.setAttribute("data-event-listener", "true");
      // console.log("event listener added");

      const title = link.getAttribute("title");

      if (title !== null) {
        e.preventDefault();
        const index = searchParams.getAll("wikiPage").indexOf(title);
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

        setSearchParams((prev) => {
          prev.append("wikiPage", title);
          return prev;
        });
      }
    },
    [searchParams, setSearchParams],
  );

  const handleBodyRender = useCallback(() => {
    body?.querySelectorAll("a").forEach((link) => {
      if (link.getAttribute("rel") !== "mw:WikiLink") {
        // console.log("link isn't a wiki link", link.getAttribute("rel"));
        link.addEventListener("click", (e) => {
          e.preventDefault();
        });
        link.removeAttribute("href");
        return;
      }

      styleLinks(link);
    });
    console.log("body rendered", body);
    return body?.innerHTML ?? "";
  }, [body, styleLinks]);

  const renderedBody = useMemo(() => handleBodyRender(), [handleBodyRender]);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = ref.current?.querySelectorAll("a");
    current?.forEach((link: HTMLAnchorElement) => {
      link.addEventListener("click", (e) => addEventListener(e, link));
    });

    return () => {
      current?.forEach((link: HTMLAnchorElement) => {
        link.removeEventListener("click", (e) => addEventListener(e, link));
      });
    };
  }, [addEventListener]);

  return (
    <>
      {!isInactive ? (
        <div
          ref={ref}
          className="overflow-hidden fade-in"
          dangerouslySetInnerHTML={{
            __html: renderedBody,
          }}
        />
      ) : null}
    </>
  );
}

function WikiTitle({ title }: { title: string }) {
  return (
    <p
      className="font-medium text-lg rotate-90 pb-1.5 w-screen origin-bottom-left bg-white"
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
  const [pageTitle, setPageTitle] = useState("");

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

  const parseHTML = useCallback((data: string) => {
    console.log("parsing html");
    return new DOMParser().parseFromString(data, "text/html");
  }, []);

  const html = useMemo(() => parseHTML(data ?? ""), [data, parseHTML]);

  useEffect(() => {
    console.log("setting page title");
    const htmlTitle = html
      .querySelector("head")
      ?.querySelector("title")?.textContent;
    setPageTitle((prev) => htmlTitle ?? prev);
  }, [html]);

  const memoizedWikiPage = useMemo(
    () => (
      <WikiPage
        body={html?.querySelector("body")}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        isInactive={isInactive}
      />
    ),
    [html, searchParams, setSearchParams, isInactive],
  );

  const memoizedWikiTitle = useMemo(
    () => <WikiTitle title={pageTitle} />,
    [pageTitle],
  );

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
          {!isPending ? memoizedWikiTitle : " "}
        </div>
        <div className="h-[calc(100vh-20px)] py-3 pr-3 scroll-y overflow-y-scroll overflow-x-hidden min-w-[650px] w-[650px] scrollbar-thin">
          <div
            className="text-2xl font-bold"
            dangerouslySetInnerHTML={{ __html: pageTitle }}
          ></div>
          {memoizedWikiPage}
        </div>
      </div>
    );
  }

  return <div className="bg-white sticky min-w-[650px]"> </div>;
}
