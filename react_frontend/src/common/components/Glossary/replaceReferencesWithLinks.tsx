import React from "react";
import { GlossaryItem } from "./types";

// Takes a string definition and replaces any
// placeholder references with hyperlinks. Example:
// where
// definition = "Here is one link: [firstLink], and another: [secondLink]."
// and
// references = {
//  firstLink: { url: "https://www.example.com" },
//  secondLink: { url: "https://www.zombo.com", text: "with text" }
// }
// outputs
// [
//   "Here is one link: ",
//   <a href="https://www.example.com">https://www.example.com</a>,
//   ", and another: ",
//   <a href="https://www.zombo.com">with text</a>,
//   "."
// ]
export default function replaceReferencesWithLinks(
  definition: string,
  references?: GlossaryItem["references"]
): React.ReactNode[] {
  const placeholders = Object.keys(references || {});
  let parts = [definition];

  placeholders.forEach((placeholder) => {
    const nestedParts = parts.map((part) => {
      if (typeof part !== "string") {
        return part;
      }

      const search = `[${placeholder}]`;
      const index = part.indexOf(search);

      if (index === -1) {
        return part;
      }

      const { url } = references[placeholder];

      return [
        part.slice(0, index),
        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
          {references[placeholder].text || url}
        </a>,
        part.slice(index + search.length),
      ];
    });

    parts = [].concat(...nestedParts);
  });

  return parts;
}
