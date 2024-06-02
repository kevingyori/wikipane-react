import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { SetURLSearchParams, useSearchParams } from "react-router-dom";
import "../wikipedia.css";
import { Globe, SquareX } from "lucide-react";

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
}: {
  body: HTMLBodyElement | null;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}) {
  const styleLinks = useCallback(
    (link: HTMLAnchorElement) => {
      if (
        searchParams
          .get("page")
          ?.split(",")
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
        // const index = searchParams.getAll("page").indexOf(title);
        // if (index < searchParams.getAll("page").length - 1) {
        //   setSearchParams((prev) => {
        //     const wikiPages = prev.getAll("page");
        //     wikiPages.splice(index + 1, wikiPages.length - index - 1);
        //     prev.delete("page");
        //     wikiPages.forEach((wikiPage) => {
        //       prev.append("page", wikiPage);
        //     });
        //     return prev;
        //   });
        // }

        setSearchParams((prev) => {
          const wikiPages = prev.get("page")?.split(",");
          if (!wikiPages) {
            prev.append("page", title);
            return prev;
          }
          wikiPages?.push(title);
          prev.set("page", wikiPages?.join(","));
          return prev;
        });
      }
    },
    [setSearchParams, searchParams],
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

  return <RenderedBody renderedBody={renderedBody} ref={ref} />;
}

function RenderedBody({
  renderedBody,
  ref,
}: {
  renderedBody: string;
  ref: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      className="overflow-hidden fade-in"
      dangerouslySetInnerHTML={{
        __html: renderedBody,
      }}
    />
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

  const parseHTML = useCallback((data: string) => {
    console.log("parsing html");
    return new DOMParser().parseFromString(data, "text/html");
  }, []);

  const html = useMemo(() => parseHTML(data ?? ""), [data, parseHTML]);

  const pageTitle = useMemo(
    () => html.querySelector("head")?.querySelector("title")?.textContent ?? "",
    [html],
  );

  const memoizedWikiPage = useMemo(
    () => (
      <WikiPage
        body={html?.querySelector("body")}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
    ),
    [html, searchParams, setSearchParams],
  );

  const memoizedWikiTitle = useMemo(
    () => <WikiTitle title={pageTitle} />,
    [pageTitle],
  );

  function closePane() {
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
        <div
          className="w-10 min-w-10 sticky cursor-vertical-text text-gray-700 group"
          style={{ zIndex: index, right: index * 40 }}
        >
          <button onClick={closePane} className="p-2">
            <SquareX className="text-gray-100 group-hover:text-gray-400 hover:!text-red-500 transition-colors" />
          </button>
          {isPending ? (
            <>
              <WikiTitle title={title} />
            </>
          ) : null}
          {isError && <WikiTitle title="Error" />}
          {isPending || isError ? null : memoizedWikiTitle}
        </div>
        <div className="h-[calc(100vh-20px)] py-3 pr-3 scroll-y overflow-y-scroll overflow-x-hidden min-w-[650px] w-[650px] scrollbar-thin">
          {isPending && (
            <>
              <div className="text-2xl font-bold">{title}</div>
              <Globe className="animate-spin mx-auto mt-8 w-6" />
            </>
          )}
          {isError && <div>Error</div>}
          {isPending || isError ? null : (
            <>
              <div
                className="text-2xl font-bold"
                dangerouslySetInnerHTML={{ __html: pageTitle }}
              />
              {memoizedWikiPage}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
