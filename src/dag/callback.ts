export type FetchAllParent = (id : string) => Promise<string[]>;
export type FetchAllChild  = (id : string) => Promise<string[]>;

export type SetDirectParent = (nodeId : string, parentId : string, direct : boolean) => Promise<void>;

export type FetchAllDirectParent = (id : string) => Promise<string[]>;
export type FetchAllDirectChild  = (id : string) => Promise<string[]>;
