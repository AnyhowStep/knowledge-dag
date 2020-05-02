import * as React from "react";
import * as classnames from "classnames";

/*
    A hack-y controller for closing other dropdowns.
    When one dropdown opens, all others must close.
*/
type OnDropdownOpenDelegate = (element : HTMLElement) => void;
const onDropdownOpenListener : OnDropdownOpenDelegate[] = [];
function addOnDropdownOpenListener (d : OnDropdownOpenDelegate) {
    if (onDropdownOpenListener.indexOf(d) < 0) {
        onDropdownOpenListener.push(d);
    }
}
function removeOnDropdownOpenListener (d : OnDropdownOpenDelegate) {
    const index = onDropdownOpenListener.indexOf(d);
    if (index < 0) {
        return;
    }
    onDropdownOpenListener.splice(index, 1);
}
function invokeOnDropdownOpen (element : HTMLElement) {
    const arr = onDropdownOpenListener.slice();
    for (const d of arr) {
        d(element);
    }
}

type OnCloseAllDelegate = () => void;
const onCloseAllListener : OnCloseAllDelegate[] = [];
function addOnCloseAllListener (d : OnCloseAllDelegate) {
    if (onCloseAllListener.indexOf(d) < 0) {
        onCloseAllListener.push(d);
    }
}
function removeOnCloseAllListener (d : OnCloseAllDelegate) {
    const index = onCloseAllListener.indexOf(d);
    if (index < 0) {
        return;
    }
    onCloseAllListener.splice(index, 1);
}
function invokeOnCloseAll () {
    const arr = onCloseAllListener.slice();
    for (const d of arr) {
        d();
    }
}

let documentClickListener : ((e : MouseEvent) => void)|undefined = undefined;
let allowCloseAll = true;
function initDocumentClickListener () {
    if (documentClickListener != undefined) {
        return;
    }
    if (document != undefined) {
        documentClickListener = (_e) => {
            //console.log("body click", e);
            if (!allowCloseAll) {
                allowCloseAll = true;
                return;
            }
            invokeOnCloseAll();
        };
        document.addEventListener("click", documentClickListener, false);
    }
}

export interface UseDropdownProps {
    //Defaults to "open"
    openClassName? : string,
    //Defaults to `undefined`
    closeClassName? : string,
}
export type DropdownHook = ReturnType<typeof useDropdown>;
export function useDropdown (props : UseDropdownProps) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<any>(null);

    React.useEffect(() => {
        initDocumentClickListener();

        const d : OnDropdownOpenDelegate = (element) => {
            if (element == ref.current) {
                //console.log("opening", element)
                setOpen(true);
            } else {
                //console.log("closing")
                setOpen(false);
            }
        };
        addOnDropdownOpenListener(d);
        const d2 : OnCloseAllDelegate = () => {
            //console.log("close all");
            setOpen(false);
        };
        addOnCloseAllListener(d2);
        return () => {
            removeOnDropdownOpenListener(d);
            removeOnCloseAllListener(d2);
        };
    }, []);

    const onMouseOver : React.MouseEventHandler<HTMLElement> = () => {

    };
    const onClick : React.MouseEventHandler<HTMLElement> = (e) => {
        e.stopPropagation();
        allowCloseAll = false;
        //console.log("click", ref.current, e.target);
        if (e.target == ref.current || (e.target as HTMLElement).className.indexOf("menu") < 0) {
            if (open) {
                setOpen(false);
            } else if (ref.current != undefined) {
                invokeOnDropdownOpen(ref.current);
            }
        } else {
            setOpen(false);
        }
    };

    return {
        className : (className : string|undefined) => {
            return classnames([
                className,
                (
                    open ?
                    (
                        props.openClassName == undefined ?
                        "open" :
                        props.openClassName
                    ) :
                    props.closeClassName
                ),
            ]);
        },
        onMouseOver,
        onClick,
        ref,
    };
}
