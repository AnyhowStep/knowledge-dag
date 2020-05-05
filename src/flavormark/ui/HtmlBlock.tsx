import * as React from "react";
import {Component} from "react";

export interface HtmlBlockProps {
    html  : string,
    //HACK-Y, MAY BREAK
    executeScript? : boolean,
    block : boolean,
}
export interface HtmlBlockState {
}
export class HtmlBlock extends Component<HtmlBlockProps, HtmlBlockState> {
    private inserted : boolean = false;
    public constructor (props : HtmlBlockProps) {
        super(props);
        this.state = {
        };
    }
    private executeScript = () => {
        if (this.props.executeScript != true) {
            return;
        }

        //THIS WILL BREAK IF
        //THE SCRIPT CONTAINS A SCRIPT TAG IN A STRING
        const r = /\<script\>([^]*?)\<\/script\>/gi;
        for (let m=r.exec(this.props.html); m!=null; m=r.exec(this.props.html)) {
            const rawJs = m[1];
            eval(rawJs);
        }
    };
    public render () {
        return <span key={this.props.html} ref={(ele) => {
            if (ele == undefined || this.inserted) {
                return;
            }
            this.inserted = true;
            //THIS WILL FAIL FOR INLINE HTML TAGS
            //FOR EXAMPLE:
            //<b> non-tag </b>
            ele.insertAdjacentHTML("afterend", this.props.html);
            this.executeScript();
        }}></span>;
    }
}
