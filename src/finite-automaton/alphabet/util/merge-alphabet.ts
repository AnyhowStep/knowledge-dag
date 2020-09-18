/**
 * + Assumes no repeats in `alphabet1`
 * + Assumes no repeats in `alphabet2`
 */
export function mergeAlphabet (
    alphabet1 : readonly string[],
    alphabet2 : readonly string[]
) : readonly string[] {

    const alphabet = [...alphabet1];
    for (const a2 of alphabet2) {
        if (!alphabet.includes(a2)) {
            alphabet.push(a2);
        }
    }
    return alphabet;
}
