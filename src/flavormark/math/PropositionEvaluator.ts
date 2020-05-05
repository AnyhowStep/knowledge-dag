import {PropositionNode} from "./PropositionParser";
import {isBooleanOp, isBinaryOp, isValue} from "./PropositionTokenizer";

export interface PropositionValue {
    node   : PropositionNode,
    value  : boolean|(boolean[]),
    left?  : PropositionValue,
    right? : PropositionValue,
}
export type EvaluateBinaryArgs = {
    left  : boolean[],
    right : boolean[],
};
function toBitString (str : string) : boolean[] {
    const result : boolean[] = [];
    for (let c of str) {
        result.push(c == "1");
    }
    return result;
}
function padLeft (arr : boolean[], length : number) : void {
    while (arr.length < length) {
        arr.unshift(false);
    }
}
export class PropositionEvaluator {
    public static EvaluateBinary (node : PropositionNode, variables : { [v : string] : boolean|undefined, }, evaluate : (args : EvaluateBinaryArgs) => boolean[]) : PropositionValue {
        if (node.left == undefined) {
            throw new Error(`Expected an expression to left of '${node.token.type}' at position ${node.token.position}`);
        }
        if (node.right == undefined) {
            throw new Error(`Expected an expression to right of '${node.token.type}' at position ${node.token.position}`);
        }
        const left  = PropositionEvaluator.Evaluate(node.left, variables);
        const right = PropositionEvaluator.Evaluate(node.right, variables);

        if (isBooleanOp(node.token) && typeof left.value  == "boolean" && typeof right.value == "boolean") {
            let result = evaluate({
                left  : [left.value],
                right : [right.value],
            })

            return {
                node  : node,
                value : result[0],
                left  : left,
                right : right,
            };
        } else {
            const leftBitString  = (typeof left.value == "boolean") ?
                [left.value] : left.value;
            const rightBitString = (typeof right.value == "boolean") ?
                [right.value] : right.value;
            const length = Math.max(leftBitString.length, rightBitString.length);
            padLeft(leftBitString, length);
            padLeft(rightBitString, length);

            return {
                node  : node,
                value : evaluate({
                    left  : leftBitString,
                    right : rightBitString,
                }),
                left  : left,
                right : right,
            };
        }
    }
    public static Evaluate (node : PropositionNode, variables : { [v : string] : boolean|undefined, }) : PropositionValue {
        switch (node.token.type) {
            case "true": {
                return {
                    node  : node,
                    value : true,
                };
            }
            case "false": {
                return {
                    node  : node,
                    value : false,
                };
            }
            case "variable": {
                const value = variables[node.token.value];
                if (value == undefined) {
                    throw new Error(`Expected a value for variable '${node.token.value}' at position ${node.token.position}`);
                }
                return {
                    node  : node,
                    value : value,
                };
            }
            case "bit-string": {
                return {
                    node  : node,
                    value : toBitString(node.token.value),
                };
            }
            case "open-parentheses": {
                if (node.right == undefined) {
                    throw new Error(`Expected an expression in open parentheses at position ${node.token.position}`);
                }
                const right = PropositionEvaluator.Evaluate(node.right, variables);
                return {
                    node  : node,
                    value : right.value,
                    right : right,
                }
            }
            case "close-parentheses": {
                //Not meant to be part of anything
                return {
                    node  : node,
                    value : false,
                };
            }
            case "not": {
                if (node.right == undefined) {
                    throw new Error(`Expected an expression to negate at position ${node.token.position}`);
                }
                const right = PropositionEvaluator.Evaluate(node.right, variables);
                if (isBooleanOp(node.token) && typeof right.value == "boolean") {
                    return {
                        node  : node,
                        value : !right.value,
                        right : right,
                    };
                } else {
                    const arr = (typeof right.value == "boolean") ?
                        [right.value] : right.value;
                    const result : boolean[] = [];
                    for (let i of arr) {
                        result.push(!i);
                    }
                    return {
                        node  : node,
                        value : result,
                        right : right,
                    };
                }
            }
            case "and": {
                return PropositionEvaluator.EvaluateBinary(node, variables, (args) => {
                    let result : boolean[] = [];
                    for (let i=0; i<args.left.length; ++i) {
                        result.push(args.left[i] && args.right[i]);
                    }
                    return result;
                });
            }
            case "or": {
                return PropositionEvaluator.EvaluateBinary(node, variables, (args) => {
                    let result : boolean[] = [];
                    for (let i=0; i<args.left.length; ++i) {
                        result.push(args.left[i] || args.right[i]);
                    }
                    return result;
                });
            }
            case "conditional": {
                return PropositionEvaluator.EvaluateBinary(node, variables, (args) => {
                    let result : boolean[] = [];
                    for (let i=0; i<args.left.length; ++i) {
                        result.push(!args.left[i] || args.right[i]);
                    }
                    return result;
                });
            }
            case "biconditional": {
                return PropositionEvaluator.EvaluateBinary(node, variables, (args) => {
                    let result : boolean[] = [];
                    for (let i=0; i<args.left.length; ++i) {
                        result.push(args.left[i] == args.right[i]);
                    }
                    return result;
                });
            }
            case "xor": {
                return PropositionEvaluator.EvaluateBinary(node, variables, (args) => {
                    let result : boolean[] = [];
                    for (let i=0; i<args.left.length; ++i) {
                        result.push(args.left[i] != args.right[i]);
                    }
                    return result;
                });
            }
            default: {
                throw new Error(`Unknown '${node.token.type}', '${node.token.value}', at position ${node.token.position}`);
            }
        }
    }

    public static FlattenValues (v : PropositionValue|undefined, contract : boolean) : (boolean|(boolean[]))[] {
        if (v == undefined || v.node.token.type == "close-parentheses") {
            return [];
        }

        if (isValue(v.node.token)) {
            return [v.value];
        }

        //We want to flatten from this: (, a, \wedge, b, )
        //To this: (a, \wedge, b)
        //So, we render the parentheses in a special way
        if (v.node.token.type == "open-parentheses") {
            const right = PropositionEvaluator.FlattenValues(v.right, contract);
            return right;
        }

        if (v.node.token.type == "not") {
            if (v.node.right != undefined && isValue(v.node.right.token) && contract) {
                return [v.value];
            } else {
                const right = PropositionEvaluator.FlattenValues(v.right, contract);

                right.unshift(v.value);
                return right;
            }
        }

        if (isBinaryOp(v.node.token)) {
            let left : (boolean|(boolean[]))[]|undefined = undefined;
            if (v.node.left != undefined && isValue(v.node.left.token) && contract) {
                left = [v.value];
            } else {
                left = PropositionEvaluator.FlattenValues(v.left, contract);
                left.push(v.value);
            }

            if (v.node.right != undefined && isValue(v.node.right.token) && contract) {
                //Do nothing?
            } else {
                const right = PropositionEvaluator.FlattenValues(v.right, contract);
                left.push(...right);
            }
            return left;
        }

        throw new Error(`Unknown value, '${v.node.token.type}', at ${v.node.token.position}`);
    }
}
