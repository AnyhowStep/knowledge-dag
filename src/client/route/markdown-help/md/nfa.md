### Nfa

A non-deterministic finite automaton,

|Nfa| N1
a,b
1
1
1 |     | 2 | 3
2 | 2,3 | 3 |
3 | 1   |   |

|Nfa| N2
a,b
q1
q4
q1 | q1 | q1,q2 |
q2 | q3 |       | q3
q3 |    | q4    |
q4 | q4 | q4    |

We can get the intersection of NFAs,

|Nfa| N3
intersection: N1,N2

We can also get the union of NFAs,

|Nfa| N4
union: N1,N2
