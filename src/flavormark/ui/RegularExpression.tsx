import * as React from "react";
import {Component} from "react";
import {RegularExpressionUtil, RegularExpressionDeclaration, NfaUtil} from "../../finite-automaton";
import {Nfa} from "./Nfa";

export enum RegularExpressionDisplayType {
    Text,
    Markdown,
    Json,
    Nfa,
    Language10,
}

export interface RegularExpressionProps {
    regularExpression : RegularExpressionDeclaration,
}
export interface RegularExpressionState {
    regularExpression : RegularExpressionDeclaration,
    displayType : RegularExpressionDisplayType,
}

export class RegularExpression extends Component<RegularExpressionProps, RegularExpressionState> {
    private nfaJsx    : JSX.Element|undefined = undefined;
    private language10Jsx : JSX.Element|undefined = undefined;

    public constructor (props : RegularExpressionProps) {
        super(props);
        this.state = {
            regularExpression : props.regularExpression,
            displayType : RegularExpressionDisplayType.Text,
        };
        this.nfaJsx = undefined;
        this.language10Jsx = undefined;
    }
    public componentWillReceiveProps (newProps : RegularExpressionProps) {
        this.setState({
            regularExpression : newProps.regularExpression,
            displayType : RegularExpressionDisplayType.Text,
        });
        this.nfaJsx = undefined;
        this.language10Jsx = undefined;
    }

    private renderText () {
        const regularExpression = this.state.regularExpression;

        const lines : string[] = [];
        lines.push(RegularExpressionUtil.toString(regularExpression));

        return <div>{lines.join("\n")}</div>;
    }

    private renderMarkdown () {
        const regularExpression = this.state.regularExpression;

        const lines : string[] = [];
        lines.push(`|RegularExpression| ${regularExpression.name == undefined ? "" : regularExpression.name}`);
        lines.push(RegularExpressionUtil.toString(regularExpression));

        return <textarea
            rows={lines.length+2}
            style={{
                width : "100%",
            }}
        >{lines.join("\n")}</textarea>;
    }

    private renderJson () {
        const regularExpression = this.state.regularExpression;

        const json = JSON.stringify(regularExpression, null, 2);

        return <textarea
            rows={json.split("\n").length + 2}
            style={{
                width : "100%",
            }}
            value={json}
        ></textarea>;
    }

    private renderNfa (prune : boolean) {
        if (
            this.state.displayType == RegularExpressionDisplayType.Nfa &&
            this.nfaJsx == undefined
        ) {
            const regularExpression = this.state.regularExpression;
            let i = 0;
            let nfa = NfaUtil.fromRegularExpression(
                regularExpression,
                () => `q${++i}`
            );
            if (prune) {
                nfa = NfaUtil.removeInvalidTransitions(nfa);
            }

            this.nfaJsx = <Nfa nfa={nfa}/>;
        }

        return this.nfaJsx;
    }

    private renderLanguage10 () {
        if (
            this.state.displayType == RegularExpressionDisplayType.Language10 &&
            this.language10Jsx == undefined
        ) {
            const regularExpression = this.state.regularExpression;
            const language10 = RegularExpressionUtil.generateLanguage({
                regularExpression,
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

    public render () {
        return (
            <div>
                <div
                    style={{
                        display : (
                            this.state.displayType == RegularExpressionDisplayType.Text ?
                            "block" :
                            "none"
                        ),
                        width : "100%",
                        border : "2px solid #000000"
                    }}
                >
                    {this.renderText()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == RegularExpressionDisplayType.Markdown ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderMarkdown()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == RegularExpressionDisplayType.Json ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderJson()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == RegularExpressionDisplayType.Nfa ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderNfa(true)}
                </div>
                <div
                    style={{
                        display : this.state.displayType == RegularExpressionDisplayType.Language10 ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderLanguage10()}
                </div>
                <div className="ui icon buttons">
                    <select className="ui huge button" onChange={(e) => {
                        this.setState({
                            displayType : parseInt(e.target.value, 10),
                        });
                    }}>
                        <option value={RegularExpressionDisplayType.Text}>Text</option>
                        <option value={RegularExpressionDisplayType.Markdown}>Markdown</option>
                        <option value={RegularExpressionDisplayType.Json}>Json</option>
                        <option value={RegularExpressionDisplayType.Nfa}>Nfa</option>
                        <option value={RegularExpressionDisplayType.Language10}>Language10</option>
                    </select>
                </div>
                <br/>
                <br/>
            </div>
        );
    }
}
