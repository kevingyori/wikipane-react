import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { ChangeEventHandler, useState } from "react";
import { useSearchParams } from "react-router-dom";

function fetchSearchResults(query: string) {
  const url = `https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&format=json&search=${query}&namespace=0&limit=10&formatversion=2`;
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

export function Search() {
  const [query, setQuery] = useState("");
  const [, setSearchParams] = useSearchParams();
  const { data, isPending, isError } = useSearchQuery(query, 200);
  const handleSearch: ChangeEventHandler<HTMLInputElement> = (e) => {
    setQuery(e.currentTarget.value);
  };

  return (
    <div>
      <input
        type="text"
        name="Search"
        placeholder="Search"
        value={query}
        onChange={handleSearch}
      />
      <label htmlFor="search">Search</label>
      <ul>
        {!isPending && !isError && data[1]
          ? data[1].map((result: string, i: number) => (
              <li key={result}>
                <a
                  className="text-blue-500 hover:underline hover:cursor-pointer"
                  onClick={() => {
                    const title = data[3][i].substring(
                      data[3][i].lastIndexOf("/") + 1,
                    );
                    setSearchParams({ wikiPage: title });
                  }}
                >
                  {result}
                </a>
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}
