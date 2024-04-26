import * as fm from "flavormark";

import {ArgumentParser} from "./block/ArgumentParser";
import {TruthTableParser} from "./block/TruthTableParser";
import {DfaParser} from "./block/DfaParser";
import {NfaParser} from "./block/NfaParser";
import {RegularExpressionParser} from "./block/RegularExpressionParser";
import {CfgParser} from "./block/CfgParser";
import {NpdaParser} from "./block/NpdaParser";
import {OldStyleAtxHeadingParser} from "./block/OldStyleAtxHeadingParser";

import {TexSingleBackslashParser} from "./inline/TexSingleBackslashParser";
import {TooltipParser} from "./inline/TooltipParser";
import {RubyParser} from "./inline/RubyParser";

import {ReactRenderer} from "./render/ReactRenderer";
import {TestSubRenderer} from "./render/TestSubRenderer";
import {TextRenderer} from "./render/TextRenderer";
import {ParagraphRenderer, InlineParagraphRenderer} from "./render/ParagraphRenderer";
import {TexBlockRenderer} from "./render/TexBlockRenderer";
import {TexSpanRenderer} from "./render/TexSpanRenderer";
import {ItemRenderer} from "./render/ItemRenderer";
import {ListRenderer} from "./render/ListRenderer";
import {ThematicBreakRenderer} from "./render/ThematicBreakRenderer";
import {HeadingRenderer} from "./render/HeadingRenderer";
import {StrongRenderer} from "./render/StrongRenderer";
import {EmphasisRenderer} from "./render/EmphasisRenderer";
import {DocumentRenderer, InlineDocumentRenderer} from "./render/DocumentRenderer";
import {FencedCodeBlockRenderer} from "./render/FencedCodeBlockRenderer";
import {HtmlBlockRenderer} from "./render/HtmlBlockRenderer";
import {IndentedCodeBlockRenderer} from "./render/IndentedCodeBlockRenderer";
import {CodeSpanRenderer} from "./render/CodeSpanRenderer";
import {HardbreakRenderer} from "./render/HardbreakRenderer";
import {SoftbreakRenderer} from "./render/SoftbreakRenderer";

import {SuperscriptRenderer} from "./render/SuperscriptRenderer";
import {SubscriptRenderer} from "./render/SubscriptRenderer";

import {ImageRenderer} from "./render/ImageRenderer";
import {LinkRenderer} from "./render/LinkRenderer";


import {TableRenderer} from "./render/TableRenderer";
import {TbodyRenderer} from "./render/TbodyRenderer";
import {TdRenderer} from "./render/TdRenderer";
import {TheadRenderer} from "./render/TheadRenderer";
import {ThRenderer} from "./render/ThRenderer";
import {TrRenderer} from "./render/TrRenderer";

import {BlockquoteRenderer} from "./render/BlockquoteRenderer";
import {CheckboxRenderer} from "./render/CheckboxRenderer";
import {HtmlTagRenderer} from "./render/HtmlTagRenderer";

import {ArgumentRenderer} from "./render/ArgumentRenderer";
import {TruthTableRenderer} from "./render/TruthTableRenderer";
import {DfaRenderer} from "./render/DfaRenderer";
import {NfaRenderer} from "./render/NfaRenderer";
import {RegularExpressionRenderer} from "./render/RegularExpressionRenderer";
import {CfgRenderer} from "./render/CfgRenderer";
import {NpdaRenderer} from "./render/NpdaRenderer";
import {TooltipRenderer} from "./render/TooltipRenderer";
import {RubyRenderer} from "./render/RubyRenderer";

const tbodyParser = new fm.Gfm.Block.TbodyParser();
const tdParser = new fm.Gfm.Block.TdParser();
const theadParser = new fm.Gfm.Block.TheadParser();
const thParser = new fm.Gfm.Block.ThParser();
const trParser = new fm.Gfm.Block.TrParser();

export const renderer = new fm.HtmlRenderer([
    new fm.CommonMark.Block.BlockquoteHtmlRenderer(),
    new fm.CommonMark.Block.DocumentHtmlRenderer(),
    new fm.CommonMark.Block.FencedCodeBlockHtmlRenderer(),
    new fm.CommonMark.Block.HeadingHtmlRenderer(),
    new fm.CommonMark.Block.HtmlBlockHtmlRenderer(),
    new fm.CommonMark.Block.IndentedCodeBlockHtmlRenderer(),
    new fm.CommonMark.Block.ItemHtmlRenderer(),
    new fm.CommonMark.Block.ListHtmlRenderer(),
    new fm.CommonMark.Block.ParagraphHtmlRenderer(),
    new fm.CommonMark.Block.ThematicBreakHtmlRenderer(),
    new fm.CommonMark.Inline.CodeSpanHtmlRenderer(),
    new fm.CommonMark.Inline.EmphasisHtmlRenderer(),
    new fm.CommonMark.Inline.HardbreakHtmlRenderer(),
    new fm.CommonMark.Inline.HtmlTagHtmlRenderer(),
    new fm.CommonMark.Inline.ImageHtmlRenderer(),
    new fm.CommonMark.Inline.LinkHtmlRenderer(),
    new fm.CommonMark.Inline.SoftbreakHtmlRenderer(),
    new fm.CommonMark.Inline.StrongHtmlRenderer(),
    new fm.FlavorMark.Block.TexBlockHtmlRenderer(),
    new fm.FlavorMark.Inline.SubscriptHtmlRenderer(),
    new fm.FlavorMark.Inline.SuperscriptHtmlRenderer(),
    new fm.FlavorMark.Inline.TexSpanHtmlRenderer(),
    new fm.Gfm.Block.TableHtmlRenderer(),
    new fm.Gfm.Block.TbodyHtmlRenderer(),
    new fm.Gfm.Block.TdHtmlRenderer(),
    new fm.Gfm.Block.TheadHtmlRenderer(),
    new fm.Gfm.Block.ThHtmlRenderer(),
    new fm.Gfm.Block.TrHtmlRenderer(),
    new fm.Gfm.Inline.CheckboxHtmlRenderer(),
    new fm.Gfm.Inline.StrikethroughHtmlRenderer(),
    new fm.CommonMark.Inline.TextHtmlRenderer(),
]);

export const reactRenderer = new ReactRenderer([
    new ParagraphRenderer(),
    new TexBlockRenderer(),
    new ListRenderer(),
    new ItemRenderer(),
    new ThematicBreakRenderer(),
    new HeadingRenderer(),
    new DocumentRenderer(),
    new FencedCodeBlockRenderer(),
    new HtmlBlockRenderer(),
    new IndentedCodeBlockRenderer(),
    new BlockquoteRenderer(),

    new TableRenderer(),
    new TbodyRenderer(),
    new TdRenderer(),
    new TheadRenderer(),
    new ThRenderer(),
    new TrRenderer(),

    new TexSpanRenderer(),
    new TextRenderer(),
    new StrongRenderer(),
    new EmphasisRenderer(),
    new CodeSpanRenderer(),
    new SoftbreakRenderer(),
    new HardbreakRenderer(),

    new SubscriptRenderer(),
    new SuperscriptRenderer(),

    new LinkRenderer(),
    new ImageRenderer(),

    new CheckboxRenderer(),
    new HtmlTagRenderer(),

    new ArgumentRenderer(),
    new TruthTableRenderer(),
    new DfaRenderer(),
    new NfaRenderer(),
    new RegularExpressionRenderer(),
    new CfgRenderer(),
    new NpdaRenderer(),
    new TooltipRenderer(),
    new RubyRenderer(),

    new TestSubRenderer(),
]);

export const inlineReactRenderer = new ReactRenderer([
    new InlineParagraphRenderer(),
    new TexBlockRenderer(),
    new ListRenderer(),
    new ItemRenderer(),
    new ThematicBreakRenderer(),
    new HeadingRenderer(),
    new InlineDocumentRenderer(),
    new FencedCodeBlockRenderer(),
    new HtmlBlockRenderer(),
    new IndentedCodeBlockRenderer(),
    new BlockquoteRenderer(),

    new TableRenderer(),
    new TbodyRenderer(),
    new TdRenderer(),
    new TheadRenderer(),
    new ThRenderer(),
    new TrRenderer(),

    new TexSpanRenderer(),
    new TextRenderer(),
    new StrongRenderer(),
    new EmphasisRenderer(),
    new CodeSpanRenderer(),
    new SoftbreakRenderer(),
    new HardbreakRenderer(),

    new SubscriptRenderer(),
    new SuperscriptRenderer(),

    new LinkRenderer(),
    new ImageRenderer(),

    new CheckboxRenderer(),
    new HtmlTagRenderer(),

    new ArgumentRenderer(),
    new TruthTableRenderer(),
    new DfaRenderer(),
    new NfaRenderer(),
    new RegularExpressionRenderer(),
    new CfgRenderer(),
    new NpdaRenderer(),
    new TooltipRenderer(),
    new RubyRenderer(),

    new TestSubRenderer(),
]);


const refMap : fm.CommonMark.RefMap = {};

const listParser = new fm.CommonMark.Block.ListParser();

const blockParserCollection = new fm.BlockParserCollection(
    new fm.CommonMark.Block.DocumentParser(),
    new fm.CommonMark.Block.ParagraphParser([
        new fm.CommonMark.Block.LinkReferenceDefinitionParser(refMap)
    ])
)
    .add(new fm.CommonMark.Block.BlockquoteParser())
    .add(new fm.CommonMark.Block.AtxHeadingParser())
    .add(new OldStyleAtxHeadingParser())
    .add(new fm.CommonMark.Block.FencedCodeBlockParser())

    .add(new fm.CommonMark.Block.HtmlBlockParser())
    .add(new fm.CommonMark.Block.SetextHeadingParser())
    .add(new fm.CommonMark.Block.ThematicBreakParser())
    .add(new fm.CommonMark.Block.ItemParser(listParser))
    .add(new fm.CommonMark.Block.IndentedCodeBlockParser())

    .add(new fm.FlavorMark.Block.TexBlockParser())

    .add(new fm.Gfm.Block.TableParser({
        tbodyParser,
        tdParser,
        theadParser,
        thParser,
        trParser,
    }))
    .add(tbodyParser)
    .add(tdParser)
    .add(theadParser)
    .add(thParser)
    .add(trParser)
    .add(new ArgumentParser())

    .add(new TruthTableParser())

    .add(new DfaParser())
    .add(new NfaParser())
    .add(new RegularExpressionParser())
    .add(new CfgParser())
    .add(new NpdaParser())

    .add(listParser)
    .add(new fm.CommonMark.Block.TextParser());

const delimiters = new fm.DelimiterCollection();
const brackets = new fm.CommonMark.Inline.BracketCollection(delimiters);

const delimParser = new fm.DelimitedInlineParser(delimiters, [
    new fm.CommonMark.Inline.EmphasisParser(),
    new fm.FlavorMark.Inline.SubscriptParser(),
    new fm.FlavorMark.Inline.SuperscriptParser(),
]);
const inParsers : fm.InlineParser[] = [
    new TexSingleBackslashParser(),

    new fm.CommonMark.Inline.NewlineParser(),
    new fm.CommonMark.Inline.EscapeCharacterParser(),

    new TooltipParser(),
    new RubyParser(),

    new fm.FlavorMark.Inline.TexSpanParser(),

    new fm.Gfm.Inline.CheckboxParser(),

    new fm.CommonMark.Inline.CodeSpanParser(),
    delimParser,
    new fm.CommonMark.Inline.LinkStartParser(brackets),
    new fm.CommonMark.Inline.ImageStartParser(brackets),
    new fm.CommonMark.Inline.CloseBracketParser(delimParser, brackets, refMap),
    new fm.CommonMark.Inline.EmailAutolinkParser(),
    new fm.CommonMark.Inline.UriAutolinkParser(),
    new fm.CommonMark.Inline.HtmlTagParser(),
    new fm.CommonMark.Inline.EntityParser(),

    new fm.CommonMark.Inline.StringParser(),
];

export const parser = new fm.Parser({
    blockParsers : blockParserCollection,
    inlineContentParser : new fm.InlineContentParser({
        inlineParsers : inParsers
    })
});

export function parseAndRender (md : string) {
    return renderer.render(parser.parse(md));
}
export function parseAndRenderReact (md : string) {
    return reactRenderer.render(parser.parse(md));
}
export function parseAndRenderReactInline (md : string) {
    return inlineReactRenderer.render(parser.parse(md));
}
