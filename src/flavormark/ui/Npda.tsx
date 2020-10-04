import * as React from "react";
import {Component} from "react";
import {MathRenderer} from "./MathRenderer";
import {getMathJax} from "../interop/MathJax";
import "vis/dist/vis.min.css";
import * as vis from "vis";
import {NpdaUtil, NpdaDeclaration} from "../../pushdown-automaton";

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

interface NpdaNode extends vis.Node {
    font : {
        color : string,
    }
}
interface NpdaEdge extends vis.Edge {
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

export enum NpdaDisplayType {
    Graph,
    EnlargedGraph,
    Formal,
    Markdown,
    Json,
    Language10,
}

export interface NpdaProps {
    npda : NpdaDeclaration,
}
export interface NpdaState {
    npda : NpdaDeclaration,
    displayType : NpdaDisplayType,
}

export class Npda extends Component<NpdaProps, NpdaState> {
    private formalJsx : JSX.Element|undefined = undefined;
    private language10Jsx : JSX.Element|undefined = undefined;

    public constructor (props : NpdaProps) {
        super(props);
        this.state = {
            npda : props.npda,
            displayType : NpdaDisplayType.Graph,
        };
        this.formalJsx = undefined;
        this.language10Jsx = undefined;
    }
    public componentWillReceiveProps (newProps : NpdaProps) {
        this.setState({
            npda : newProps.npda,
            displayType : NpdaDisplayType.Graph,
        });
        this.formalJsx = undefined;
        this.language10Jsx = undefined;
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
            stringAlphabet,
            stackAlphabet,
            startState,
            acceptStates,
            transitions,
        } = this.state.npda;

        const nodes = new vis.DataSet<NpdaNode>();
        const edges = new vis.DataSet<NpdaEdge>();

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

            const map = new Map<string, string[]>();
            transition.dstStateSetCollection.forEach((stackIo, stringInputIndex) => {
                const stringInputLetter = (
                    stringInputIndex < stringAlphabet.length ?
                    stringAlphabet[stringInputIndex] :
                    "ε"
                );
                stackIo.forEach((stackO, stackInputIndex) => {
                    const stackInputLetter = (
                        stackInputIndex < stackAlphabet.length ?
                        stackAlphabet[stackInputIndex] :
                        "ε"
                    );
                    stackO.forEach((dstStateSet, stackOutputIndex) => {
                        const stackOutputLetter = (
                            stackOutputIndex < stackAlphabet.length ?
                            stackAlphabet[stackOutputIndex] :
                            "ε"
                        );
                        for (const dstState of dstStateSet) {
                            let labels = map.get(dstState);
                            if (labels == undefined) {
                                labels = [];
                                map.set(dstState, labels);
                            }
                            labels.push(`(${stringInputLetter}, ${stackInputLetter}, ${stackOutputLetter})`);
                        }
                    });
                });
            });

            for (const [dstState, labels] of map) {
                const label = labels.join(", ");
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
            stringAlphabet,
            stackAlphabet,
            startState,
            acceptStates,
            transitions,
        } = this.state.npda;

        if (
            this.state.displayType == NpdaDisplayType.Formal &&
            this.formalJsx == undefined
        ) {
            this.formalJsx = (
                <div>
                    <MathRenderer
                        math={`${name.length == 0 ? "P" : name} = \\langle Q, \\Sigma, \\Gamma, \\delta, q_1, F \\rangle`}
                        block={false}
                    />, where
                    <ul>
                        <li>
                            <MathRenderer
                                math={`Q = \\{ ${transitions
                                    .map(t => t.srcState)
                                    .join(", ")
                                } \\}`}
                                block={false}
                            />
                        </li>
                        <li>
                            <MathRenderer
                                math={`\\Sigma = \\{ ${stringAlphabet.join(", ")} \\}`}
                                block={false}
                            />
                        </li>
                        <li>
                            <MathRenderer
                                math={`\\Gamma = \\{ ${stackAlphabet.join(", ")} \\}`}
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
                                            String:
                                        </th>
                                        {
                                            [...stringAlphabet, "ε"].map(letter => {
                                                return <th
                                                    key={letter}
                                                    colSpan={stackAlphabet.length+1}
                                                    style={{
                                                        borderRight : "solid",
                                                    }}
                                                >
                                                    {letter}
                                                </th>;
                                            })
                                        }
                                    </tr>
                                    <tr style={{
                                        borderBottom : "solid",
                                    }}>
                                        <th style={{
                                            borderRight : "solid",
                                        }}>
                                            Stack:
                                        </th>
                                        {
                                            ([] as JSX.Element[]).concat(
                                                ...[...stringAlphabet, "ε"].map(stringLetter => {
                                                    return [...stackAlphabet, "ε"].map(stackLetter => {
                                                        return <th
                                                            key={`${stringLetter}-${stackLetter}`}
                                                            style={{
                                                                borderRight : "solid",
                                                            }}
                                                        >
                                                            {stackLetter}
                                                        </th>;
                                                    });
                                                })
                                            )
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        transitions.map(transition => {
                                            return (
                                                <tr
                                                    key={transition.srcState}
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
                                                        ([] as JSX.Element[]).concat(
                                                            ...transition.dstStateSetCollection.map((stackIo, index0) => {
                                                                return ([] as JSX.Element[]).concat(
                                                                    ...stackIo.map((stackO, index1) => {
                                                                        const arr = ([] as string[])
                                                                            .concat(
                                                                                ...stackO.map((dstStateSet, stackOutputIndex) => {
                                                                                    const stackOutputLetter = (
                                                                                        stackOutputIndex < stackAlphabet.length ?
                                                                                        stackAlphabet[stackOutputIndex] :
                                                                                        "\\varepsilon"
                                                                                    );
                                                                                    return dstStateSet
                                                                                        .map(dstState => {
                                                                                            return `(${dstState}, ${stackOutputLetter})`;
                                                                                        });
                                                                                })
                                                                            );
                                                                        return <td key={`${index0}-${index1}`}>
                                                                            {
                                                                                arr.length == 0 ?
                                                                                "" :
                                                                                <MathRenderer
                                                                                    math={`\\{ ${arr.join(", ")} \\}`}
                                                                                    block={false}
                                                                                />
                                                                            }
                                                                        </td>;
                                                                    })
                                                                );
                                                            })
                                                        )
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
                                    .map(acceptState => acceptState)
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

    private renderMarkdown () {
        const {
            name,
            stringAlphabet,
            stackAlphabet,
            startState,
            acceptStates,
            transitions,
        } = this.state.npda;

        const lines : string[] = [];
        lines.push(`|Npda| ${name}`);
        lines.push(stringAlphabet.join(", "));
        lines.push(stackAlphabet.join(", "));
        lines.push(startState);
        lines.push(acceptStates
            .filter(acceptState => (
                acceptState == "DNE" ||
                transitions.some(t => t.srcState == acceptState)
            ))
            .join(" | ")
        );

        for (const transition of transitions) {
            for (let stringInputIndex = 0; stringInputIndex < transition.dstStateSetCollection.length; ++stringInputIndex) {
                const stackIo = transition.dstStateSetCollection[stringInputIndex];
                const stringInputLetter = (
                    stringInputIndex < stringAlphabet.length ?
                    stringAlphabet[stringInputIndex] :
                    "\\varepsilon"
                );
                for (let stackInputIndex = 0; stackInputIndex < stackIo.length; ++stackInputIndex) {
                    const stackO = stackIo[stackInputIndex];
                    const stackInputLetter = (
                        stackInputIndex < stackAlphabet.length ?
                        stackAlphabet[stackInputIndex] :
                        "\\varepsilon"
                    );
                    for (let stackOutputIndex = 0; stackOutputIndex < stackO.length; ++stackOutputIndex) {
                        const dstStateSet = stackO[stackOutputIndex];
                        const stackOutputLetter = (
                            stackOutputIndex < stackAlphabet.length ?
                            stackAlphabet[stackOutputIndex] :
                            "\\varepsilon"
                        );
                        for (const dstState of dstStateSet) {
                            lines.push(`${transition.srcState} | ${dstState} | ${stringInputLetter} | ${stackInputLetter} | ${stackOutputLetter}`);
                        }
                    }
                }
            }
        }

        return <textarea
            rows={lines.length+2}
            style={{
                width : "100%",
            }}
        >{lines.join("\n")}</textarea>;
    }

    private renderJson () {
        const npda = this.state.npda;

        const json = JSON.stringify(npda, null, 2);

        return <textarea
            rows={json.split("\n").length + 2}
            style={{
                width : "100%",
            }}
            value={json}
        ></textarea>;
    }

    private renderLanguage10 () {
        if (
            this.state.displayType == NpdaDisplayType.Language10 &&
            this.language10Jsx == undefined
        ) {
            const npda = this.state.npda;
            const language10 = NpdaUtil.generateLanguage({
                npda,
                maxLength : 10,
                maxStep : 20,
            });

            this.language10Jsx = <textarea
                rows={Math.floor(language10.size / 7)+2}
                style={{
                    width : "100%",
                }}
                value={[...language10].map(s => JSON.stringify(s)).join(", ")}
            />;
        }

        return this.language10Jsx;
    }

    public render () {
        return (
            <div>
                <div
                    style={{
                        display : (
                            this.state.displayType == NpdaDisplayType.Graph ||
                            this.state.displayType == NpdaDisplayType.EnlargedGraph
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
                            height : (this.state.displayType == NpdaDisplayType.EnlargedGraph) ?
                                "720px" :
                                "480px",
                        }}
                    >
                    </div>
                </div>
                <div
                    style={{
                        display : this.state.displayType == NpdaDisplayType.Formal ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderFormal()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == NpdaDisplayType.Markdown ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderMarkdown()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == NpdaDisplayType.Json ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderJson()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == NpdaDisplayType.Language10 ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderLanguage10()}
                </div>
                <div className="ui icon buttons">
                    <select className="ui huge button" onChange={(e) => {
                        if (
                            parseInt(e.target.value, 10) == NpdaDisplayType.Graph ||
                            parseInt(e.target.value, 10) == NpdaDisplayType.EnlargedGraph
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
                        <option value={NpdaDisplayType.Graph}>Graph</option>
                        <option value={NpdaDisplayType.EnlargedGraph}>Enlarged Graph</option>
                        <option value={NpdaDisplayType.Formal}>Formal</option>
                        <option value={NpdaDisplayType.Markdown}>Markdown</option>
                        <option value={NpdaDisplayType.Json}>Json</option>
                        <option value={NpdaDisplayType.Language10}>Language10</option>
                    </select>
                </div>
                <br/>
                <br/>
            </div>
        );
    }
}
