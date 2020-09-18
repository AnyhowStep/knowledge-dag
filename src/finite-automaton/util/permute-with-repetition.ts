export function permuteWithRepetition<T> (values : T[], n : number) : T[][] {
    const rowCount = Math.pow(values.length, n);

    const result : T[][] = [];
    for (let i=0; i<rowCount; ++i) {
        result.push([]);
    }

    for (let col=0; col<n; ++col) {
        const mod = rowCount / Math.pow(values.length, col+1);
        //console.log(rowCount, values.length, col, Math.pow(values.length, col));
        let valueIndex = -1;
        for (let row=0; row<rowCount; ++row) {
            if (row % mod == 0) {
                valueIndex = (valueIndex+1) % values.length;
            }
            result[row].push(values[valueIndex]);
        }
    }
    return result;
}
