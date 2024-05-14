import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

async function fetchPage(title: string) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/html/${title}`;
  console.log("fetching", url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.text();
  } catch (error) {
    console.error(error);
  }
}

export function Pane({ title, index }: { title: string; index: number }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const htmlPage = useRef<HTMLDivElement>(null);
  const [pageTitle, setPageTitle] = useState("");
  const { data, isPending, isError } = useQuery({
    queryKey: ["page", title],
    queryFn: () => fetchPage(title),
    enabled: title !== "search",
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  // const [pageState, setPageState] = useState<"bottom" | "middle" | "top">(
  //   "top",
  // );

  useEffect(() => {
    // delete base url html tag from htmlPage
    htmlPage.current?.querySelector("base")?.remove();
    setPageTitle(htmlPage.current?.querySelector("title")?.textContent || "");

    // add event listener to all links in htmlPage
    htmlPage.current?.querySelectorAll("a").forEach((link) => {
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
  }, [data, index, searchParams, setSearchParams]);

  if (isPending) {
    return (
      <div
        className="h-screen p-3 scroll-y overflow-y-scroll overflow-x-hidden min-w-[600px] w-[600px] bg-white"
        style={{ scrollbarWidth: "thin" }}
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
          <p
            className="font-medium text-lg rotate-90 pb-1.5 w-screen origin-bottom-left"
            dangerouslySetInnerHTML={{ __html: pageTitle }}
          ></p>
        </div>
        <div className="h-[calc(100vh-20px)] py-3 pr-3 scroll-y overflow-y-scroll overflow-x-hidden min-w-[650px] w-[650px] scrollbar-thin">
          <div
            className="text-2xl font-bold"
            dangerouslySetInnerHTML={{ __html: pageTitle }}
          ></div>
          <div
            ref={htmlPage}
            className="overflow-hidden"
            dangerouslySetInnerHTML={{ __html: data }}
          />
        </div>
      </div>
    );
  }
}
