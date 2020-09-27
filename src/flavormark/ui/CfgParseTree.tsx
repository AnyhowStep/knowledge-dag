import * as React from "react";
import {Component} from "react";
import {MathRenderer} from "./MathRenderer";
import {getMathJax} from "../interop/MathJax";
import "vis/dist/vis.min.css";
import * as vis from "vis";
import {
    CfgUtil, CfgSubstringType,
} from "../../pushdown-automaton";

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

interface CfgParseTreeNode extends vis.Node {
    font : {
        color : string,
    }
}
interface CfgParseTreeEdge extends vis.Edge {
    color : {
        color : string,
        highlight : string,
        hover : string,
    },
    width : number,
    label : string|undefined,
}

function mj2img (input : string, color : string) : Promise<{ svg : string, img : string }> {
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

export enum CfgParseTreeDisplayType {
    Graph,
    EnlargedGraph,
    Json,
    DerivationFormal,
    DerivationJson,
}

export interface CfgParseTreeProps {
    parseTree : CfgUtil.ParseTreeVariable,
}
export interface CfgParseTreeState {
    parseTree : CfgUtil.ParseTreeVariable,
    displayType : CfgParseTreeDisplayType,
}

export class CfgParseTree extends Component<CfgParseTreeProps, CfgParseTreeState> {
    private derivationJsx : {
        json : JSX.Element,
        formal : JSX.Element,
    }|undefined = undefined;

    public constructor (props : CfgParseTreeProps) {
        super(props);
        this.state = {
            parseTree : props.parseTree,
            displayType : CfgParseTreeDisplayType.Graph,
        };
        this.derivationJsx = undefined;
    }
    public componentWillReceiveProps (newProps : CfgParseTreeProps) {
        this.setState({
            parseTree : newProps.parseTree,
            displayType : CfgParseTreeDisplayType.Graph,
        });
        this.derivationJsx = undefined;
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

        const derivationSteps = CfgUtil.derivationFromParseTreeImpl({
            parseTree : this.state.parseTree,
            result : [],
        });
        const derivation = derivationSteps[derivationSteps.length-1];

        const nodes = new vis.DataSet<CfgParseTreeNode>();
        const edges = new vis.DataSet<CfgParseTreeEdge>();

        let brightColorIndex = 0;

        function getEndTerminals (parseTree : CfgUtil.ParseTree) {
            if (parseTree.subStringType == CfgSubstringType.Terminal) {
                return {
                    left : parseTree,
                    right : parseTree,
                };
            }

            if (parseTree.children.length == 0) {
                throw new Error(`No leftmost terminal found`);
            }

            const leftChild = parseTree.children[0];
            const leftTerminal : CfgUtil.ParseTreeTerminal = (
                leftChild.subStringType == CfgSubstringType.Terminal ?
                leftChild :
                getEndTerminals(leftChild).left
            );


            const rightChild = parseTree.children[parseTree.children.length-1];
            const rightTerminal : CfgUtil.ParseTreeTerminal = (
                rightChild.subStringType == CfgSubstringType.Terminal ?
                rightChild :
                getEndTerminals(rightChild).right
            );

            return {
                left : leftTerminal,
                right : rightTerminal,
            };
        }

        const addParseTree = (
            {
                parseTree,
                curDepth,
            } : {
                parseTree : CfgUtil.ParseTree,
                curDepth : number,
            }
        ) : string => {
            const color = (
                parseTree.subStringType == CfgSubstringType.Terminal ?
                "#666666" :
                brightColors[brightColorIndex++]
            );//"#bcbcbc";//"#128ecc"; //Default color
            brightColorIndex = brightColorIndex % brightColors.length;

            const y = curDepth;
            const {
                left,
                right,
            } = getEndTerminals(parseTree);

            const xMin = derivation.findIndex(d => d == left);
            const xMax = derivation.findIndex(d => d == right);
            const x = (xMin + xMax)/2;

            const label = (
                parseTree.subStringType == CfgSubstringType.Terminal ?
                parseTree.value :
                parseTree.identifier
            );
            const nodeId = `${label}-${x}-${y}`;
            if (xMin == -1 || xMax == -1 || x == -1) {
                console.error(`No x`, parseTree);
            }

            const existingNode = nodes.get(nodeId);
            if (existingNode == undefined) {
                nodes.add({
                    id: nodeId,
                    fixed : {
                        x : false,
                        y : false,
                    },
                    label,
                    //color : "#666666",
                    color,
                    font : {
                        color : "#000000"
                    },
                    x : x * 100,
                    y : y * 100,
                });
            } else {
                console.error(`Node ${nodeId} already exists`, parseTree);
            }
            const mathLabel = (
                parseTree.subStringType == CfgSubstringType.Terminal ?
                (
                    parseTree.value == "" ?
                    `\\varepsilon` :
                    `\\texttt{${parseTree.value}}`
                ) :
                parseTree.identifier
            );

            mj2img(`\\(${mathLabel}\\)`, color)
                .then(
                    (result) => {
                        const node = nodes.get(nodeId);
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

            if (parseTree.subStringType == CfgSubstringType.Variable) {
                for (const child of parseTree.children) {
                    const childId = addParseTree({
                        parseTree : child,
                        curDepth : curDepth + 1,
                    });

                    const edgeId = `${nodeId}->${childId}`;
                    const existingEdge = edges.get(edgeId);
                    if (existingEdge == undefined) {
                        edges.add({
                            from : nodeId,
                            to : childId,
                            id : edgeId,
                            color : {
                                color : color,
                                highlight : color,
                                hover : color
                            },
                            width : 1,
                            label : "",
                        });
                    } else {
                        console.error(`Edge ${edgeId} already exists`, existingEdge);
                    }
                }
            }

            return nodeId;
        };
        addParseTree({
            parseTree : this.state.parseTree,
            curDepth : 0,
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
                    //improvedLayout: true,
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
                        type: "horizontal",
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

    private renderJson () {
        const parseTree = this.state.parseTree;

        const json = JSON.stringify(parseTree, null, 2);

        return <textarea
            rows={json.split("\n").length + 2}
            style={{
                width : "100%",
            }}
            value={json}
        ></textarea>;
    }

    private tryInitDerivationJsx () : {
        json : JSX.Element|undefined,
        formal : JSX.Element|undefined,
    } {
        if (this.derivationJsx == undefined) {
            if (
                this.state.displayType == CfgParseTreeDisplayType.DerivationFormal ||
                this.state.displayType == CfgParseTreeDisplayType.DerivationJson
            ) {
                const derivation = CfgUtil.derivationFromParseTree({
                    parseTree : this.state.parseTree,
                });
                const derivationJson = JSON.stringify(derivation, null, 2);

                const derivationStr = derivation
                    .map((string, index) => {
                        const step = string
                            .map(subStr => {
                                if (subStr.subStringType == CfgSubstringType.Terminal) {
                                    if (subStr.value == "") {
                                        return `\\varepsilon`;
                                    } else {
                                        return `\\texttt{${subStr.value}}`;
                                    }
                                } else {
                                    return subStr.identifier;
                                }
                            })
                            .join("\\,");
                        if (index == 0) {
                            return step;
                        } else {
                            return `\\Rightarrow ${step}`;
                        }
                    })
                    .join("\\\\\n");
                const derivationLines = [
                    `\\begin{array}{l}`,
                    derivationStr,
                    `\\end{array}`
                ];

                this.derivationJsx = {
                    json : (
                        <textarea
                            rows={Math.min(20, derivationJson.split("\n").length+2)}
                            style={{
                                width : "100%",
                            }}
                            value={derivationJson}
                        />
                    ),
                    formal : (
                        <MathRenderer
                            math={derivationLines.join("\n")}
                            block={true}
                        />
                    ),
                };
                return this.derivationJsx;
            } else {
                return {
                    json : undefined,
                    formal : undefined,
                };
            }
        } else {
            return this.derivationJsx;
        }
    }
    private renderDerivationFormal () {
        return this.tryInitDerivationJsx().formal;
    }
    private renderDerivationJson () {
        return this.tryInitDerivationJsx().json;
    }

    public render () {
        return (
            <div>
                <div
                    style={{
                        display : (
                            this.state.displayType == CfgParseTreeDisplayType.Graph ||
                            this.state.displayType == CfgParseTreeDisplayType.EnlargedGraph
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
                            height : (this.state.displayType == CfgParseTreeDisplayType.EnlargedGraph) ?
                                "720px" :
                                "480px",
                        }}
                    >
                    </div>
                </div>
                <div
                    style={{
                        display : this.state.displayType == CfgParseTreeDisplayType.Json ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderJson()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == CfgParseTreeDisplayType.DerivationFormal ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderDerivationFormal()}
                </div>
                <div
                    style={{
                        display : this.state.displayType == CfgParseTreeDisplayType.DerivationJson ?
                            "block" :
                            "none"
                    }}
                >
                    {this.renderDerivationJson()}
                </div>
                <div className="ui icon buttons">
                    <select className="ui huge button" onChange={(e) => {
                        if (
                            parseInt(e.target.value, 10) == CfgParseTreeDisplayType.Graph ||
                            parseInt(e.target.value, 10) == CfgParseTreeDisplayType.EnlargedGraph
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
                        <option value={CfgParseTreeDisplayType.Graph}>Graph</option>
                        <option value={CfgParseTreeDisplayType.EnlargedGraph}>Enlarged Graph</option>
                        <option value={CfgParseTreeDisplayType.Json}>Json</option>
                        <option value={CfgParseTreeDisplayType.DerivationFormal}>Derivation Formal</option>
                        <option value={CfgParseTreeDisplayType.DerivationJson}>Derivation Json</option>
                    </select>
                </div>
                <br/>
                <br/>
            </div>
        );
    }
}
