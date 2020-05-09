import * as React from "react";
import * as lzString from "lz-string";
import * as tm from "type-mapping/fluent";
import {QueryUtil} from "../../ui";
import {RouteComponentProps} from "react-router";
import {TextbookDetailedItem} from "../node/textbook-detailed-item";

export interface FetchProps extends RouteComponentProps<{ textbookId : string }> {

}

export function Fetch (props : FetchProps) {
    const query = QueryUtil.toObject(props.location.search);
    const explicitNodeIds = QueryUtil.getStringArray(query, "nodeIds", undefined);

    let nodeIds : string[]|undefined;

    if (explicitNodeIds == undefined) {
        const lzData = props.match.params.textbookId;

        let data = lzString.decompressFromEncodedURIComponent(lzData);
        if (data == undefined || data.length == 0) {
            data = lzString.decompressFromEncodedURIComponent(decodeURIComponent(lzData));
        }
        if (data == undefined || data.length == 0) {
            return (
                <div className="ui main container">
                    Could not parse lzData
                </div>
            );
        }

        try {
            nodeIds = tm.unsignedIntegerFormatString().array()(
                "lzData",
                JSON.parse(data)
            );
        } catch (err) {
            return (
                <div className="ui main container">
                    Could not parse lzData; {err.message}
                </div>
            );
        }
    } else {
        nodeIds = explicitNodeIds;
    }

    return (
        <div className="ui main container">
            {
                nodeIds.map((nodeId, index) => <TextbookDetailedItem
                    key={nodeId}
                    className={
                        index % 2 == 0 ?
                        "textbook-detailed-item-even" :
                        "textbook-detailed-item-odd"
                    }
                    nodeId={nodeId}
                />)
            }
        </div>
    );
}
