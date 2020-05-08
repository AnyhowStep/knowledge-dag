### Fenced Code Block

```
writeSomeCode();
```

```ts
export type Identity<T> = T;
export type Merge<T> = Identity<{ [k in keyof T] : T[k] }>;
```


`````
You may have fenced code blocks inside fenced code blocks,

````
This is a fenced code block,

```
echo "hello, world"
```

````

`````
