import * as React from "react";
import {Component} from "react";
import {MathRenderer} from "./MathRenderer";
import {getMathJax} from "../interop/MathJax";
import "vis/dist/vis.min.css";
import * as vis from "vis";
import {DfaUtil, DfaDeclaration} from "../../finite-automaton";

const brightColors = [
    //"#800000", //Maroon
    "#9a6324", //Brown
    "#808000", //Olive
    "#469990", //Teal
    //"#000075", //Navy
    "#e6194b", //Red? More like pink-ish red
    "#f58231", //Orange
    "#ffe119", //Yellow
    "#bfef45", //Lime
    "#3cb44b", //Green, really bright
    "#42d4f4", //Cyan
    "#4363d8", //Blue, purplish
    "#911eb4", //Purple
    "#f032e6", //Magenta
    "#fabebe", //Pink
    "#ffd8b1", //Apricot
    "#fffac8", //Beige
    "#aaffc3", //Mint
    "#e6beff", //Lavender
    /*"#ff0000",
    "#ffc000",
    "#fffc00",
    "#00ff00",
    "#00ffff",
    "#ff00ff",
    "#0000ff",*/
];

interface DfaNode extends vis.Node {
    font : {
        color : string,
    }
}
interface DfaEdge extends vis.Edge {
    color : {
        color : string,
        highlight : string,
        hover : string,
    },
    width : number,
    label : string|undefined,
}

function mj2img (input : string, color : string, isAccept : boolean) : Promise<{ svg : string, img : string }> {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = input;
    return new Promise<{ svg : string, img : string }>((resolve, reject) => {
        getMathJax()
            .then((mathJax) => {
                mathJax.Hub.Queue(["setRenderer", mathJax.Hub, "SVG"]);
                mathJax.Hub.Queue(["Typeset", mathJax.Hub, wrapper]);
                mathJax.Hub.Queue(["setRenderer", mathJax.Hub, "CommonHTML"]);
                mathJax.Hub.Queue(() => {
                    const mjOut = wrapper.getElementsByTagName("svg")[0];
                    if (mjOut == undefined) {
                        console.error(`Could not parse math: ${input}`, wrapper);
                        reject(new Error(`Could not parse math: ${input}`));
                        return;
                    }
                    mjOut.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    // thanks, https://spin.atomicobject.com/2014/01/21/convert-svg-to-png/
                    const svg = mjOut.outerHTML;
                    const image = new Image();
                    image.onload = () => {
                        const padding = 40;
                        const canvas = document.createElement("canvas");
                        const size = Math.max(image.width, image.height);
                        canvas.width = size + padding*2;
                        canvas.height = size + padding*2;
                        const context = canvas.getContext("2d");

                        if (context != undefined) {
                            context.fillStyle = color;
                            context.beginPath();

                            context.arc(
                                size/2+padding,
                                size/2+padding,
                                size/2+padding,
                                0,
                                Math.PI*2,
                                false
                            );

                            context.fill();

                            if (isAccept) {
                                context.strokeStyle = "black";
                                context.lineWidth = 2;
                                context.beginPath();

                                context.arc(
                                    size/2+padding,
                                    size/2+padding,
                                    size/2+(padding * 3 / 4),
                                    0,
                                    Math.PI*2,
                                    false
                                );

                                context.stroke();
                            }

                            const w = size + (padding);
                            const h = w/image.width * image.height;
                            context.drawImage(
                                image,
                                canvas.width/2 - w/2,
                                canvas.height/2 - h/2,
                                w,
                                h
                            );
                            //context.fillStyle = color;
                            //context.globalCompositeOperation = "source-in";
                            //context.fillRect(0, 0, canvas.width, canvas.height);

                            resolve({
                                svg : "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace(/currentColor/g, color)),
                                img : canvas.toDataURL("image/png"),
                            });
                        } else {
                            reject(new Error(`Could not get canvas context`));
                        }
                    };
                    image.onerror = (e) => {
                        reject((e as any).error);
                    };
                    image.src = "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svg)));
                });
            })
            .catch(reject);
    });
}

export enum DfaDisplayType {
    Graph,
    EnlargedGraph,
    Formal,
    Markdown,
    Json,
}

export interface DfaProps {
    dfa : DfaDeclaration,
}
export interface DfaState {
    dfa : DfaDeclaration,
    displayType : DfaDisplayType,
}

export class Dfa extends Component<DfaProps, DfaState> {
    private formalJsx : JSX.Element|undefined = undefined;

    public constructor (props : DfaProps) {
        super(props);
        this.state = {
            dfa : props.dfa,
            displayType : DfaDisplayType.Graph,
        };
        this.formalJsx = undefined;
    }
    public componentWillReceiveProps (newProps : DfaProps) {
        this.setState({
            dfa : newProps.dfa,
            displayType : DfaDisplayType.Graph,
        });
        this.formalJsx = undefined;
    }

    private graphContainer : HTMLElement|null = null;
    private graph : vis.Network|undefined = undefined;

    private destroyGraph () {
        if (this.graph != undefined) {
            console.log("destroying graph");
            this.graph.destroy();
            this.graph = undefined;
        }
    }

    private readonly setGraphContainer = async (ele : HTMLElement|null) => {
        console.log("setting graph container");
        if (ele == undefined || ele != this.graphContainer) {
            this.destroyGraph();
        }

        this.graphContainer = ele;
        this.tryInitGraph()
            .then(
                console.log,
                console.error
            );
    };
    private readonly tryInitGraph = async () => {
        if (this.graph != undefined) {
            //Can't have two graphs at once
            return;
        }
        const graphContainer = this.graphContainer;
        if (graphContainer == undefined) {
            //We need a container for the graph
            return;
        }
        console.log("initializing graph");

        const {
            alphabet,
            startState,
            acceptStates,
            transitions,
        } = DfaUtil.removeInvalidTransitions(this.state.dfa);

        const nodes = new vis.DataSet<DfaNode>();
        const edges = new vis.DataSet<DfaEdge>();

        let brightColorIndex = 0;
        for (const transition of transitions) {
            const color = brightColors[brightColorIndex];//"#bcbcbc";//"#128ecc"; //Default color
            brightColorIndex = (brightColorIndex + 1) % brightColors.length;

            nodes.add({
                id: transition.srcState,
                fixed : {
                    x : false,
                    y : false,
                },
                label : transition.srcState,
                color : "#666666",
                font : {
                    color : "#ffffff"
                },
            });
            mj2img(`\\(${transition.srcState}\\)`, color, acceptStates.includes(transition.srcState))
                .then(
                    (result) => {
                        const node = nodes.get(transition.srcState);
                        node.image = result.img;
                        node.shape = "circularImage";
                        node.label = " ";//transition.srcState;
                        (node as any).shapeProperties = {
                            useImageSize : false,
                        };
                        nodes.update(node);
                        if (this.graph != undefined) {
                            this.graph.redraw();
                        }
                    },
                    console.error
                );

            const closed = new Set<string>();
            for (let i=0; i<transition.dstStates.length; ++i) {
                const dstState = transition.dstStates[i];
                if (closed.has(dstState)) {
                    continue;
                }
                closed.add(dstState);

                const labelAlphabet : string[] = [alphabet[i]];
                for (let j=i+1; j<transition.dstStates.length; ++j) {
                    if (transition.dstStates[j] == dstState) {
                        labelAlphabet.push(alphabet[j]);
                    }
                }

                const label = labelAlphabet.join(", ");

                edges.add({
                    from : transition.srcState,
                    to : dstState,
                    id : `${transition.srcState}->${dstState}`,
                    color : {
                        color : color,
                        highlight : color,
                        hover : color
                    },
                    width : 1,
                    label,
                });
            }
        }


        nodes.add({
            id: "start",
            fixed : {
                x : false,
                y : false,
            },
            label : "start",
            color : "green",
            font : {
                color : "#ffffff"
            },
        });

        edges.add({
            from : "start",
            to : startState,
            id : `start->${startState}`,
            color : {
                color : "green",
                highlight : "green",
                hover : "green"
            },
            width : 1,
            label: undefined,
        });

        if (this.graph != undefined) {
            //Somehow, something else set it, wtf
            return;
        }
        if (this.graphContainer != graphContainer) {
            //Somehow, the container changed before we initialized
            //This is no good
            return;
        }

        this.graph = new vis.Network(
            graphContainer,
            {
                nodes : nodes,
                edges : edges,
            },
            {
                physics : {
                    enabled : false,
                },
                layout: {
                    improvedLayout: true,
                    /*
                    hierarchical : {
                        enabled : true,
                        sortMethod : "directed",
                        direction : "LR",
                        nodeSpacing : 200,
                    }*/
                },
                nodes: {
                    shape: "box",
                    size : 25,
                    color : {
                        highlight : {
                            border : "#FFC300"
                        },
                    },
                    mass : 3,
                },
                edges: {
                    arrows: "to",
                    smooth: {
                        enabled: true,
                        type: "curvedCW",
                        //forceDirection: "vertical",
                        roundness: 0.2
                    },
                    length: 300,
                },
                interaction : {
                    hover : true,
                },
            }
        );
    };

    private renderFormal () {
        const {
            name,
            alphabet,
            startState,
            acceptStates,
            transitions,
        } = this.state.dfa;

        //prune states that do not have incoming edges
        const prunedTransitions = DfaUtil.getInvalidTransitions(startState, transitions);

        if (
            this.state.displayType == DfaDisplayType.Formal &&
            this.formalJsx == undefined
        ) {
            this.formalJsx = (
                <div>
                    <MathRenderer
                        math={`${name.length == 0 ? "M" : name} = \\langle Q, \\Sigma, \\delta, q1, F \\rangle`}
                        block={false}
                    />, where
                    <ul>
                        <li>
                            <MathRenderer
                                math={`Q = \\{ ${transitions
                                    .map(t => {
                                        return (
                                            prunedTransitions.some(p => p.srcState == t.srcState) ?
                                            `\\colorbox{red}{\\(${t.srcState}\\)}` :
                                            t.srcState
                                        );
                                    })
                                    .join(", ")
                                } \\}`}
                                block={false}
                            />
                        </li>
                        <li>
                            <MathRenderer
                                math={`\\Sigma = \\{ ${alphabet.join(", ")} \\}`}
                                block={false}
                            />
                        </li>
                        <li>
                            <MathRenderer
                                math={`\\delta =`}
                                block={false}
                            />
                            <table cellPadding={5} style={{
                                borderCollapse : "collapse",
                                textAlign : "center",
                            }}>
                                <thead>
                                    <tr style={{
                                        borderBottom : "solid",
                                    }}>
                                        <th style={{
                                            borderRight : "solid",
                                        }}>

                                        </th>
                                        {
                                            alphabet.map(letter => {
                                                return <th key={letter}>{letter}</th>;
                                            })
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        transitions.map(transition => {
                                            return (
                                                <tr
                                                    key={transition.srcState}
                                                    style={{
                                                        backgroundColor : (
                                                            prunedTransitions.includes(transition) ?
                                                            "red" :
                                                            undefined
                                                        )
                                                    }}
                                                >
                                                    <td style={{
                                                        borderRight : "solid",
                                                    }}>
                                                        <MathRenderer
                                                            math={transition.srcState}
                                                            block={false}
                                                        />
                                                    </td>
                                                    {
                                                        transition.dstStates.map((dstState, index) => {
                                                            return <td key={index}>
                                                                <MathRenderer
                                                                    math={dstState}
                                                                    block={false}
                                                                />
                                                            </td>;
                                                        })
                                                    }
                                                </tr>
                                            );
                                        })
                                    }
                                </tbody>
                            </table>
                        </li>
                        <li>
                            <MathRenderer
                                math={`q_1 = ${startState}`}
                                block={false}
                            />
                        </li>
                        <li>
                            <MathRenderer
                                math={`F = \\{ ${acceptStates
                                    .filter(acceptState => acceptState != "DNE")
                                    .map(acceptState => {
                                        return (
                                            (
                                                prunedTransitions.some(p => p.srcState == acceptState) ||
                                                !transitions.some(t => t.srcState == acceptState)
                                            ) ?
                                            `\\colorbox{red}{\\(${acceptState}\\)}` :
                                            acceptState
                                        );
                                    })
                                    .join(", ")
                                } \\}`}
                                block={false}
                            />
                        </li>
                    </ul>
                </div>
            );
        }
        return this.formalJsx;
    }

    private renderMarkdown (prune : boolean) {
        const {
            name,
            alphabet,
            startState,
            acceptStates,
            transitions,
        } = this.state.dfa;

        //prune states that do not have incoming edges
        const prunedTransitions = DfaUtil.getInvalidTransitions(startState, transitions);

        const lines : string[] = [];
        lines.push(`|Dfa| ${name}`);
        lines.push(alphabet.join(", "));
        lines.push(startState);
        lines.push(acceptStates
            .filter(acceptState => (
                acceptState == "DNE" ||
                (
                    !prunedTransitions.some(p => p.srcState == acceptState) &&
                    transitions.some(t => t.srcState == acceptState)
                )
            ))
            .join(" | ")
        );

        for (const transition of transitions) {
            if (prune && prunedTransitions.includes(transition)) {
                continue;
            }

            lines.push(`${transition.srcState} | ${transition.dstStates.join(" | ")}`);
        }

        return <textarea
            rows={lines.length+2}
            style={{
                width : "100%",
            }}
        >{lines.join("\n")}</textarea>;
    }

    private renderJson (prune : boolean) {
        const dfa = (
            prune ?
            DfaUtil.removeInvalidTransitions(this.state.dfa) :
            this.state.dfa
        );

        const json = JSON.stringify(dfa, null, 2);

        return <textarea
            rows={json.split("\n").length + 2}
            style={{
                width : "100%",
            }}
            value={json}
        ></textarea>;
    }

    public render () {
        return (
            <div>
                <div
                    style={{
                        display : (
                            this.state.displayType == DfaDisplayType.Graph ||
                            this.state.displayType == DfaDisplayType.EnlargedGraph
                        ) ?
                            "block" :
                            "none",
                        width : "100%",
                        backgroundColor:"#000000",
                        border : "2px solid #000000"
                    }}
                >
                    <div
                        style={{
                            position : "absolute",
                            marginLeft : "10px",
                            marginTop : "10px",
                            zIndex : 100,
                        }}
                    >
                        <button className="ui icon big button" onClick={() => {
                            if (this.graph == undefined) {
                                return;
                            }
                            let scale = this.graph.getScale() * (1/0.8);
                            if (this.graph.getScale() < 1 && scale > 1) {
                                scale = 1;
                            }
                            this.graph.moveTo({
                                scale : scale,
                            });
                        }}>
                            <i className="zoom in icon"></i>
                        </button>
                        <br/>
                        <button
                            className="ui icon big button"
                            style={{
                                marginTop : "10px",
                            }}
                            onClick={() => {
                                if (this.graph == undefined) {
                                    return;
                                }
                                let scale = this.graph.getScale() * 0.8;
                                if (this.graph.getScale() > 1 && scale < 1) {
                                    scale = 1;
                                }
                                if (scale < 0.01) {
                                    scale = 0.01;
                                }
                                this.graph.moveTo({
                                    scale : scale,
                                });
                            }}
                        >
                            <i className="zoom out icon"></i>
                        </button>
                    </div>
                    <div
                        ref={this.setGraphContainer}
                        style={{
                            width : "100%",
                            height : (this.state.displayType == DfaDisplayType.EnlargedGraph) ?
                                "720px" :
                                "480px",
                        }}
                    >
                    </div>
                </div>
                <div
                    style={{
                        display : this.state.displayType == DfaDisplayType.Formal ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderFormal()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == DfaDisplayType.Markdown ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderMarkdown(true)}
                </div>
                <div
                    style={{
                        display : this.state.displayType == DfaDisplayType.Json ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderJson(true)}
                </div>
                <div className="ui icon buttons">
                    <select className="ui huge button" onChange={(e) => {
                        if (
                            parseInt(e.target.value, 10) == DfaDisplayType.Graph ||
                            parseInt(e.target.value, 10) == DfaDisplayType.EnlargedGraph
                        ) {
                            this.tryInitGraph()
                                .then(
                                    console.log,
                                    console.error
                                );
                        }
                        this.setState({
                            displayType : parseInt(e.target.value, 10),
                        });
                    }}>
                        <option value={DfaDisplayType.Graph}>Graph</option>
                        <option value={DfaDisplayType.EnlargedGraph}>Enlarged Graph</option>
                        <option value={DfaDisplayType.Formal}>Formal</option>
                        <option value={DfaDisplayType.Markdown}>Markdown</option>
                        <option value={DfaDisplayType.Json}>Json</option>
                    </select>
                </div>
                <br/>
                <br/>
            </div>
        );
    }
}
