import * as React from "react";
import {bigIntLib} from "bigint-lib";
import {useError} from "../../ui";
import {api} from "../../api";
import {NodeDetailed} from "../../../api-mapper";

export interface UseFetchProps {
    nodeId : string;
}

export function useFetch (props : UseFetchProps) {
    const error = useError();

    const [node, setNode] = React.useState<NodeDetailed|undefined>(undefined);

    React.useEffect(
        () => {
            setNode(undefined);
            let cancelled = false;
            api.node.fetchDetailed()
                .setParam({
                    nodeId : bigIntLib.BigInt(props.nodeId),
                })
                .send()
                .then((response) => {
                    if (cancelled) {
                        return;
                    }
                    setNode(response.responseBody);
                    error.reset();
                })
                .catch((err) => {
                    if (cancelled) {
                        return;
                    }
                    error.push("negative", err.message);
                });
            return () => {
                cancelled = true;
            };
        },
        [props.nodeId]
    );

    return {
        error,
        node,
    };
}
