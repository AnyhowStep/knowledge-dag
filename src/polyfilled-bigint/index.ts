/**
 * @todo
 * typeof x == "bigint" should also not be allowed.
 */
import {
    TSESTree,
    AST_NODE_TYPES,
} from "@typescript-eslint/experimental-utils";
import * as ts from "typescript";
import * as tsutils from "tsutils";
const util = require("@typescript-eslint/eslint-plugin/dist/util");
/*
type Options = [
    {
        //No options for now
    },
];
*/
type MessageId =
    | "errorBuiltInOperatorUsedWithBigInt";

module.exports = util.createRule/*<Options, MessageId>*/({
    name: "polyfilled-bigint",
    meta: {
        type: "suggestion",
        docs: {
            description: "Restricts builtin operators from being used on bigints; as bigints are assumed to be polyfilled",
            category: "Best Practices",
            recommended: false,
            requiresTypeChecking: true,
        },
        schema: [
            {
                type: "object",
                properties: {
                    //No options for now
                },
                additionalProperties: false,
            },
        ],
        messages: {
            errorBuiltInOperatorUsedWithBigInt : (
                "Unexpected bigint used as operand of builtin operator. BigInt assumed to be polyfilled."
            ),
        },
    },
    defaultOptions: [
        {
        },
    ],
    create(context : any) {
        const service = util.getParserServices(context);
        const checker = service.program.getTypeChecker();

        const checkedNodes = new Set<TSESTree.Node>();

        return {
            BinaryExpression : checkBinaryNode,
            UpdateExpression : checkUpdateNode,
            UnaryExpression: checkUnaryNode,
        };

        function checkUnaryNode(node: TSESTree.UnaryExpression): void {
            checkBinaryNode(node.argument, true);
        }

        function checkUpdateNode(node: TSESTree.UpdateExpression): void {
            checkBinaryNode(node.argument, true);
        }

        /**
         * This function analyzes the type of a boolean expression node and checks if it is allowed.
         * It can recurse when checking nested logical operators, so that only the outermost expressions are reported.
         * @param node The AST node to check.
         * @param isRoot Whether it is the root of a logical expression and there was no recursion yet.
         * @returns `true` if there was an error reported.
         */
        function checkBinaryNode(node: TSESTree.Node, isRoot = false): boolean {
            // prevent checking the same node multiple times
            if (checkedNodes.has(node)) {
                return false;
            }
            checkedNodes.add(node);

            // for logical operator, we also check its operands
            if (
                (
                    node.type === AST_NODE_TYPES.LogicalExpression ||
                    node.type === AST_NODE_TYPES.BinaryExpression
                ) &&
                node.operator !== "??"
            ) {
                for (const child of [node.left, node.right]) {
                    if (
                        child.type === AST_NODE_TYPES.Literal &&
                        (
                            child.value === undefined ||
                            child.value === null
                        )
                    ) {
                        //Comparison against null and undefined literal is okay
                        return false;
                    }

                    if (
                        child.type === AST_NODE_TYPES.Identifier &&
                        child.name === "undefined"
                    ) {
                        //Comparison against null and undefined literal is okay
                        return false;
                    }
                }

                let hasError = false;
                if (checkBinaryNode(node.left)) {
                    hasError = true;
                }
                if (checkBinaryNode(node.right)) {
                    hasError = true;
                }
                // if this logical operator is not the root of a logical expression
                // we only check its operands and return
                if (!isRoot) {
                    return hasError;
                }
                // if this is the root of a logical expression
                // we want to check its resulting type too
                else {
                    // ...unless there already was an error, we exit so we don"t double-report
                    if (hasError) {
                        return true;
                    }
                }
            }

            const tsNode = service.esTreeNodeToTSNodeMap.get(node);
            const type = util.getConstrainedTypeAtLocation(checker, tsNode);
            let messageId: MessageId | undefined;

            const types = inspectVariantTypes(tsutils.unionTypeParts(type));

            if (types.has("bigint")) {
                messageId = "errorBuiltInOperatorUsedWithBigInt";
            }

            if (messageId != null) {
                context.report({ node, messageId });
                return true;
            }
            return false;
        }

        /** The types we care about */
        type VariantType =
            | "bigint";

        /**
         * Check union variants for the types we care about
         */
        function inspectVariantTypes(types: ts.Type[]): Set<VariantType> {
            const variantTypes = new Set<VariantType>();

            if (
                types.some(type =>
                    tsutils.isTypeFlagSet(type, ts.TypeFlags.BigInt),
                )
            ) {
                variantTypes.add("bigint");
            }

            if (
                types.some(type =>
                    tsutils.isTypeFlagSet(type, ts.TypeFlags.BigIntLike),
                )
            ) {
                variantTypes.add("bigint");
            }

            if (
                types.some(type =>
                    tsutils.isTypeFlagSet(type, ts.TypeFlags.BigIntLiteral),
                )
            ) {
                variantTypes.add("bigint");
            }

            return variantTypes;
        }
    },
});
