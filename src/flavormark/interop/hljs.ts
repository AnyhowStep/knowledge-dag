export interface Hljs {
    highlightBlock (element : Element) : void;
    lineNumbersBlock (element : Element) : void;
}

declare const hljs : Hljs;

export function highlight (element : Element) {
    hljs.highlightBlock(element);
    hljs.lineNumbersBlock(element);
}
