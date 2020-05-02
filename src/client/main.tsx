//Really bad BigInt polyfill
class MyBigInt {
    value : string;
    constructor (value : any) {
        this.value = String(value);
    }
    toString () {
        return this.value;
    }
    toJSON () {
        return this.value;
    }
}
//if (true) {
if (typeof BigInt === "undefined") {
    console.log("Using really bad BigInt polyfill because browser does not support it");
    (window as any).BigInt = function (x : any) {
        return new MyBigInt(x);
    };
}
if (BigInt.prototype != undefined) {
    (BigInt.prototype as any).toJSON = function () {
        if (BigInt(Number(this)) === this) {
            return Number(this);
        } else {
            return this.toString();
        }
    };
}
import * as React from "react";
import * as ReactDOM from "react-dom";
import {App} from "./app";

ReactDOM.render(
    <App/>,
    document.getElementById("app")
);
