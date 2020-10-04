import {NpdaDeclaration} from "../npda-declaration";
import {isFailState} from "./is-fail-state";

interface GenerateLanguageImplArgs {
    readonly npda : NpdaDeclaration,
    readonly maxLength : number,
    readonly maxStep : number,

    readonly result : Set<string>,

    readonly curState : string,
    readonly curStack : readonly string[],
    readonly word : readonly string[],
    readonly curStep : number,
}

function generateLanguageImpl (
    {
        npda,
        maxLength,
        maxStep,

        result,

        curState,
        curStack,
        word,
        curStep,
    } : GenerateLanguageImplArgs
) : void {
    if (npda.acceptStates.includes(curState) && word.length <= maxLength) {
        result.add(word.join(""));
    }

    if (word.length > maxLength) {
        return;
    }

    if (curStep > maxStep) {
        return;
    }

    const transition = npda.transitions.find(t => t.srcState == curState);
    if (transition == undefined) {
        return;
    }

    if (isFailState(npda.acceptStates, transition)) {
        return;
    }

    for (let i=0; i<transition.dstStateSetCollection.length; ++i) {
        function doThing (
            {
                stackO,
                poppedStack,
            } :
            {
                stackO : readonly (readonly string[])[],
                poppedStack : readonly string[],
            }
        ) {
            for (let j=0; j<stackO.length; ++j) {
                const dstStateSet = stackO[j];
                const stackOutputLetter = npda.stackAlphabet[j] as string|undefined;

                for (const dstState of dstStateSet) {
                    generateLanguageImpl({
                        npda,
                        maxLength,
                        maxStep,

                        result,

                        curState : dstState,
                        /**
                         * We may or may not push to the stack.
                         */
                        curStack : (
                            stackOutputLetter == undefined ?
                            poppedStack :
                            [...poppedStack, stackOutputLetter]
                        ),
                        /**
                         * The letter may or may not be epsilon.
                         */
                        word : (
                            stringLetter == undefined ?
                            word :
                            [...word, stringLetter]
                        ),
                        curStep : curStep + 1,
                    });
                }
            }
        }

        const stringLetter = npda.stringAlphabet[i] as string|undefined;

        const curTop = (
            curStack.length == 0 ?
            undefined :
            curStack[curStack.length - 1]
        );

        const stackIo = transition.dstStateSetCollection[i];

        if (curTop != undefined) {
            const stackInputLetter = npda.stackAlphabet.indexOf(curTop);

            const stackO = stackIo[stackInputLetter];

            /**
             * We pop the top here.
             */
            const poppedStack = curStack.slice(0, curStack.length-1);
            doThing({
                stackO,
                poppedStack,
            });
        }

        /**
         * We do not pop the top here.
         */
        doThing({
            stackO : stackIo[npda.stackAlphabet.length],
            poppedStack : curStack,
        });
    }
}

export interface GenerateLanguageArgs {
    readonly npda : NpdaDeclaration,
    readonly maxLength : number,
    readonly maxStep : number,
}
export function generateLanguage (
    {
        npda,
        maxLength,
        maxStep,
    } : GenerateLanguageArgs
) : Set<string> {
    const result = new Set<string>();

    generateLanguageImpl({
        npda,
        maxLength,
        maxStep,

        result,

        curState : npda.startState,
        curStack : [],
        word : [],
        curStep : 0,
    });

    return result;
}
