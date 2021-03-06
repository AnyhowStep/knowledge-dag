import * as React from "react";
import {Link} from "react-router-dom";

export interface ErrorMessageProps {
    error : {
        messages : (string|{message:string, link:string})[],
        type : "warning"|"negative",
    },
    style? : React.CSSProperties,
    onCloseClick? : () => void,
}
export function ErrorMessage (props : ErrorMessageProps) {
    const {error} = props;

    if (error.messages.length == 0) {
        return <div className="ui hidden message"></div>;
    } else {
        return (
            <div className={"ui icon message " + error.type} style={props.style}>
                <i className="exclamation triangle icon"></i>
                {
                    props.onCloseClick == undefined ?
                    undefined :
                    <i className="close icon" onClick={props.onCloseClick}></i>
                }
                <div className="content">
                    <div className="header">{error.type == "warning" ? "Warning" : "Error"}</div>
                    <ul className="list">
                        {
                            error.messages.map(
                                (message, i) => (
                                    <li key={i}>
                                        {
                                            typeof message == "string" ?
                                            message :
                                            <Link to={message.link}>{message.message}</Link>
                                        }
                                    </li>
                                )
                            )
                        }
                    </ul>
                </div>
            </div>
        );
    }
}
