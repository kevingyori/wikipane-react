import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { Command } from "cmdk";
import "../cmdk.scss";

function fetchSearchResults(query: string) {
  if (query.length < 3) return { data: [], isPending: false, isError: false };
  const url = `https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&format=json&search=${encodeURIComponent(query)}&namespace=0&limit=6&formatversion=2`;
  return fetch(url).then((res) => res.json());
}

function useSearchQuery(searchQuery: string) {
  const debouncedSearchQuery = useDebounce(searchQuery, 200);
  const queryKey = useMemo(
    () => ["search", debouncedSearchQuery],
    [debouncedSearchQuery],
  );

  return useQuery({
    queryKey: queryKey,
    queryFn: () => fetchSearchResults(debouncedSearchQuery),
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: debouncedSearchQuery.length >= 3,
  });
}

export function Search() {
  const [query, setQuery] = useState("");
  const [, setSearchParams] = useSearchParams();
  const { data, isPending, isError } = useSearchQuery(query);
  const [title, setTitle] = useState("");
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.getAll("wikiPage").length === 0) {
      setOpen(true);
    }
  }, [searchParams]);

  const handleNavigateToPage = useCallback(
    (title: string) => {
      setSearchParams((prev) => {
        prev.append("wikiPage", title);
        return prev;
      });
    },
    [setSearchParams],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        setOpen(false);
        setQuery("");
        handleNavigateToPage(title);
      }
    },
    [title, handleNavigateToPage, setOpen],
  );

  const searchResults = useMemo(() => {
    return !isPending && !isError && data[1]
      ? data[1].map((result: string, i: number) => (
          <>
            <Command.Item
              key={result}
              onClick={() => {
                const title = data[3][i].substring(
                  data[3][i].lastIndexOf("/") + 1,
                );
                handleNavigateToPage(title);
              }}
            >
              {result}
            </Command.Item>
          </>
        ))
      : null;
  }, [data, isPending, isError, handleNavigateToPage]);

  useLayoutEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <Command.Dialog
        value={title}
        onValueChange={setTitle}
        open={open}
        label="Search Wikipedia"
        onOpenChange={setOpen}
        className="linear shadow w-3/6 opacity-100 fixed top-[25%] left-[25%] -translate-y-1/2 translate-x--1/2 z-50 bg-white border border-gray-200 rounded-md overflow-hidden"
      >
        <Command.Input
          placeholder="Search Wikpedia"
          onValueChange={setQuery}
          value={query}
        />

        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          <Command.Separator />
          {searchResults}
        </Command.List>
      </Command.Dialog>
    </>
  );
}
