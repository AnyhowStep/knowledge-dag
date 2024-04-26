import * as fm from "flavormark";
import {RubyNode} from "./RubyNode";

export class RubyParser extends fm.InlineParser {
    public parse (parser : fm.InlineContentParser, node : fm.Node) : boolean {
        const c = parser.peek();
        const startPos = parser.pos;
        if (c != "[") {
            return false;
        }
        //Need to match square brackets
        let nestLevel = 1;
        ++parser.pos;
        while (parser.hasCharacters() && nestLevel > 0) {
            const c = parser.peek();
            if (c == "[") {
                ++nestLevel;
            } else if (c == "]") {
                --nestLevel;
            }

            ++parser.pos;
        }
        const base = parser.subject.slice(startPos+1, parser.pos-1);
        //Look for curly brace next
        {
            const c = parser.peek();
            if (c != "{") {
                parser.pos = startPos;
                return false;
            }
        }
        const rawContent = parser.match(/^\{(.*?[^\\])\}/);
        if (rawContent == undefined) {
            parser.pos = startPos;
            return false;
        }
        const text = rawContent.slice(1, rawContent.length-1);

        console.log(base, text);

        const ruby = new RubyNode();
        ruby.base = base;
        ruby.text = text;
        node.appendChild(ruby);
        return true;
    }
    public reinitForDocument () {
    }
}
