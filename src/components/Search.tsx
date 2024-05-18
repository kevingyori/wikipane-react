import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { Command } from "cmdk";
import "../cmdk.scss";
import { createPortal } from "react-dom";

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

export function Search({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [query, setQuery] = useState("");
  const [, setSearchParams] = useSearchParams();
  const { data, isPending, isError } = useSearchQuery(query);
  const [title, setTitle] = useState("");
  const [searchParams] = useSearchParams();
  const isEmptyPage = searchParams.getAll("wikiPage").length === 0;
  const inputRef = useRef<HTMLInputElement>(null);

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
      if (e.key === "Escape") {
        setOpen(false);
      }
      if (open || isEmptyPage) {
        if (e.key === "Enter") {
          // TODO: handle empty search
          e.preventDefault();
          setOpen(false);
          setQuery("");
          handleNavigateToPage(title);
        }
      }
    },
    [title, handleNavigateToPage, setOpen, open, isEmptyPage],
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

  useEffect(() => {
    if (open || isEmptyPage) {
      inputRef.current?.focus();
    }
  }, [open, isEmptyPage]);

  return (
    <>
      {createPortal(
        <Command
          value={title}
          onValueChange={setTitle}
          aria-hidden={!(open || isEmptyPage)}
          style={{
            visibility: open || isEmptyPage ? "visible" : "hidden",
          }}
          label="Search Wikipedia"
          className="linear shadow w-[32rem] max-w-lg fixed top-[35%] left-[50%] -translate-y-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-md overflow-hidden"
        >
          <Command.Input
            placeholder="Search Wikpedia"
            onValueChange={setQuery}
            value={query}
            ref={inputRef}
          />

          <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            <Command.Separator />
            {searchResults}
          </Command.List>
        </Command>,
        document.body,
      )}
    </>
  );
}
