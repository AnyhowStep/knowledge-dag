import * as fm from "flavormark";

export class DfaNode extends fm.Node {
    name : string = "";
    rawAlphabet : string = "";
    rawStartState : string = "";
    rawAcceptStates : string = "";
    rawTransitions : string[] = [];
}
