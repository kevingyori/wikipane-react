import { useCallback, useEffect, useMemo, useRef } from "react";
import type { SetURLSearchParams } from "react-router-dom";
import "../wikipedia.css";

export function WikiPage({
  body,
  searchParams,
  setSearchParams,
  pageTitle,
}: {
  body: HTMLBodyElement | null;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  pageTitle: string;
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
    console.time("handleBodyRender");
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
    console.timeEnd("handleBodyRender");
    return body?.innerHTML ?? "";
  }, [body, styleLinks]);

  const renderedBody = useMemo(() => handleBodyRender(), [handleBodyRender]);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.time("add event listeners");
    const current = ref.current?.querySelectorAll("a");
    current?.forEach((link: HTMLAnchorElement) => {
      link.addEventListener("click", (e) => addEventListener(e, link));
    });
    console.timeEnd("add event listeners");

    return () => {
      current?.forEach((link: HTMLAnchorElement) => {
        link.removeEventListener("click", (e) => addEventListener(e, link));
      });
    };
  }, [addEventListener]);

  return (
    <>
      <h2
        className="text-2xl font-bold"
        dangerouslySetInnerHTML={{ __html: pageTitle }}
      />
      <RenderedBody renderedBody={renderedBody} ref={ref} />;
    </>
  );
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
      className="fade-in overflow-hidden"
      dangerouslySetInnerHTML={{
        __html: renderedBody,
      }}
    />
  );
}
