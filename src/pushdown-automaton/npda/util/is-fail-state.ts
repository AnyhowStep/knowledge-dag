import {NpdaTransition} from "../npda-declaration";

export function isFailState (acceptStates : readonly string[], t : NpdaTransition) {
    return (
        !acceptStates.includes(t.srcState) &&
        t.dstStateSetCollection.every(
            stackIo => stackIo.every(
                stackO => stackO.every(
                    dstStateSet => dstStateSet.every(
                        dstState => dstState == t.srcState
                    )
                )
            )
        )
    );
}
