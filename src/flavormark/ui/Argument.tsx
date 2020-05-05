import * as React from "react";
import {Component} from "react";
import {MathRenderer} from "./MathRenderer";
import {getMathJax} from "../interop/MathJax";
import {calculateDirectParents} from "../../dag";
import {calculateDepths} from "../../dag";
import "vis/dist/vis.min.css";
import * as vis from "vis";

interface ArgumentNode extends vis.Node {
    font : {
        color : string,
    }
}
interface ArgumentEdge extends vis.Edge {
    color : {
        color : string,
        highlight : string,
        hover : string,
    },
    width : number,
}

const brightColors = [
    "#800000", //Maroon
    "#9a6324", //Brown
    "#808000", //Olive
    "#469990", //Teal
    "#000075", //Navy
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
                        const canvas = document.createElement('canvas');
                        canvas.width = image.width;
                        canvas.height = image.height;
                        const context = canvas.getContext('2d');
                        if (context != undefined) {
                            context.drawImage(image, 0, 0);
                            context.fillStyle = color;
                            context.globalCompositeOperation = "source-in";
                            context.fillRect(0, 0, image.width, image.height);
                            resolve({
                                svg : 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace(/currentColor/g, color)),
                                img : canvas.toDataURL('image/png'),
                            });
                        } else {
                            reject(new Error(`Could not get canvas context`));
                        }
                    };
                    image.onerror = (e) => {
                        reject((e as any).error);
                    };
                    image.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svg)));
                });
            })
            .catch(reject);
    });
}

export interface Inference {
    math : string,
    description : string,
    dependsOn : number[],
}

export enum ArgumentDisplayType {
    Normal,
    Latex,
    Graph,
    EnlargedGraph,
    Edit,
    Text,
}

export interface ArgumentEditOptions {
    onUpdate : (inferences : Inference[]) => void;
    onStep : (step : number) => void;
}

export interface ArgumentProps {
    inferences : Inference[],
}
export interface ArgumentState {
    inferences : Inference[],
    step : number,
    displayType : ArgumentDisplayType,
}

export function deepCopyInferences (src : Inference[]) : Inference[] {
    const result : Inference[] = [];
    for (let i of src) {
        result.push({
            math : i.math,
            description : i.description,
            dependsOn : i.dependsOn.slice(),
        });
    }
    return result;
}
export function switchInference (src : Inference[], a : number, b : number) : Inference[] {
    const result = deepCopyInferences(src);

    const tmp = result[a];
    result[a] = result[b];
    result[b] = tmp;

    for (let line of result) {
        for (let i=0; i<line.dependsOn.length; ++i) {
            if (line.dependsOn[i] == a) {
                line.dependsOn[i] = b;
            } else if (line.dependsOn[i] == b) {
                line.dependsOn[i] = a;
            }
        }
        line.dependsOn.sort((a, b) => a-b);
    }
    return result;
}
export function deleteInference (src : Inference[], x : number) : Inference[] {
    const result = deepCopyInferences(src);
    result.splice(x, 1);

    for (let line of result) {
        line.dependsOn = line.dependsOn.filter(i=>i != x);
        for (let i=0; i<line.dependsOn.length; ++i) {
            if (line.dependsOn[i] > x) {
                --line.dependsOn[i];
            }
        }
        line.dependsOn.sort((a, b) => a-b);
    }
    return result;
}
export function hasDependants (src : Inference[], x : number) : boolean {
    for (let line of src) {
        if (line.dependsOn.indexOf(x) >= 0) {
            return true;
        }
    }
    return false;
}
export function maxDependency (line : Inference) : number {
    if (line.dependsOn.length <= 0) {
        return -1;
    }
    let max = line.dependsOn[0];
    for (let i of line.dependsOn) {
        if (i > max) {
            max = i;
        }
    }
    return max;
}
export function minDependant (src : Inference[], x : number) : number {
    let min = Infinity;
    for (let i=0; i<src.length; ++i) {
        const line = src[i];
        if (line.dependsOn.indexOf(x) >= 0 && i<min) {
            min = i;
        }
    }
    return min;
}

export function toggleDependency (src : Inference[], step : number, dependency : number) : Inference[] {
    const result = deepCopyInferences(src);
    const line = result[step];
    const dependencyIndex = line.dependsOn.indexOf(dependency);
    if (dependencyIndex < 0) {
        line.dependsOn.push(dependency);
        line.dependsOn.sort((a, b) => a-b);
    } else {
        line.dependsOn.splice(dependencyIndex, 1);
        line.dependsOn.sort((a, b) => a-b);
    }
    return result;
}

export function hasConsecutiveDependency (inferences : Inference[], lineIndex : number) : boolean {
    const line = inferences[lineIndex];
    //Sort in descending order, we normally do ascending but this is special
    const dependsOn = line.dependsOn
        .slice()
        .sort((a, b) => b-a)
        .filter((d) => {
            return !/^\s*(\$\s*\\texttt\{\s*)?(Premise|Assume)/i.test(inferences[d].description);
        });

    let prv = lineIndex;
    for (let cur of dependsOn) {
        if (cur != prv-1) {
            //Not consecutive, but we allow the special case where
            //the line could not move down any further
            if (cur+1 != minDependant(inferences, cur)) {
                return false;
            }
        }
        prv = cur;
    }
    return true;
}

export class Argument extends Component<ArgumentProps, ArgumentState> {
    public constructor (props : ArgumentProps) {
        super(props);
        this.state = {
            inferences : props.inferences,
            step : 0,
            displayType : ArgumentDisplayType.Normal,
        };
    }
    public componentWillReceiveProps (newProps : ArgumentProps) {
        this.setState({
            inferences : newProps.inferences,
            step : 0,
            displayType : ArgumentDisplayType.Normal,
        });
    }
    public static RenderDescription (str : string) : JSX.Element|string {
        str = str.trim();
        const mathMatch = /^\$(.*[^\\])\$$/.exec(str);
        if (mathMatch == null) {
            return str;
        } else {
            return <MathRenderer math={mathMatch[1]} block={false}/>;
        }
    }
    public static RenderDependsOn (dependsOn : number[], inferenceIndex : number) : JSX.Element[] {
        const result : JSX.Element[] = [];
        dependsOn = dependsOn.sort((a, b) => a-b);
        for (let i=0; i<dependsOn.length; ++i) {
            const cur = dependsOn[i];
            const text = (i == 0) ?
                (cur+1) :
                ", " + (cur+1);
            result.push(
                <span style={{
                    backgroundColor : (cur >= inferenceIndex) ?
                        "red" : "initial",
                }} key={text}>{text}</span>
            );
        }
        return result;
    }

    public static FindConclusionStart (inferences : Inference[]) {
        let caseCount = 0;

        for (let i=0; i<inferences.length; ++i) {
            if (/Case\s*\d+/.test(inferences[i].description)) {
                ++caseCount;
            }

            if (/^\s*\\therefore/.test(inferences[i].math)) {
                if (caseCount == 0) {
                    return i;
                }
                if (caseCount > 0) {
                    --caseCount;
                }
            }
        }

        let conclusionStart = inferences.length-1;
        while (
            conclusionStart-1 >= 0 &&
            /^\s*\\therefore/.test(inferences[conclusionStart-1].math)
        ) {
            --conclusionStart;
        }
        return conclusionStart;
    }

    public static RenderInferences (inferences : Inference[], step : number, editOptions? : ArgumentEditOptions) : JSX.Element[] {
        if (inferences.length == 0) {
            return [];
        }

        const result : JSX.Element[] = [];

        const current = inferences[step];

        let conclusionStart = Argument.FindConclusionStart(inferences);

        for (let i=0; i<inferences.length; ++i) {
            const hide = (i > step);
            const renderMath = (i <= step + 1);
            const dependedOn = (current.dependsOn.indexOf(i) >= 0);

            const inference = inferences[i];

            const renderEditControls = () : JSX.Element|undefined => {
                return editOptions == undefined ?
                    undefined :
                    <td>
                        <button className="ui icon huge button" onClick={() => {
                            if (i == 0) {
                                return;
                            }
                            if (i-1 <= maxDependency(inferences[i])) {
                                if (!confirm("Go above dependency?")) {
                                    return;
                                }
                            }
                            editOptions.onUpdate(switchInference(inferences, i, i-1));
                        }}>
                            <i className="arrow up icon"></i>
                        </button>
                        <button className="ui icon huge button" onClick={() => {
                            if (i == inferences.length-1) {
                                return;
                            }
                            if (i+1 >= minDependant(inferences, i)) {
                                if (!confirm("Go below dependant?")) {
                                    return;
                                }
                            }
                            editOptions.onUpdate(switchInference(inferences, i, i+1));
                            if (i+1 > step) {
                                editOptions.onStep(i+1);
                            }
                        }}>
                            <i className="arrow down icon"></i>
                        </button>
                        <button className="ui icon huge button" onClick={() => {
                            const warning = hasDependants(inferences, i) ?
                                "This inference has dependants" :
                                "";
                            if (confirm(`Delete? ${warning}`)) {
                                editOptions.onUpdate(deleteInference(inferences, i));
                                if (step >= inferences.length-1) {
                                    editOptions.onStep(inferences.length-2);
                                } else if (i >= step) {
                                    editOptions.onStep(step-1);
                                }
                            }
                        }}>
                            <i className="trash icon"></i>
                        </button>
                    </td>
            }
            result.push(
                <tr key={`${i}`} style={{
                    display : (hide || dependedOn) ? "none" : "table-row"
                }}>
                    <td>
                        {
                            editOptions == undefined ?
                                (i+1) :
                                <button className="ui medium button" onClick={() => {
                                    editOptions.onUpdate(toggleDependency(inferences, step, i));
                                }}>{(i+1)}</button>
                        }
                    </td>
                    <td>
                        <MathRenderer
                            math={inference.math}
                            block={false}
                            renderMath={renderMath}
                        />
                    </td>
                    <td>
                        {Argument.RenderDescription(inference.description)}
                        {
                            (
                                hasDependants(inferences, i) ||
                                i >= conclusionStart
                            ) ?
                                undefined :
                                <div>
                                    <span className="ui red label">This inference has no dependants</span>
                                </div>
                        }
                        {
                            (
                                hasConsecutiveDependency(inferences, i) ||
                                inference.description.indexOf("Proof by Cases") >= 0 ||
                                inference.description.indexOf("Rule of Implication") >= 0
                            ) ?
                                undefined :
                                <div>
                                    <span className="ui yellow label">This inference does not have consecutive dependencies</span>
                                </div>
                        }
                    </td>
                    <td>{Argument.RenderDependsOn(inference.dependsOn, i)}</td>
                    {renderEditControls()}
                </tr>
            );
            result.push(
                <tr key={`${i}-highlight`} style={{
                    display : (hide || !dependedOn) ? "none" : "table-row"
                }}>
                    <td>
                        {
                            editOptions == undefined ?
                                (i+1) :
                                <button className="ui medium button" onClick={() => {
                                    editOptions.onUpdate(toggleDependency(inferences, step, i));
                                }}>{(i+1)}</button>
                        }
                    </td>
                    <td>
                        <MathRenderer
                            math={`\\colorbox{yellow}{\\(${inference.math}\\)}`}
                            block={false}
                            renderMath={renderMath}
                        />
                    </td>
                    <td>
                        {Argument.RenderDescription(inference.description)}
                        {
                            (
                                hasDependants(inferences, i) ||
                                i >= conclusionStart
                            ) ?
                                undefined :
                                <div>
                                    <span className="ui red label">This inference has no dependants</span>
                                </div>
                        }
                        {
                            (
                                hasConsecutiveDependency(inferences, i) ||
                                inference.description.indexOf("Proof by Cases") >= 0 ||
                                inference.description.indexOf("Rule of Implication") >= 0
                            ) ?
                                undefined :
                                <div>
                                    <span className="ui yellow label">This inference does not have consecutive dependencies</span>
                                </div>
                        }
                    </td>
                    <td>{Argument.RenderDependsOn(inference.dependsOn, i)}</td>
                    {renderEditControls()}
                </tr>
            );
        }
        return result;
    }
    public back = () => {
        this.setState({
            step : (this.state.step <= 0) ?
                0 :
                this.state.step - 1,
        });
    }
    public forward = () => {
        this.setState({
            step : (this.state.step >= this.state.inferences.length-1) ?
                this.state.inferences.length - 1 :
                this.state.step + 1,
        });
    }
    public first = () => {
        this.setState({
            step : 0,
        });
    }
    public last = () => {
        this.setState({
            step : this.state.inferences.length - 1,
        });
    }
    public toggleDisplay = () => {
        this.setState({
            displayType : (this.state.displayType+1)%4,
        });
    };
    private renderInferences () {
        return Argument.RenderInferences(
            this.state.inferences,
            this.state.step
        );
    }
    private static RenderLatex (inferences : Inference[]) {
        const conclusionStart = Argument.FindConclusionStart(inferences);

        const lines : string[] = [];
        lines.push(`\\begin{array}{llll}`);
        for (let i=0; i<inferences.length; ++i) {
            const inference = inferences[i];

            const step = i+1;
            const math = inference.math.trim();
            let description = inference.description.trim();
            const dependsOn = inference.dependsOn.map(i => i+1).sort((a, b) => a-b).join(", ");

            {
                const mathMatch = /^\$(.*[^\\])\$$/.exec(description);
                if (mathMatch == null) {
                    description = `\\texttt{${description}}`;
                } else {
                    description = mathMatch[1].trim();
                }
            }

            if (i == conclusionStart) {
                lines.push("\\hline");
            }

            const line = [step, math, description, dependsOn];
            lines.push(line.join(" & ") + "\\\\");
        }
        lines.push(`\\end{array}`);
        return lines.join("\n");
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
        if (ele == undefined || ele != this.graphContainer) {
            this.destroyGraph();
        }
        this.graphContainer = ele;
    }
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

        const directParents : { [line : number] : undefined|string[] } = {};
        const directChildren : { [line : number] : undefined|string[] } = {};

        const inferences = this.state.inferences;

        const allRoot = new Set<string>();
        const allLeaf = new Set<string>();
        const allNode = new Set<string>();

        for (let line=0; line<inferences.length; ++line) {
            if (allNode.has(line.toString())) {
                continue;
            }
            const {root, leaf, node} = await calculateDirectParents({
                id : "0",
                fetchAllParent : async (line) => {
                    const result : string[] = [];
                    for (let i=0; i<inferences.length; ++i) {
                        if (i.toString() == line) {
                            continue;
                        }
                        if (inferences[i].dependsOn.indexOf(Number(line)) >= 0) {
                            result.push(i.toString());
                        }
                    }
                    return result;
                },
                fetchAllChild : async (line) => {
                    return inferences[Number(line)].dependsOn.map(i => i.toString());
                },
                setDirectParent : async (line, parent, direct) => {
                    let parents = directParents[Number(line)];
                    if (parents == undefined) {
                        parents = [];
                        directParents[Number(line)] = parents;
                    }
                    let children = directChildren[Number(parent)];
                    if (children == undefined) {
                        children = [];
                        directChildren[Number(parent)] = children;
                    }

                    if (direct) {
                        parents.push(parent);
                        children.push(line);
                    } else {
                        const parentIndex = parents.indexOf(parent);
                        if (parentIndex >= 0) {
                            parents.splice(parentIndex, 1);
                        }
                        const childIndex = children.indexOf(line);
                        if (childIndex >= 0) {
                            children.splice(childIndex, 1);
                        }
                    }
                },
            });
            for (let line of root) {
                allRoot.add(line);
            }
            for (let line of leaf) {
                allLeaf.add(line);
            }
            for (let line of node) {
                allNode.add(line);
            }
        }

        const depths = await calculateDepths({
            root : allRoot,
            leaf : allLeaf,
            fetchAllDirectParent : async (line) => {
                const result = directParents[Number(line)];
                if (result == undefined) {
                    return [];
                } else {
                    return result;
                }
            },
            fetchAllDirectChild : async (line) => {
                const result = directChildren[Number(line)];
                if (result == undefined) {
                    return [];
                } else {
                    return result;
                }
            },
        });

        let maxDepth = -1;
        for (let depth of depths.values()) {
            if (depth > maxDepth) {
                maxDepth = depth;
            }
        }
        for (let line of depths.keys()) {
            const depth = depths.get(line);
            if (depth == undefined) {
                continue;
            }
            depths.set(line, maxDepth-depth);
        }

        const nodes = new vis.DataSet<ArgumentNode>();
        const edges = new vis.DataSet<ArgumentEdge>();

        let brightColorIndex = 0;
        for (let line=0; line<inferences.length; ++line) {
            const depth = depths.get(String(line));
            const x = line * 100;
            const y = (depth == undefined) ?
                0 : depth * 300;
            nodes.add({
                id: line,
                x : y,
                y : x,
                fixed : {
                    x : false,
                    y : false,
                },
                label : `${inferences[line].math}\n${line+1} - ${inferences[line].description}`,
                color : "#666666",
                font : {
                    color : "#ffffff"
                },
            });
            mj2img(`\\(${inferences[line].math}\\)`, "#ffffff")
                .then((result) => {
                    const node = nodes.get(line);
                    node.image = result.svg;
                    node.shape = "image";
                    node.label = `${line+1} - ${inferences[line].description}`;
                    nodes.update(node);
                });

            let color = "#bcbcbc";//"#128ecc"; //Default color
            if (inferences[line].dependsOn.length > 1) {
                color = brightColors[brightColorIndex];
                brightColorIndex = (brightColorIndex + 1) % brightColors.length;
            }
            for (let parent of inferences[line].dependsOn) {
                /*const color = (
                    /Rule of Implication/.test(inferences[line].description) ?
                    "#ef0000" :
                    /Proof by Cases/.test(inferences[line].description) ?
                    "#e87b00" :
                    /Premise/.test(inferences[parent].description) ?
                    "#7700ff" :
                    /Assume/.test(inferences[parent].description) ?
                    "#0021b5" :
                    "#128ecc"
                );*/
                edges.add({
                    from : parent,
                    to : line,
                    id : `${parent}->${line}`,
                    color : {
                        color : color,
                        highlight : color,
                        hover : color
                    },
                    width : 2,
                });
            }
        }

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
                    /*hierarchicalRepulsion: {
                        nodeDistance: 200,
                        springLength: 300,
                        damping: 0.09,
                        springConstant:0.01
                    },
                    solver: "hierarchicalRepulsion",
                    repulsion: {
                        nodeDistance: 300,
                        springLength: 300,
                        springConstant: 0.01
                    },*/
                    //timestep:1,
                    //maxVelocity: 10
                },
                layout: {
                    improvedLayout: true,
                    /*hierarchical : {
                        enabled : true,
                        sortMethod : "directed",
                        direction : "UD",
                    }*/
                },
                nodes: {
                    shape: "box",
                    size : 10,
                    color : {
                        highlight : {
                            border : "#FFC300"
                        },
                    }
                },
                edges: {
                    arrows: "to",
                    smooth: {
                        enabled: true,
                        type: "vertical",
                        forceDirection: "vertical",
                        roundness: 0.2
                    }
                },
                interaction : {
                    hover : true,
                },
            }
        );
    };
    public toArgumentString () : string {
        const result : string[] = [
            "|Argument|"
        ];
        for (let i of this.state.inferences) {
            const line = [
                i.math.replace(/\|/g, "\\\|"),
                i.description.replace(/\|/g, "\\\|"),
                i.dependsOn.map(d=>(d+1)).join(",")
            ];
            result.push(line.join(" | "));
        }
        return result.join("\n");
    }
    private renderEdit () {
        return (
            <table
                className="ui celled unstackable table"
            >
                <thead>
                    <tr>
                        <th>Line</th>
                        <th>Statement</th>
                        <th>Description</th>
                        <th>Depends On</th>
                        <th>Control</th>
                    </tr>
                </thead>
                <tbody>
                    {Argument.RenderInferences(
                        this.state.inferences,
                        this.state.step,
                        {
                            onUpdate : (inferences) => {
                                this.destroyGraph();
                                this.setState({
                                    inferences : inferences,
                                });
                            },
                            onStep : (step) => {
                                this.setState({
                                    step : step,
                                });
                            },
                        }
                    )}
                </tbody>
            </table>
        );
    }
    public render () {
        const displayStepControls = (
            this.state.displayType == ArgumentDisplayType.Normal ||
            this.state.displayType == ArgumentDisplayType.Edit
        )
        return (
            <div>
                <table
                    style={{
                        display : this.state.displayType == ArgumentDisplayType.Normal ?
                            "table" :
                            "none"
                    }}
                    className="ui celled unstackable table"
                >
                    <thead>
                        <tr>
                            <th>Line</th>
                            <th>Statement</th>
                            <th>Description</th>
                            <th>Depends On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderInferences()}
                    </tbody>
                </table>
                <MathRenderer
                    math={Argument.RenderLatex(this.state.inferences)}
                    block={false}
                    renderMath={this.state.displayType == ArgumentDisplayType.Latex}
                    style={{
                        display : this.state.displayType == ArgumentDisplayType.Latex ?
                            "block" :
                            "none"
                    }}
                />
                <div
                    style={{
                        display : (
                            this.state.displayType == ArgumentDisplayType.Graph ||
                            this.state.displayType == ArgumentDisplayType.EnlargedGraph
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
                            height : (this.state.displayType == ArgumentDisplayType.EnlargedGraph) ?
                                "720px" :
                                "480px",
                        }}
                    >
                    </div>
                </div>
                {
                    this.state.displayType == ArgumentDisplayType.Edit ?
                        this.renderEdit() :
                        undefined
                }
                <textarea
                    style={{
                        display : this.state.displayType == ArgumentDisplayType.Text ?
                            "block" :
                            "none",
                        width : "100%"
                    }}
                    rows={this.state.inferences.length+1}
                    value={this.toArgumentString()}
                    readOnly={true}
                ></textarea>
                <div className="ui icon buttons">
                    <select className="ui huge button" onChange={(e) => {
                        if (
                            parseInt(e.target.value) == ArgumentDisplayType.Graph ||
                            parseInt(e.target.value) == ArgumentDisplayType.EnlargedGraph
                        ) {
                            this.tryInitGraph();
                        }
                        this.setState({
                            displayType : parseInt(e.target.value),
                        });
                    }}>
                        <option value={ArgumentDisplayType.Normal}>Normal</option>
                        <option value={ArgumentDisplayType.Latex}>Latex</option>
                        <option value={ArgumentDisplayType.Graph}>Graph</option>
                        <option value={ArgumentDisplayType.EnlargedGraph}>Big Graph</option>
                        <option value={ArgumentDisplayType.Edit}>Edit</option>
                        <option value={ArgumentDisplayType.Text}>Text</option>
                    </select>
                    {/*<button className="ui huge button" onClick={this.toggleDisplay}>
                        Display
                    </button>*/}
                    <button style={{
                        display : displayStepControls ?
                            "initial" :
                            "none"
                    }} className="ui icon huge button" onClick={this.first}>
                        <i className="fast backward icon"></i>
                    </button>
                    <button style={{
                        display : displayStepControls ?
                            "initial" :
                            "none"
                    }} className="ui icon huge button" onClick={this.back}>
                        <i className="step backward icon"></i>
                    </button>
                    <button style={{
                        display : displayStepControls ?
                            "initial" :
                            "none"
                    }} className="ui icon huge button" onClick={this.forward}>
                        <i className="step forward icon"></i>
                    </button>
                    <button style={{
                        display : displayStepControls ?
                            "initial" :
                            "none"
                    }} className="ui icon huge button" onClick={this.last}>
                        <i className="fast forward icon"></i>
                    </button>
                </div>
                <br/>
                <br/>
            </div>
        );
    }
}
