import * as React from "react";
import {Component} from "react";
import * as classnames from "classnames";
import "vis/dist/vis.min.css";
import {
    CfgUtil,
} from "../../pushdown-automaton";
import {CfgParseTree} from "./CfgParseTree";

export interface CfgParseTreeCollectionProps {
    readonly parseTrees : readonly CfgUtil.ParseTreeVariable[],
}
export interface CfgParseTreeCollectionState {
    readonly parseTrees : readonly CfgUtil.ParseTreeVariable[],
    readonly active : readonly number[],
}

export class CfgParseTreeCollection extends Component<CfgParseTreeCollectionProps, CfgParseTreeCollectionState> {
    private jsxCollection = new Map<number, JSX.Element>();

    public constructor (props : CfgParseTreeCollectionProps) {
        super(props);
        this.state = {
            parseTrees : props.parseTrees,
            active : [0],
        };
        this.jsxCollection = new Map<number, JSX.Element>();
    }
    public componentWillReceiveProps (newProps : CfgParseTreeCollectionProps) {
        this.setState({
            parseTrees : newProps.parseTrees,
            active : [0],
        });
        this.jsxCollection = new Map<number, JSX.Element>();
    }

    private renderCfgParseTree () {
        for (const index of this.state.active) {
            let jsx = this.jsxCollection.get(index);
            if (jsx == undefined && index < this.state.parseTrees.length) {
                jsx = (
                    <CfgParseTree
                        parseTree={this.state.parseTrees[index]}
                    />
                );
                this.jsxCollection.set(index, jsx);
            }
        }
        return this.state.parseTrees.map((_, index) => {
            return (
                <div
                    key={index}
                    style={{
                        display : (
                            this.state.active.includes(index) ?
                            "block" :
                            "none"
                        ),
                    }}
                >
                    Derivation {index}
                    {this.jsxCollection.get(index)}
                </div>
            );
        });
    }

    public render () {
        return (
            <div>
                <div
                >
                    {this.renderCfgParseTree()}
                </div>
                <div className="ui icon buttons">
                    {
                        this.state.parseTrees.map((_, index) => {
                            return (
                                <button
                                    className={classnames(
                                        "ui huge button",
                                        (
                                            this.state.active.includes(index) ?
                                            "active" :
                                            ""
                                        )
                                    )}
                                    key={index}
                                    onClick={() => {
                                        if (this.state.active.includes(index)) {
                                            this.setState({
                                                active : this.state.active.filter(
                                                    i => i != index
                                                ),
                                            });
                                        } else {
                                            this.setState({
                                                active : [...this.state.active, index],
                                            });
                                        }
                                    }}
                                >
                                    {index}
                                </button>
                            );
                        })
                    }
                </div>
                <br/>
                <br/>
            </div>
        );
    }
}
