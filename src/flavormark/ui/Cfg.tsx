import * as React from "react";
import {Component} from "react";
import {MathRenderer} from "./MathRenderer";
import "vis/dist/vis.min.css";
import {CfgUtil, CfgDeclaration, CfgSubstringType} from "../../pushdown-automaton";
import {CfgParseTreeCollection} from "./CfgParseTreeCollection";

export enum CfgDisplayType {
    Formal,
    Markdown,
    Json,
    Language10,
    TokenLanguage10,
    LeftmostParseTree,
}

export interface CfgProps {
    cfg : CfgDeclaration,
}
export interface CfgState {
    cfg : CfgDeclaration,
    displayType : CfgDisplayType,
    inputStr : string,
    parseTreesJsx : JSX.Element|undefined,
}

export class Cfg extends Component<CfgProps, CfgState> {
    private formalJsx : JSX.Element|undefined = undefined;
    private language10Jsx : JSX.Element|undefined = undefined;
    private tokenLanguage10Jsx : JSX.Element|undefined = undefined;

    public constructor (props : CfgProps) {
        super(props);
        this.state = {
            cfg : props.cfg,
            displayType : CfgDisplayType.Formal,
            inputStr : "",
            parseTreesJsx : undefined,
        };
        this.formalJsx = undefined;
        this.language10Jsx = undefined;
        this.tokenLanguage10Jsx = undefined;
    }
    public componentWillReceiveProps (newProps : CfgProps) {
        this.setState({
            cfg : newProps.cfg,
            displayType : CfgDisplayType.Formal,
            inputStr : "",
            parseTreesJsx : undefined,
        });
        this.formalJsx = undefined;
        this.language10Jsx = undefined;
        this.tokenLanguage10Jsx = undefined;
    }

    private renderFormal () {
        const {
            name,
            rules,
        } = this.state.cfg;

        if (
            this.state.displayType == CfgDisplayType.Formal &&
            this.formalJsx == undefined
        ) {
            const lines : string[] = [];
            lines.push(`\\begin{array}{ l l }`);

            for (const rule of rules) {
                const str = rule.strings
                    .map(string => {
                        return string
                            .map(subStr => {
                                if (subStr.subStringType == CfgSubstringType.Terminal) {
                                    if (subStr.value == "") {
                                        return `\\varepsilon`;
                                    } else {
                                        return `\\texttt{${subStr.value}}`;
                                    }
                                } else {
                                    return subStr.identifier;
                                }
                            })
                            .join("\\,");
                    })
                    .join("\\,|\\,");

                lines.push(`${rule.variable} & \\rightarrow ${str}`);
            }

            lines.push(`\\end{array}`);

            this.formalJsx = (
                <div>
                    {
                        name == undefined || name.length == 0 ?
                        "" :
                        `${name} =`
                    }
                    <MathRenderer
                        math={lines.join("\\\\")}
                        block={true}
                    />
                </div>
            );
        }
        return this.formalJsx;
    }

    private renderMarkdown () {
        const {
            name,
            rules,
        } = this.state.cfg;

        const lines : string[] = [];
        lines.push(`|Cfg| ${name}`);

        for (const rule of rules) {
            const str = rule.strings
                .map(string => {
                    return string
                        .map(subStr => {
                            if (subStr.subStringType == CfgSubstringType.Terminal) {
                                return JSON.stringify(subStr.value);
                            } else {
                                return subStr.identifier;
                            }
                        })
                        .join(" ");
                })
                .join(" | ");

            lines.push(`${rule.variable} -> ${str}`);
        }

        return <textarea
            rows={lines.length+2}
            style={{
                width : "100%",
            }}
        >{lines.join("\n")}</textarea>;
    }

    private renderJson () {
        const cfg = this.state.cfg;

        const json = JSON.stringify(cfg, null, 2);

        return <textarea
            rows={json.split("\n").length + 2}
            style={{
                width : "100%",
            }}
            value={json}
        ></textarea>;
    }

    private renderLanguage10 () {
        if (
            this.state.displayType == CfgDisplayType.Language10 &&
            this.language10Jsx == undefined
        ) {
            const cfg = this.state.cfg;
            const language10 = CfgUtil.generateLanguage({
                cfg,
                maxLength : 10,
            });

            this.language10Jsx = <textarea
                rows={Math.floor(language10.size / 7)+2}
                style={{
                    width : "100%",
                }}
                value={[...language10].map(s => JSON.stringify(s)).join(", ")}
            />;
        }

        return this.language10Jsx;
    }

    private renderTokenLanguage10 () {
        if (
            this.state.displayType == CfgDisplayType.TokenLanguage10 &&
            this.tokenLanguage10Jsx == undefined
        ) {
            const cfg = this.state.cfg;
            const tokenLanguage10 = CfgUtil.generateTokenLanguage({
                cfg,
                maxLength : 10,
            });

            this.tokenLanguage10Jsx = <textarea
                rows={Math.min(20, tokenLanguage10.length+2)}
                style={{
                    width : "100%",
                }}
                value={tokenLanguage10.map(s => JSON.stringify(s)).join(",\n")}
            />;
        }

        return this.tokenLanguage10Jsx;
    }

    private renderLeftmostParseTrees () {
        return (
            <div>
                {this.state.parseTreesJsx}
                <input
                    type="text"
                    value={this.state.inputStr}
                    onChange={(e) => {
                        const newInputStr = e.target.value;
                        this.setState({
                            inputStr : newInputStr,
                        });
                        setTimeout(() => {
                            if (newInputStr != this.state.inputStr) {
                                return;
                            }
                            const parseTrees = CfgUtil.tryFindLeftmostParseTrees({
                                cfg : this.state.cfg,
                                inputStr : this.state.inputStr,
                            });

                            this.setState({
                                parseTreesJsx : (
                                    <CfgParseTreeCollection
                                        key={newInputStr}
                                        parseTrees={parseTrees.map(parseTree => parseTree.parseTree)}
                                    />
                                ),
                            });

                        }, 1000);
                    }}
                />
            </div>
        );
    }

    public render () {
        return (
            <div>
                <div
                    style={{
                        display : this.state.displayType == CfgDisplayType.Formal ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderFormal()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == CfgDisplayType.Markdown ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderMarkdown()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == CfgDisplayType.Json ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderJson()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == CfgDisplayType.Language10 ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderLanguage10()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == CfgDisplayType.TokenLanguage10 ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderTokenLanguage10()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == CfgDisplayType.LeftmostParseTree ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderLeftmostParseTrees()}
                </div>
                <div className="ui icon buttons">
                    <select className="ui huge button" onChange={(e) => {
                        this.setState({
                            displayType : parseInt(e.target.value, 10),
                        });
                    }}>
                        <option value={CfgDisplayType.Formal}>Formal</option>
                        <option value={CfgDisplayType.Markdown}>Markdown</option>
                        <option value={CfgDisplayType.Json}>Json</option>
                        <option value={CfgDisplayType.Language10}>Language10</option>
                        <option value={CfgDisplayType.TokenLanguage10}>TokenLanguage10</option>
                        <option value={CfgDisplayType.LeftmostParseTree}>Leftmost Parse Tree</option>
                    </select>
                </div>
                <br/>
                <br/>
            </div>
        );
    }
}
