import {CfgDeclaration, CfgSubstringType} from "../cfg-declaration";

interface GenerateCfgStringsImplArgs {
    readonly cfg : CfgDeclaration,
    readonly maxBreadth : number,
    readonly maxDepth : number,

    readonly curState : string,
    readonly curBreadth : number,
    readonly curDepth : number,
}

/**
 *  [
 *      ["terminal"],
 *      ["var1", "var2"],
 *  ]
 */

interface CfgString {
    readonly parts : readonly (string|(readonly CfgString[]))[];
}

/**
 * @todo Add some caching
 */
function generateCfgStringsImpl (
    {
        cfg,
        maxBreadth,
        maxDepth,

        curState,
        curBreadth,
        curDepth,
    } : GenerateCfgStringsImplArgs
) : CfgString[]|undefined {
    if (curBreadth > maxBreadth) {
        return undefined;
    }
    if (curDepth > maxDepth) {
        return undefined;
    }

    const rules = cfg.rules.filter(r => r.variable == curState);

    const result : CfgString[] = [];

    for (const rule of rules) {

        for (const str of rule.strings) {
            const parts : (string|(readonly CfgString[]))[] = [];

            let varCount = 0;
            for (const substr of str) {
                switch (substr.subStringType) {
                    case CfgSubstringType.Terminal: {
                        parts.push(substr.value);
                        break;
                    }
                    case CfgSubstringType.Variable: {
                        ++varCount;
                        const subResult = generateCfgStringsImpl({
                            cfg,
                            maxBreadth,
                            maxDepth,

                            curState : substr.identifier,
                            curBreadth : curBreadth + varCount,
                            curDepth : curDepth + 1,
                        });
                        if (subResult == undefined) {
                            break;
                        }
                        parts.push(subResult);
                        break;
                    }
                }
            }

            if (parts.length == str.length) {
                result.push({
                    parts,
                });
            }
        }
    }

    if (result.length == 0) {
        return undefined;
    }

    return result;
}

export interface GenerateCfgStringsArgs {
    readonly cfg : CfgDeclaration,
    readonly maxBreadth : number,
    readonly maxDepth : number,
}
export function generateCfgStrings (
    {
        cfg,
        maxBreadth,
        maxDepth,
    } : GenerateCfgStringsArgs
) : CfgString[] {
    const result = generateCfgStringsImpl({
        cfg,
        maxBreadth,
        maxDepth,

        curState : cfg.rules[0].variable,
        curBreadth : 0,
        curDepth : 0,
    });

    if (result == undefined) {
        return [];
    } else {
        return result;
    }
}

export interface GenerateLanguageFromCfgStringArgs {
    readonly cfgString : CfgString,
    readonly maxLength : number,
}

export function generateLanguageFromCfgString (
    {
        cfgString,
        maxLength,
    } : GenerateLanguageFromCfgStringArgs
) : Set<string> {
    let result = new Set<string>();
    result.add("");
    let shortestWordLength = 0;

    for (const part of cfgString.parts) {
        if (result.size == 0) {
            return result;
        }

        if (typeof part == "string") {
            const newResult = new Set<string>();
            for (const w1 of result) {
                const newW = w1 + part;
                if (newW.length <= maxLength) {
                    newResult.add(newW);
                }
            }

            result = newResult;
            shortestWordLength += part.length;
        } else {
            const subResult = new Set<string>();
            for (const subPart of part) {
                const subPartStrs = generateLanguageFromCfgString({
                    cfgString : subPart,
                    maxLength : maxLength - shortestWordLength,
                });
                for (const subPartStr of subPartStrs) {
                    subResult.add(subPartStr);
                }
            }
            const newResult = new Set<string>();
            let newShortestWordLength = Number.MAX_SAFE_INTEGER;
            for (const w1 of result) {
                for (const w2 of subResult) {
                    const newW = w1 + w2;
                    if (newW.length <= maxLength) {
                        newResult.add(newW);
                        if (newW.length <= newShortestWordLength) {
                            newShortestWordLength = newW.length;
                        }
                    }
                }
            }
            result = newResult;
            shortestWordLength = newShortestWordLength;
        }
    }

    return result;
}

export interface GenerateLanguageArgs {
    readonly cfg : CfgDeclaration,
    readonly maxLength : number,
}
export function generateLanguage (
    {
        cfg,
        maxLength,
    } : GenerateLanguageArgs
) {
    const cfgStrings = generateCfgStrings({
        cfg,
        maxBreadth : maxLength * 2,
        maxDepth : maxLength * 2,
    });

    const result = new Set<string>();

    for (const cfgString of cfgStrings) {
        const subResult = generateLanguageFromCfgString({
            cfgString,
            maxLength,
        });
        for (const str of subResult) {
            result.add(str);
        }
    }

    return result;
}

class TokenSet {
    private map = new Map<string, string[]>();

    public add (arr : readonly string[]) : void {
        const key = arr.join("\0");
        if (this.map.has(key)) {
            return;
        }
        this.map.set(key, [...arr]);
    }

    public toArray () {
        return [...this.map.values()];
    }

    public [Symbol.iterator] () : IterableIterator<string[]> {
        return this.map.values();
    }

    public get size () {
        return this.map.size;
    }
}

export interface GenerateTokenLanguageFromCfgStringArgs {
    readonly cfgString : CfgString,
    readonly maxLength : number,
}

export function generateTokenLanguageFromCfgString (
    {
        cfgString,
        maxLength,
    } : GenerateLanguageFromCfgStringArgs
) : string[][] {
    let result = new TokenSet();
    result.add([]);
    let shortestWordLength = 0;

    for (const part of cfgString.parts) {
        if (result.size == 0) {
            return result.toArray();
        }

        if (typeof part == "string") {
            const newResult = new TokenSet();
            for (const w1 of result) {
                const newW = [...w1, part];
                if (newW.length <= maxLength) {
                    newResult.add(newW);
                }
            }

            result = newResult;
            shortestWordLength += 1;
        } else {
            const subResult = new TokenSet();
            for (const subPart of part) {
                const subPartStrs = generateTokenLanguageFromCfgString({
                    cfgString : subPart,
                    maxLength : maxLength - shortestWordLength,
                });
                for (const subPartStr of subPartStrs) {
                    subResult.add(subPartStr);
                }
            }
            const newResult = new TokenSet();
            let newShortestWordLength = Number.MAX_SAFE_INTEGER;
            for (const w1 of result) {
                for (const w2 of subResult) {
                    const newW = [...w1, ...w2];
                    if (newW.length <= maxLength) {
                        newResult.add(newW);
                        if (newW.length <= newShortestWordLength) {
                            newShortestWordLength = newW.length;
                        }
                    }
                }
            }
            result = newResult;
            shortestWordLength = newShortestWordLength;
        }
    }

    return result.toArray();
}

export interface GenerateTokenLanguageArgs {
    readonly cfg : CfgDeclaration,
    readonly maxLength : number,
}
export function generateTokenLanguage (
    {
        cfg,
        maxLength,
    } : GenerateTokenLanguageArgs
) {
    const cfgStrings = generateCfgStrings({
        cfg,
        maxBreadth : maxLength * 2,
        maxDepth : maxLength * 2,
    });

    const result = new TokenSet();

    for (const cfgString of cfgStrings) {
        const subResult = generateTokenLanguageFromCfgString({
            cfgString,
            maxLength,
        });
        for (const str of subResult) {
            result.add(str);
        }
    }

    return result.toArray();
}
