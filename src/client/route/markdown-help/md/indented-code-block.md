### Indented Code Block

Indenting with 4 spaces gives you an indented code block

    writeSomeCode();

----

    export type Identity<T> = T;
    export type Merge<T> = Identity<{ [k in keyof T] : T[k] }>;
