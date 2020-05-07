import * as vis from "vis";

export const networkOptions : vis.Options = {
    layout: {
        improvedLayout: true                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ,
        /*hierarchical: {
            enabled: false,
            sortMethod: "directed",
            levelSeparation: 200,
            parentCentralization: false,
            edgeMinimization: true,
            blockShifting: true,
            nodeSpacing: 250
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
            type: "continuous",
            forceDirection: "vertical",
            roundness: 0.2
        }
    },
    physics: /*{
        enabled : false,
    }*/{
        hierarchicalRepulsion: {
            nodeDistance: 200,
            springLength: 100,
            damping: 0.09,
            springConstant:0.01
        },
        solver: "hierarchicalRepulsion",
        repulsion: {
            nodeDistance: 300,
            springLength: 200,
            springConstant: 0.01
        },
        //timestep:1,
        //maxVelocity: 10
    },//*/,
    groups: {
        explored: {
            color: {
                border : "#f7dbe4",
                background : "#f7dbe4",
                highlight : {
                    background : "#f7dbe4",
                },
                hover : {
                    border : "#f7dbe4",
                    background : "#f7dbe4",
                },
            },
            font: {
                color: "#343434"
            }
        },
        unexplored: {
            color: {
                border : "#535353",
                background : "#535353",
                highlight : {
                    background : "#535353",
                },
                hover : {
                    border : "#535353",
                    background : "#535353",
                }
            },
            font : {
                color: "#9c9a9a"
            }
        },
        "explored-root": {
            color: {
                border : "#ff3535",
                background : "#ff3535",
                highlight : {
                    background : "#ff3535",
                },
                hover : {
                    border : "#ff3535",
                    background : "#ff3535",
                }
            },
            font: {
                color: "#d8d4d4"
            }
        },
        "unexplored-root": {
            color: {
                border : "#553535",
                background : "#553535",
                highlight : {
                    background : "#553535",
                },
                hover : {
                    border : "#553535",
                    background : "#553535",
                }
            },
            font : {
                color: "#d8d4d4"
            }
        },
        "explored-leaf": {
            color: {
                border : "#3535ff",
                background : "#3535ff",
                highlight : {
                    background : "#3535ff",
                },
                hover : {
                    border : "#3535ff",
                    background : "#3535ff",
                }
            },
            font: {
                color: "#d8d4d4"
            }
        },
        "unexplored-leaf": {
            color: {
                border : "#353555",
                background : "#353555",
                highlight : {
                    background : "#353555",
                },
                hover : {
                    border : "#353555",
                    background : "#353555",
                }
            },
            font : {
                color: "#d8d4d4"
            }
        },
        start: {
            color: {
                border : "#53dbff",
                background : "#53dbff",
                highlight : {
                    background : "#53dbff",
                },
                hover : {
                    border : "#53dbff",
                    background : "#53dbff",
                }
            },
            font: {
                color: "#343434"
            }
        },
    },
    interaction : {
        hover : true,
    },
};
