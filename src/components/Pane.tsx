import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

async function fetchPage(title: string) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/html/${title}`;
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

export function Pane({
  title = "Alan_Turing",
  index,
}: {
  title?: string;
  index: number;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const htmlPage = useRef<HTMLDivElement>(null);
  const [pageTitle, setPageTitle] = useState("");
  const { data, error, isPending, isError } = useQuery({
    queryKey: ["page", title],
    queryFn: () => fetchPage(title),
  });

  useEffect(() => {
    // delete base url html tag from htmlPage
    htmlPage.current?.querySelector("base")?.remove();
    setPageTitle(htmlPage.current?.querySelector("title")?.textContent || "");

    // add event listener to all links in htmlPage
    htmlPage.current?.querySelectorAll("a").forEach((link) => {
      if (
        searchParams.getAll("wikiPage").includes(link.getAttribute("title"))
      ) {
        link.classList.add("bg-blue-200");
      } else {
        link.classList.remove("bg-blue-200");
      }

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
          // console.log(link, title, "wikipage", index);
          setSearchParams((prev) => {
            prev.append("wikiPage", title);
            return prev;
          });
        }
      });
    });
  }, [htmlPage, data, setSearchParams, index, searchParams]);

  if (isPending) {
    return null;
  }

  if (isError) {
    return null;
  }

  if (data) {
    return (
      <div
        className="h-screen p-3 scroll-y overflow-y-scroll overflow-x-hidden min-w-[600px] w-[600px]"
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="text-2xl font-bold">{pageTitle}</div>
        <div
          ref={htmlPage}
          className="overflow-hidden"
          dangerouslySetInnerHTML={{ __html: data }}
        />
      </div>
    );
  }
}
