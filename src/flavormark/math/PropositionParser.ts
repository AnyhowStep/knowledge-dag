import {PropositionToken, isBinaryOp, isValue} from "./PropositionTokenizer";

/*
    Expression :
        true |
        false |
        variable |
        bit-string |
        (not Expression) |
        (open-parentheses Expression close-parentheses) |
        (Expression BinaryOp Expression)

    BinaryOp : and | or | conditional | biconditional | xor
*/
export interface PropositionNode {
    token  : PropositionToken,
    left?  : PropositionNode,
    right? : PropositionNode,
}

export class PropositionParser {
    private tokens : PropositionToken[] = [];
    private index : number = 0;
    public constructor () {

    }
    public readonly parse = (tokens : PropositionToken[]) => {
        this.tokens = tokens;
        this.index  = 0;
        const result = this.parseExpression();
        if (result == undefined) {
            throw new Error(`Empty expression found`);
        }

        const cur = this.advance();
        if (cur != undefined) {
            throw new Error(`Unexpected '${cur.type}', '${cur.value}', at position ${cur.position}; expected end of expression`);
        }

        return result;
    }
    public back () {
        --this.index;
    }
    public advance () : PropositionToken|undefined {
        if (this.index < 0 || this.index >= this.tokens.length) {
            return undefined;
        }
        const result = this.tokens[this.index];
        ++this.index;
        return result;
    }
    public parseExpression () : PropositionNode|undefined {
        const cur = this.advance();
        if (cur == undefined) {
            return undefined;
        }
        switch (cur.type) {
            case "true":
            case "false":
            case "variable":
            case "bit-string": {
                return this.parseBinary({
                    token : cur,
                });
            }
            case "not": {
                let result : PropositionNode = {
                    token : cur,
                };
                const right = this.parseExpression();
                if (right == undefined) {
                    throw new Error(`Expected an expression after negation at position ${cur.position}`);
                }
                if (isBinaryOp(right.token)) {
                    if (result.token.precedence > right.token.precedence) {
                        result.right = right.left;
                        right.left   = result;
                        result = right;
                        //TODO check if this will give any problems
                        //TODO check if early exit, return result, is viable
                    } else {
                        result.right = right;
                    }
                } else {
                    result.right = right;
                }
                return this.parseBinary(result);
            }
            case "open-parentheses": {
                const result : PropositionNode = {
                    token : cur,
                    right : this.parseExpression(),
                }
                if (result.right == undefined) {
                    throw new Error(`Expected an expression after '${cur.type}' at position ${cur.position}`);
                }
                const expectedClose = this.advance();
                if (expectedClose == undefined || expectedClose.type != "close-parentheses") {
                    throw new Error(`Open parentheses at position ${cur.position} is not closed`);
                }

                //Remove redundant nested parentheses, ((((((a))))))
                while (result.right != undefined && result.right.token.type == "open-parentheses") {
                    result.right = result.right.right;
                }
                {
                    let rightMost = result.right;
                    if (rightMost == undefined) {
                        throw new Error(`Empty expression in '${cur.type}' at position ${cur.position}; this is not supposed to happen`);
                    }
                    while (rightMost != undefined && rightMost.right != undefined) {
                        rightMost = rightMost.right;
                    }
                    rightMost.right = {
                        token : expectedClose,
                    };
                }

                if (result.right == undefined) {
                    throw new Error(`Empty expression found inside parentheses at position ${cur.position}, this should not happen`);
                }
                if (isValue(result.right.token)) {
                    //No need for parentheses, (a) && b == a && b
                    return this.parseBinary(result.right);
                } else {
                    return this.parseBinary(result);
                }
            }
            default: {
                this.back();
                return undefined;
            }
        }
    }
    public parseBinary (left : PropositionNode) : PropositionNode|undefined {
        const cur = this.advance();
        if (cur == undefined) {
            return left;
        }
        if (isBinaryOp(cur)) {
            const result : PropositionNode = {
                token : cur,
                left  : left,
            };
            const right = this.parseExpression();
            if (right == undefined) {
                throw new Error(`Expected an expression after '${cur.type}' at position ${cur.position}`);
            }
            if (isBinaryOp(right.token)) {
                if (result.token.precedence > right.token.precedence) {
                    result.right = right.left;
                    right.left   = result;
                }
            }

            result.right = right;
            /*
                //a || b ^ c && d
                //a
                //a ||
                    //b
                    //b ^
                        //c
                        //c &&
                            //d
                        //c && d
                    //b ^ (c && d)
                //(a || b) ^ (c && d)
            */
            return this.parseBinary(result);
        } else {
            this.back();
            return left;
        }
    }
    public static FlattenLabels (node : PropositionNode|undefined, contract : boolean) : string[] {
        if (node == undefined || node.token.type == "close-parentheses") {
            return [];
        }

        if (isValue(node.token)) {
            console.log(node.token.value);
            return [node.token.value];
        }

        //We want to flatten from this: (, a, \wedge, b, )
        //To this: (a, \wedge, b)
        //So, we render the parentheses in a special way
        if (node.token.type == "open-parentheses") {
            const right = PropositionParser.FlattenLabels(node.right, contract);

            right[0] = "(" + right[0];

            const lastIndex = right.length-1;
            right[lastIndex] += ")";
            return right;
        }

        if (node.token.type == "not") {
            if (node.right != undefined && isValue(node.right.token) && contract) {
                return [node.token.value + " " + node.right.token.value];
            } else {
                const right = PropositionParser.FlattenLabels(node.right, contract);
                right.unshift(node.token.value);
                return right;
            }
        }

        if (isBinaryOp(node.token)) {
            let left : string[]|undefined = undefined;
            if (node.left != undefined && isValue(node.left.token) && contract) {
                left = [node.left.token.value + " " + node.token.value];
                console.log(left[0]);
            } else {
                left  = PropositionParser.FlattenLabels(node.left, contract);
                left.push(node.token.value);
            }

            if (node.right != undefined && isValue(node.right.token) && contract) {
                const lastIndex = left.length-1;
                left[lastIndex] += " " + node.right.token.value;
                console.log(left[lastIndex]);
            } else {
                const right = PropositionParser.FlattenLabels(node.right, contract);
                left.push(...right);
            }

            return left;
        }

        throw new Error(`Unknown node, '${node.token.type}', at ${node.token.position}`);
    }
    public static GetNextOrder (orders : number[], defaultOrder : number) {
        if (orders.length == 0) {
            return defaultOrder;
        }
        const max = Math.max(...orders);
        if (max < 0) {
            return defaultOrder;
        }
        return max+1;
    }
    public static FlattenOrders (node : PropositionNode|undefined, contract : boolean, order : number = 1) : number[] {
        if (node == undefined || node.token.type == "close-parentheses") {
            return [];
        }

        if (isValue(node.token)) {
            return [-1];
        }

        //We want to flatten from this: (, a, \wedge, b, )
        //To this: (a, \wedge, b)
        //So, we render the parentheses in a special way
        if (node.token.type == "open-parentheses") {
            const right = PropositionParser.FlattenOrders(node.right, contract, order);
            return right;
        }

        if (node.token.type == "not") {
            if (node.right != undefined && isValue(node.right.token) && contract) {
                return [order];
            } else {
                const right = PropositionParser.FlattenOrders(node.right, contract, order);
                const myOrder = PropositionParser.GetNextOrder(right, order);

                right.unshift(myOrder);
                return right;
            }

        }

        if (isBinaryOp(node.token)) {
            let left : number[]|undefined = undefined;
            let rightOrder : number|undefined = undefined;
            if (node.left != undefined && isValue(node.left.token) && contract) {
                left = [];
                rightOrder = order;
            } else {
                left = PropositionParser.FlattenOrders(node.left, contract, order);
                rightOrder = PropositionParser.GetNextOrder(left, order);
            }

            if (node.right != undefined && isValue(node.right.token) && contract) {
                left.push(rightOrder);
                return left;
            } else {
                const right = PropositionParser.FlattenOrders(node.right, contract, rightOrder);
                const myOrder = PropositionParser.GetNextOrder(right, rightOrder);

                left.push(myOrder);
                left.push(...right);
                return left;
            }

        }

        throw new Error(`Unknown value, '${node.token.type}', at ${node.token.position}`);
    }
    public static GetUsedVariables (node : PropositionNode|undefined, result : string[]=[]) : string[] {
        if (node == undefined) {
            return result;
        }
        if (node.token.type == "variable") {
            result.push(node.token.value);
            return result;
        }
        PropositionParser.GetUsedVariables(node.left, result);
        PropositionParser.GetUsedVariables(node.right, result);
        return result;
    }
}
