### Dfa

A deterministic finite automaton,

|Dfa| len2
0,1
a0
a2
a0 | a1 | a1
a1 | a2 | a2
a2 | a2 | a2

|Dfa| same-start-end
0,1
begin
end0 | end1
begin | end0 | end1
end0  | end0 | mid0
mid0  | end0 | mid0
end1  | mid1 | end1
mid1  | mid1 | end1

We can get the intersection of DFAs,

|Dfa| dfa-intersection
intersection: len2,same-start-end

We can also get the union of DFAs,

|Dfa| dfa-union
union: len2,same-start-end
