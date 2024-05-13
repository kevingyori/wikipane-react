import { useEffect, useRef } from "react";

export function DangerouslySetHtmlContent({
  html,
  dangerouslySetInnerHTML,
  allowRerender,
  divRef,
  ...rest
}) {
  // We remove 'dangerouslySetInnerHTML' from props passed to the div
  // const divRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!html || !divRef.current) throw new Error("html prop can't be null");
    if (!isFirstRender.current) return;
    isFirstRender.current = Boolean(allowRerender);

    const slotHtml = document.createRange().createContextualFragment(html); // Create a 'tiny' document and parse the html string
    console.log(
      "slotHtml",
      slotHtml,
      divRef.current,
      html,
      isFirstRender.current,
    );
    divRef.current.innerHTML = ""; // Clear the container
    divRef.current.appendChild(slotHtml); // Append the new content
  }, [html, divRef]);

  return createElement("div", { ...rest, ref: divRef });
}
