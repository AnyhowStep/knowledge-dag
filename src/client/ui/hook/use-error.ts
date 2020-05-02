import * as React from "react";

export function useError () {
    const [type, setType] = React.useState<"warning"|"negative">("warning");
    const [messages, setMessages] = React.useState<(string|{message:string, link:string})[]>([]);

    return {
        messages,
        type,
        push : (newType : "warning"|"negative", newMessage : (string|{message:string, link:string})[]) => {
            if (newType == "negative") {
                setType(newType);
            }
            setMessages(messages.concat(newMessage));
        },
        reset : () => {
            setType("warning");
            setMessages([]);
        },
    };
}
