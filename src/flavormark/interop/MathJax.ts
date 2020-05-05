export interface MathJaxRegister {
    StartupHook (type : string, hook : () => void) : void;
}
export interface MathJaxHub {
    //TODO What other are the args, really?
    Queue (args : (
        ["Typeset", MathJaxHub, Element]|
        ["setRenderer", MathJaxHub, "SVG"]|
        ["setRenderer", MathJaxHub, "CommonHTML"]|
        (() => void)
    )) : void;
    Register : MathJaxRegister;
    processError : (error : any, state : any, type : any) => void;
    //Custom
    Cancel? : () => void;
    Restart? : () => void;
    cancelTypeset? : boolean;
}
export interface TranslaterT {
    Translate : (script : any, state : any) => void;
    Augment : (arg : { Translate : (script : any, state : any) => void }) => void;
}
export interface OutputJaxT {
    ["HTML-CSS"] : TranslaterT;
    ["SVG"] : TranslaterT;
    ["CommonHTML"] : TranslaterT;
    ["PreviewHTML"] : TranslaterT;
}
export interface InputJaxT {
    ["TeX"] : TranslaterT;

}
export interface MessageT {
    Clear : (arg0 : number, arg1 : number) => void;
}
export interface MathJaxT {
    Hub : MathJaxHub;
    OutputJax : OutputJaxT;
    InputJax : InputJaxT;
    Message : MessageT;
}

declare const MathJax : MathJaxT|undefined;

function initMathJax (mj : MathJaxT) : MathJaxT {
    const HUB = mj.Hub;

    if (HUB.Cancel == undefined) {
        HUB.cancelTypeset = false;
        const CANCELMESSAGE = "MathJax Canceled";

        HUB.Register.StartupHook("HTML-CSS Jax Config", function () {
            var HTMLCSS = mj.OutputJax["HTML-CSS"],
                TRANSLATE = HTMLCSS.Translate;
            HTMLCSS.Augment({
                Translate: function (script, state) {
                    if (HUB.cancelTypeset || state.cancelled) {
                        throw Error(CANCELMESSAGE)
                    }
                    return TRANSLATE.call(HTMLCSS, script, state);
                }
            });
        });

        HUB.Register.StartupHook("SVG Jax Config", function () {
            var SVG = mj.OutputJax["SVG"],
                TRANSLATE = SVG.Translate;
            SVG.Augment({
                Translate: function (script, state) {
                    if (HUB.cancelTypeset || state.cancelled) {
                        throw Error(CANCELMESSAGE)
                    }
                    return TRANSLATE.call(SVG, script, state);
                }
            });
        });

        HUB.Register.StartupHook("CommonHTML Jax Config", function () {
            var CHTML = mj.OutputJax.CommonHTML,
                TRANSLATE = CHTML.Translate;
            CHTML.Augment({
                Translate: function (script, state) {
                    if (HUB.cancelTypeset || state.cancelled) {
                        throw Error(CANCELMESSAGE);
                    }
                    return TRANSLATE.call(CHTML, script, state);
                }
            });
        });

        HUB.Register.StartupHook("PreviewHTML Jax Config", function () {
            var PHTML = mj.OutputJax.PreviewHTML,
                TRANSLATE = PHTML.Translate;
            PHTML.Augment({
                Translate: function (script, state) {
                    if (HUB.cancelTypeset || state.cancelled) {
                        throw Error(CANCELMESSAGE);
                    }
                    return TRANSLATE.call(PHTML, script, state);
                }
            });
        });

        HUB.Register.StartupHook("TeX Jax Config", function () {
            var TEX = mj.InputJax.TeX,
                TRANSLATE = TEX.Translate;
            TEX.Augment({
                Translate: function (script, state) {
                    if (HUB.cancelTypeset || state.cancelled) {
                        throw Error(CANCELMESSAGE)
                    }
                    return TRANSLATE.call(TEX, script, state);
                }
            });
        });

        var PROCESSERROR = HUB.processError;
        HUB.processError = function (error, state, type) {
            if (error.message !== CANCELMESSAGE) {
                return PROCESSERROR.call(HUB, error, state, type)
            }
            mj.Message.Clear(0, 0);
            state.jaxIDs = [];
            state.jax = {};
            state.scripts = [];
            state.i = state.j = 0;
            state.cancelled = true;
            return null;
        };

        HUB.Cancel = function () {
            this.cancelTypeset = true;
        };
        HUB.Restart = function () {
            this.cancelTypeset = false;
        };
    }
    return mj;
}
export async function getMathJax () : Promise<MathJaxT> {
    if (MathJax == undefined) {
        return new Promise<MathJaxT>((resolve) => {
            const interval = setInterval(() => {
                if (MathJax != undefined) {
                    clearInterval(interval);
                    return resolve(initMathJax(MathJax));
                }
            }, 1000);
        });
    } else {
        return initMathJax(MathJax);
    }
}
