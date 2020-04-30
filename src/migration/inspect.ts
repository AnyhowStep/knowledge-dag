import * as util from "util";

export function inspect (arg : unknown) : string {
    return util.inspect(
        arg,
        {
            showHidden : false,
            depth : 10,
            colors : true,
            maxArrayLength : 100000,
            compact : false,
        }
    );
}
