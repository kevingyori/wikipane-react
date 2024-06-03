import { SetURLSearchParams } from "react-router-dom";
import { WikiPage } from "./WikiPage";
import { Globe } from "lucide-react";

export function WikiContent({
  html,
  isPending,
  isError,
  title,
  searchParams,
  setSearchParams,
  pageTitle,
}: {
  html: Document;
  isPending: boolean;
  isError: boolean;
  title: string;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  pageTitle: string;
}) {
  return (
    <div className="scroll-y h-[calc(100vh-20px)] w-[650px] min-w-[650px] overflow-x-hidden overflow-y-scroll py-3 pr-3 scrollbar-thin">
      {isPending && (
        <>
          <div className="text-2xl font-bold">{title}</div>
          <Globe className="mx-auto mt-8 w-6 animate-spin" />
        </>
      )}
      {isError && <div>Error</div>}
      {isPending || isError ? null : (
        <>
          <WikiPage
            body={html?.querySelector("body")}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            pageTitle={pageTitle}
          />
        </>
      )}
    </div>
  );
}
