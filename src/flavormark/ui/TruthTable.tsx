import * as React from "react";
import {Component} from "react";
import * as math from "../math";
import {MathRenderer} from "./MathRenderer";
import {Button} from "./Button";

export interface TruthTableProps {
    rawExpressions : string[],
    contract : boolean,
}
export interface TruthTableState {
    contract : boolean,
    mathExpanded?   : string,
    mathContracted? : string,
    error? : string,
}
export class TruthTable extends Component<TruthTableProps, TruthTableState> {
    public constructor (props : TruthTableProps) {
        super(props);
        this.state = {
            contract : props.contract,
        };
        const state = this.onContractChange(props.contract, props.rawExpressions);
        this.state = state;
    }
    public static ToString (b : boolean|(boolean[])) {
        if (typeof b == "boolean") {
            return b ? "T" : "F";
        } else {
            let result = "";
            for (let i of b) {
                result += (i ? "1" : "0");
            }
            return `\\texttt{${result}}`;
        }
    }
    public static ProcessLabels (arr : string[]) : string[] {
        let result : string[] = [];
        for (let i of arr) {
            i = i
                .replace(/\~/g, "{\\raise.17ex\\hbox{$\\scriptstyle\\sim$}}")
                .replace(/\&/g, "\\texttt{ & }")
                .replace(/\|/g, "\\texttt{ | }")
                .replace(/\^/g, "\\texttt{ ^ }");
            result.push(i);
        }
        return result;
    }
    public static BuildTableString (rawExpressions : string[], contract : boolean) {
        const parser = new math.PropositionParser();
        const tokenizedExpressions = rawExpressions.map((raw) => {
            raw = raw.replace(/\\\|/g, "|");
            return math.PropositionTokenizer.tokenize(raw);
        });
        const expressions = tokenizedExpressions.map(parser.parse);

        let variableNames : string[] = tokenizedExpressions.reduce(
            (memo : string[], cur) => {
                const variables = cur.filter((c) => {
                    return c.type == "variable"
                }).map((c) => {
                    return c.value;
                })
                memo.push(...variables);
                return memo;
            },
            []
        );
        variableNames = [...new Set<string>(variableNames)];
        variableNames.sort();

        const inputsArr = math.permuteWithRepetition([true, false], variableNames.length);

        const rows : string[] = [];

        {
            const header = [...variableNames];
            const labelsArr = expressions.map((e) => {
                return math.PropositionParser.FlattenLabels(e, contract);
            });
            for (let labels of labelsArr) {
                header.push(" "); //Add a separator
                header.push(...TruthTable.ProcessLabels(labels));
            }

            //Create headers and delimiter line
            rows.push("{" + "c".repeat(header.length).split("").join(" | ") + "}");
            rows.push(header.join(" & ") + "\\\\");
            rows.push("\\hline");
        }

        const ordersArr = expressions.map((e) => {
            return math.PropositionParser.FlattenOrders(e, contract);
        });
        const highestOrderIndexArr = ordersArr.map((orders) => {
            let highest = -Infinity;
            let highestIndex = -1;
            for (let i=0; i<orders.length; ++i) {
                const o = orders[i];
                if (o > highest) {
                    highest = o;
                    highestIndex = i;
                }
            }
            return highestIndex;
        });

        let booleanExpressionCount = 0;
        let bitExpressionCount     = 0;
        let booleanVariables : string[]|undefined = undefined;
        let bitVariables     : string[]|undefined = undefined;

        for (let inputs of inputsArr) {
            const variables : { [v : string] : boolean|undefined, } = {};
            for (let i=0; i<variableNames.length; ++i) {
                variables[variableNames[i]] = inputs[i];
            }
            const evaluatedArr = expressions.map((e) => {
                return math.PropositionEvaluator.Evaluate(e, variables);
            });

            if (booleanVariables == undefined) {
                booleanVariables = [];
                for (let evaluated of evaluatedArr) {
                    if (typeof evaluated.value == "boolean" && evaluated.node.token.type != "variable") {
                        booleanVariables.push(...math.PropositionParser.GetUsedVariables(evaluated.node));
                        ++booleanExpressionCount;
                    }
                }
            }
            if (bitVariables == undefined) {
                bitVariables = [];
                for (let evaluated of evaluatedArr) {
                    if (evaluated.value instanceof Array && evaluated.node.token.type != "variable") {
                        bitVariables.push(...math.PropositionParser.GetUsedVariables(evaluated.node));
                        ++bitExpressionCount;
                    }
                }
            }

            const row : string[] = [];
            for (let i=0; i<inputs.length; ++i) {
                const input = inputs[i];
                const name  = variableNames[i];
                let isBoolean = booleanVariables.indexOf(name) >= 0;
                let isBit     = bitVariables.indexOf(name) >= 0;

                if (!isBoolean && !isBit) {
                    isBoolean = (booleanExpressionCount > 0);
                    isBit     = (bitExpressionCount > 0);
                }

                if (!isBoolean && !isBit) {
                    isBoolean = true; //Default to just boolean display
                }

                if (isBoolean && isBit) {
                    row.push(TruthTable.ToString(input) + "/" + TruthTable.ToString([input]));
                } else if (isBoolean) {
                    row.push(TruthTable.ToString(input));
                } else if (isBit) {
                    row.push(TruthTable.ToString([input]));
                }
            }

            const allEqual = evaluatedArr.every((evaluated) => {
                const myValue = (typeof evaluated.value == "boolean")?
                    [evaluated.value] : evaluated.value;
                const other = evaluatedArr[0].value;
                const otherValue = (typeof other == "boolean") ?
                    [other] : other;

                if (myValue.length != otherValue.length) {
                    return false;
                }
                for (let i=0; i<myValue.length; ++i) {
                    if (myValue[i] != otherValue[i]) {
                        return false;
                    }
                }
                return true;
            });

            const valuesArr = evaluatedArr.map((evaluated) => {
                return math.PropositionEvaluator.FlattenValues(evaluated, contract);
            });
            for (let valuesIndex=0; valuesIndex<valuesArr.length; ++valuesIndex) {
                const values = valuesArr[valuesIndex];
                row.push(" "); //Add a separator
                for (let vIndex=0; vIndex<values.length; ++vIndex) {
                    const v = values[vIndex];
                    let str = TruthTable.ToString(v);
                    if (evaluatedArr[valuesIndex].node.token.type == "variable" && typeof v == "boolean") {
                        let isBoolean = (booleanExpressionCount > 0);
                        let isBit     = (bitExpressionCount > 0);
                        if (!isBoolean && !isBit) {
                            isBoolean = true; //Default to just boolean display
                        }
                        if (isBoolean && isBit) {
                            str = (TruthTable.ToString(v) + "/" + TruthTable.ToString([v]));
                        } else if (isBoolean) {
                            str = (TruthTable.ToString(v));
                        } else if (isBit) {
                            str = (TruthTable.ToString([v]));
                        }
                    }
                    if (allEqual || highestOrderIndexArr[valuesIndex] != vIndex) {
                        row.push(str);
                    } else {
                        row.push(`\\colorbox{#ff6666}{\\(${str}\\)}`);
                    }
                }
            }
            rows.push(row.join(" & ") + "\\\\");
        }

        {
            const footer = [...variableNames.map(() => " ")];
            for (let ordersIndex=0; ordersIndex<ordersArr.length; ++ordersIndex) {
                let orders = ordersArr[ordersIndex];
                footer.push(" "); //Add a separator
                for (let oIndex=0; oIndex<orders.length; ++oIndex) {
                    const o = orders[oIndex];
                    let str = (o < 0) ? " " : o.toString();

                    if (highestOrderIndexArr[ordersIndex] == oIndex) {
                        if (o < 0) {
                            str = "1";
                        }
                        footer.push(`\\colorbox{yellow}{\\(${str}\\)}`);
                    } else {
                        footer.push(str);
                    }
                }
            }
            rows.push("\\hline");
            rows.push(footer.join(" & ") + "\\\\");
        }

        rows.unshift("\\begin{array}");
        rows.push("\\end{array}");

        return rows.join("\n");
    }
    private renderMath () {
        //TODO, remove using or operator as null coalesce, it is ugly
        return (
            <div>
                <MathRenderer style={{ display : (this.state.contract ? "block" : "none") }} math={this.state.mathContracted || "Building Table..."} block={false}/>
                <MathRenderer style={{ display : (this.state.contract ? "none" : "block") }} math={this.state.mathExpanded || "Building Table..."} block={false}/>
            </div>
        );
    }
    private onContractChange (newContract : boolean, rawExpressions : string[]) : Pick<TruthTableState, ("contract")>|Pick<TruthTableState, ("contract"|"mathContracted")>|Pick<TruthTableState, ("contract"|"mathExpanded")>|Pick<TruthTableState, ("contract"|"error")> {
        if (newContract) {
            if (this.state.mathContracted == undefined) {
                try {
                    const str = TruthTable.BuildTableString(rawExpressions, true);
                    return {
                        contract : newContract,
                        mathContracted : str,
                    };
                } catch (err) {
                    console.error(err);
                    return {
                        contract : newContract,
                        error : err.message,
                    };
                }
            } else {
                return {
                    contract : newContract,
                };
            }
        } else {
            if (this.state.mathExpanded == undefined) {
                try {
                    const str = TruthTable.BuildTableString(rawExpressions, false);
                    return {
                        contract : newContract,
                        mathExpanded : str,
                    };
                } catch (err) {
                    console.error(err);
                    return {
                        contract : newContract,
                        error : err.message,
                    };
                }
            } else {
                return {
                    contract : newContract,
                };
            }
        }
    }
    private toggleSize = () => {
        const newContract = !this.state.contract;
        this.setState(this.onContractChange(newContract, this.props.rawExpressions));
    };
    private renderError () {
        if (this.state.error == undefined) {
            return undefined;
        }
        return (
            <div className="ui negative message">
                {this.state.error}
            </div>
        );
    }
    public render () {
        return (
            <div style={{ marginBlockStart : "1em", marginBlockEnd : "1em" }}>
                {this.renderError()}
                {this.renderMath()}
                <Button onClick={this.toggleSize}>{this.state.contract ? "Expand" : "Contract"}</Button>
            </div>
        );
    }
}
