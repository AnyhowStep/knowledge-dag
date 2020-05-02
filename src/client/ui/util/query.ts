import * as tm from "type-mapping";
import * as qs from "querystring-browser";
import {bigIntLib} from "bigint-lib";

export interface Query {
    [key: string]: undefined|string|(string[]);
}

export namespace QueryUtil {
    export function mutateSearch (
        search : string,
        mutations : {
            pick? : readonly string[],
            update? : Record<string, string|undefined>,
        }
    ) : string {
        const obj = QueryUtil.toObject(search);
        const picked = (
            mutations.pick == undefined ?
            obj :
            tm.TypeUtil.pick(obj, ...mutations.pick)
        );
        const updated = (
            mutations.update == undefined ?
            picked :
            Object.keys(mutations.update).reduce(
                (updated, key) => {
                    updated[key] = (mutations.update as Record<string, string>)[key];
                    return updated;
                },
                {...picked}
            )
        );
        const newQueryStr = QueryUtil.toString(updated);
        const newSearch = newQueryStr.length == 0 ?
            "" :
            "?" + newQueryStr;
        return newSearch;
    }
    export function pickSearch (search : string, ...keys : string[]) : string {
        return mutateSearch(search, { pick : keys });
    }
    export function toObject (str : string) : Query {
        if (str.startsWith("?")) {
            str = str.substr(1);
        }
        const obj = qs.parse(str);
        return obj;
    }
    export function toString<T> (obj : { [key in keyof T] : undefined|string|(string[]) }, sort? : boolean) : string;
    export function toString (obj : Query, sort? : boolean) : string;
    export function toString (obj : Query, sort : boolean =false) : string {
        const o = {...obj};
        const keys = Object.keys(o);
        if (sort) {
            keys.sort();
        }
        for (const k of keys) {
            const v = o[k];
            if (v == undefined) {
                delete o[k];
            } else if ((v instanceof Object) && !(v instanceof Array)) {
                o[k] = String(v);
            } else if (typeof v == "bigint") {
                o[k] = String(v);
            }
        }
        return qs.stringify(o);
    }
    export function getInt (obj : Query, key : string, defaultValue : number) : number;
    export function getInt (obj : Query, key : string, defaultValue : number|undefined) : number|undefined;
    export function getInt (obj : Query, key : string, defaultValue : number|undefined) : number|undefined {
        let value = obj[key];
        if (value == undefined) {
            return defaultValue;
        }
        if (value instanceof Array) {
            if (value.length == 0) {
                return defaultValue;
            } else {
                value = value[0];
            }
        }
        const result = Number.parseInt(value);
        if (isFinite(result)) {
            return result;
        } else {
            return defaultValue;
        }
    }

    export function getString (obj : Query, key : string, defaultValue : string) : string;
    export function getString (obj : Query, key : string, defaultValue : string|undefined) : string|undefined;
    export function getString (obj : Query, key : string, defaultValue : string|undefined) : string|undefined {
        let value = obj[key];
        if (value == undefined) {
            return defaultValue;
        }
        if (value instanceof Array) {
            if (value.length == 0) {
                return defaultValue;
            } else {
                value = value[0];
            }
        }
        if (value != "") {
            return value;
        } else {
            return defaultValue;
        }
    }

    export function getBigInt (obj : Query, key : string, defaultValue : bigint) : bigint;
    export function getBigInt (obj : Query, key : string, defaultValue : bigint|undefined) : bigint|undefined;
    export function getBigInt (obj : Query, key : string, defaultValue : bigint|undefined) : bigint|undefined {
        let value = obj[key];
        if (value == undefined) {
            return defaultValue;
        }
        if (value instanceof Array) {
            if (value.length == 0) {
                return defaultValue;
            } else {
                value = value[0];
            }
        }
        if (isFinite(Number.parseInt(value))) {
            return bigIntLib.BigInt(value);
        } else {
            return defaultValue;
        }
    }

    export function getBoolean (obj : Query, key : string, defaultValue : boolean) : boolean;
    export function getBoolean (obj : Query, key : string, defaultValue : boolean|undefined) : boolean|undefined;
    export function getBoolean (obj : Query, key : string, defaultValue : boolean|undefined) : boolean|undefined {
        const str = getString(obj, key, undefined);
        if (str == undefined) {
            return defaultValue;
        }
        try {
            const b = tm.mysql.boolean()(key, str);
            return b;
        } catch (e) {
            console.error(e);
            return defaultValue;
        }
    }

    export function getStringLiteral<ArrT extends string[]> (obj : Query, key : string, arr : ArrT, defaultValue : ArrT[number]) : ArrT[number];
    export function getStringLiteral<ArrT extends string[]> (obj : Query, key : string, arr : ArrT, defaultValue : ArrT[number]|undefined) : ArrT[number]|undefined;
    export function getStringLiteral<ArrT extends string[]> (obj : Query, key : string, arr : ArrT, defaultValue : ArrT[number]|undefined) : ArrT[number]|undefined {
        const str = getString(obj, key, undefined);
        if (str == undefined) {
            return defaultValue;
        }
        if (arr.indexOf(str) >= 0) {
            return str;
        } else {
            return defaultValue;
        }
    }

    export function getStringArray (obj : Query, key : string, defaultValue : string[]) : string[];
    export function getStringArray (obj : Query, key : string, defaultValue : string[]|undefined) : string[]|undefined;
    export function getStringArray (obj : Query, key : string, defaultValue : string[]|undefined) : string[]|undefined {
        const value = obj[key];
        if (value == undefined) {
            return defaultValue;
        }
        if (value instanceof Array) {
            return value;
        }
        return [value];
    }
}
