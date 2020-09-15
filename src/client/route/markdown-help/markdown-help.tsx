import * as React from "react";
import {parseAndRenderReact, ui} from "../../../flavormark";

declare const require : {
    (path : string) : { default : string },
    context : (path : string, bool : boolean, regExp : RegExp) => {
        keys : () => {
            forEach : (
                callback : (key : string) => void
            ) => void
        },
        (path : string) : { default : string }
    }
};

const markdownTextCollection = require.context("!raw-loader!./md", true, /\.md$/);

const keys = [
    "paragraph.md",

    "thematic-break.md",

    "atx-style-heading.md",
    "setext-style-heading.md",

    "emphasis.md",
    "superscript.md",
    "subscript.md",

    //URLs
    "link.md",
    "image.md",
    "uri-autolink.md",

    "lists-ordered.md",
    "lists-unordered.md",
    "lists-nested.md",
    "checkbox.md",

    //Misc
    "tooltip.md",
    "escape.md",
    "entity.md",
    "blockquote.md",

    //Math
    "tex-span.md",
    "tex-block.md",

    //Table-like
    "table.md",
    "argument.md",
    "truth-table.md",
    "dfa.md",
    "nfa.md",

    //Code
    "fenced-code-block.md",
    "code-span.md",
    "indented-code-block.md",

    "html-block.md",
];

export function MarkdownHelp () {
    const arr : React.ReactNode[] = [];

    for (const key of keys) {
        const markdownText = markdownTextCollection(`./${key}`).default;
        arr.push(
            <React.Fragment key={key}>
                <div className="ui stackable grid">
                    <div className="eight wide column">
                        {parseAndRenderReact(markdownText)}
                    </div>
                    <div className="eight wide column">
                        <ui.CodeBlock code={markdownText} language="nohighlight"/>
                    </div>
                </div>
                <hr/>
            </React.Fragment>
        );
    }
    return (
        <div className="ui main container">
            {arr}
        </div>
    );
}
