import {
    CfgSubstringVariable,
    CfgSubstringTerminal,
    CfgSubstringType,
} from "../cfg-declaration";
import {ParseTreeVariable} from "./try-find-leftmost-parse-trees";

export type DerivationString = readonly (CfgSubstringVariable|CfgSubstringTerminal)[];

export interface DerivationFromParseTreeImplArgs {
    readonly parseTree : ParseTreeVariable;
    readonly result : DerivationString[],
}

/**
 * A leftmost derivation replaces the leftmost remaining variable
 * at every step.
 */
export function derivationFromParseTreeImpl (
    {
        parseTree,
        result,
    } : DerivationFromParseTreeImplArgs
) : DerivationString[] {
    if (result.length == 0) {
        result.push([parseTree]);
    }
    const prvDerivationString = result[result.length-1];
    const index = prvDerivationString.indexOf(parseTree);

    const head = prvDerivationString.slice(0, index);
    const tail = prvDerivationString.slice(index+1);
    result.push([
        ...head,
        ...parseTree.children,
        ...tail,
    ]);

    for (const child of parseTree.children) {
        if (child.subStringType == CfgSubstringType.Variable) {
            derivationFromParseTreeImpl({
                parseTree : child,
                result,
            });
        }
    }


    return result;
}

export interface DerivationFromParseTreeArgs {
    readonly parseTree : ParseTreeVariable;
}

export function derivationFromParseTree (
    {
        parseTree,
    } : DerivationFromParseTreeArgs
) : DerivationString[] {
    const result = derivationFromParseTreeImpl({
        parseTree,
        result : [],
    });

    return result.map(derivationStr => {
        return derivationStr.map((subStr) : (CfgSubstringVariable|CfgSubstringTerminal) => {
            if (subStr.subStringType == CfgSubstringType.Terminal) {
                return {
                    subStringType : CfgSubstringType.Terminal,
                    value : subStr.value,
                };
            } else {
                return {
                    subStringType : CfgSubstringType.Variable,
                    identifier : subStr.identifier,
                };
            }
        });
    });
}
