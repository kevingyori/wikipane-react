import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Command } from "cmdk";
import "../cmdk.scss";

function fetchSearchResults(query: string) {
  const url = `https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&format=json&search=${query}&namespace=0&limit=5&formatversion=2`;
  if (query.length < 3) return { data: [], isPending: false, isError: false };
  return fetch(url).then((res) => res.json());
}

function useSearchQuery(searchQuery: string, debounce = 500) {
  const debouncedSearchQuery = useDebounce(searchQuery, debounce);
  return useQuery({
    queryKey: ["search", debouncedSearchQuery],
    queryFn: () => fetchSearchResults(debouncedSearchQuery),
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function Search({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [query, setQuery] = useState("");
  const [, setSearchParams] = useSearchParams();
  const { data, isPending, isError } = useSearchQuery(query, 200);
  const [title, setTitle] = useState("");

  function handleNavigateToPage(title: string) {
    setSearchParams((prev) => {
      prev.append("wikiPage", title);
      return prev;
    });
  }

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open: boolean) => !open);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        console.log("enter", query);
        handleNavigateToPage(title);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [query, title, handleNavigateToPage, setOpen]);

  return (
    <Command.Dialog
      value={title}
      onValueChange={setTitle}
      open={open}
      label="Search Wikipedia"
      onOpenChange={setOpen}
      className="linear shadow w-3/6 opacity-100 fixed top-[25%] left-[25%] -translate-y-1/2 translate-x--1/2 z-50 bg-white border border-gray-200 rounded-md overflow-hidden"
    >
      {/* <Command.Dialog open={open} onOpenChange={setOpen}> */}
      <Command.Input
        placeholder="Search Wikpedia"
        onValueChange={setQuery}
        value={query}
      />

      <Command.List>
        {isPending && <Command.Loading>Hang on…</Command.Loading>}

        <Command.Empty>No results found.</Command.Empty>
        <Command.Separator />

        {!isPending && !isError && data[1]
          ? data[1].map((result: string, i: number) => (
              <Command.Item
                key={result}
                value={data[3][i].substring(data[3][i].lastIndexOf("/") + 1)}
                onClick={() => {
                  const title = data[3][i].substring(
                    data[3][i].lastIndexOf("/") + 1,
                  );
                  handleNavigateToPage(title);
                }}
              >
                {result}
              </Command.Item>
            ))
          : null}
      </Command.List>
    </Command.Dialog>
  );
}
