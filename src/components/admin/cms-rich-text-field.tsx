"use client";

import { useState } from "react";
import { RichTextEditor } from "./rich-text-editor";

/** Hidden input + TipTap for CMS server actions (`name="content"`). */
export function CmsRichTextField({
  name,
  defaultHtml,
  "aria-labelledby": ariaLabelledby,
}: {
  name: string;
  defaultHtml: string;
  /** Associate with the visible label for accessibility. */
  "aria-labelledby"?: string;
}) {
  const [html, setHtml] = useState(defaultHtml);

  return (
    <>
      <input type="hidden" name={name} value={html} />
      <RichTextEditor
        value={html}
        onChange={setHtml}
        aria-labelledby={ariaLabelledby}
      />
    </>
  );
}
