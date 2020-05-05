import * as fm from "flavormark";
import {TooltipNode} from "./TooltipNode";

export class TooltipParser extends fm.InlineParser {
    private num = 1;
    public parse (parser : fm.InlineContentParser, node : fm.Node) : boolean {
        const c = parser.peek();
        if (c != "[") {
            return false;
        }
        const rawTooltip = parser.match(/^\[\^\]\(.*?[^\\]\)/);
        if (rawTooltip == undefined) {
            return false;
        }
        const tooltipString = rawTooltip
            .substring(4, rawTooltip.length-1)
            .trim()
            .replace(/\\\)/g, ")");

        const tooltip = new TooltipNode();
        tooltip.content = tooltipString;
        tooltip.num     = this.num;
        ++this.num;
        node.appendChild(tooltip);
        return true;
    }
    public reinitForDocument () {
        this.num = 1;
    }
}
