import * as fm from "flavormark";

export class NpdaNode extends fm.Node {
    name : string = "";
    rawStringAlphabet : string = "";
    rawStackAlphabet : string = "";
    rawStartState : string = "";
    rawAcceptStates : string = "";
    rawTransitions : string[] = [];
}
