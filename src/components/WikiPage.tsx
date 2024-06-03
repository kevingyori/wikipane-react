import React, { memo, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { transformCss } from "../utils/transformCss";
import "../wikipedia.css";

export const WikiPage = memo(function WikiPage({
  html,
  pageTitle,
}: {
  html: Document;
  pageTitle: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const styleLinks = useCallback(
    (linkTitle: string) => {
      return searchParams.get("page")?.split(",").includes(linkTitle)
        ? "bg-blue-200"
        : "";
    },
    [searchParams],
  );

  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, title: string | null) => {
      if (title !== null) {
        e.preventDefault();
        setSearchParams((prev) => {
          const wikiPages = prev.get("page")?.split(",") || [];
          if (!wikiPages.includes(title)) {
            wikiPages.push(title);
            prev.set("page", wikiPages.join(","));
          }
          return prev;
        });
      }
    },
    [setSearchParams],
  );

  const voidElements = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  const isWhitespaceTextNode = (node: ChildNode) => {
    return (
      node.nodeType === Node.TEXT_NODE && !/\S/.test(node.textContent || "")
    );
  };

  const transformNodeToElement = useCallback(
    (node: ChildNode, index: number): React.ReactNode => {
      if (isWhitespaceTextNode(node)) {
        return null;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }

      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      const children = Array.from(element.childNodes).map((child, idx) =>
        transformNodeToElement(child, idx),
      );

      if (
        tagName === "link" ||
        tagName === "style" ||
        tagName === "script" ||
        tagName === "meta"
      ) {
        return null;
      }

      const typeOf = element.getAttribute("typeof") || null;
      const className = element.getAttribute("class") || null;
      const style = element.getAttribute("style") || null;
      const colspan = element.getAttribute("colspan") || null;
      const src = element.getAttribute("src") || null;

      if (tagName === "a") {
        const title = element.getAttribute("title");
        if (element.getAttribute("rel") !== "mw:WikiLink") {
          return (
            <Link
              key={`${tagName}-${index}`}
              className={"non-wiki-link" + className}
              title={null}
              handleLinkClick={(e) => e.preventDefault()}
            >
              {children}
            </Link>
          );
        }

        return (
          <Link
            key={`${tagName}-${index}`}
            className={styleLinks(title || "") + " " + className}
            title={title}
            handleLinkClick={handleLinkClick}
          >
            {" "}
            {children}{" "}
          </Link>
        );
      }

      const props = {
        key: `${tagName}-${index}`,
        src,
        className,
        typeOf,
        style: transformCss(style ?? ""),
        colspan,
      };

      if (voidElements.has(tagName)) {
        return React.createElement(tagName, props);
      }

      return React.createElement(tagName, props, children);
    },
    [handleLinkClick, styleLinks, voidElements],
  );

  const renderedBody = useMemo(() => {
    if (!html) return null;

    return Array.from(html.body.childNodes).map((node, index) =>
      transformNodeToElement(node, index),
    );
  }, [html, transformNodeToElement]);

  return (
    <>
      <h2
        className="text-2xl font-bold"
        dangerouslySetInnerHTML={{ __html: pageTitle }}
      />
      <div className="fade-in overflow-hidden">{renderedBody}</div>
    </>
  );
});

function Link({
  className,
  children,
  title,
  handleLinkClick,
}: {
  className: string;
  handleLinkClick: (
    e: React.MouseEvent<HTMLAnchorElement>,
    title: string | null,
  ) => void;
  children: React.ReactNode;
  title: string | null;
}) {
  return (
    <a
      className={className}
      href="#"
      onClick={(e) => handleLinkClick(e, title)}
    >
      {children}
    </a>
  );
}
