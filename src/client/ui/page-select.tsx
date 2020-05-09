import * as React from "react";

export interface PageSelectProps {
    page : number|bigint,
    pagesFound : number|bigint,
    setPage : (page : number) => void;
    rowsFound? : number|bigint,
}
export function PageSelect (props : PageSelectProps) {
    const {
        page,
        pagesFound,
        setPage,
        rowsFound,
    } = props;

    const options : JSX.Element[] = [];
    for (let i=0; i<pagesFound; ++i) {
        options.push(
            <option key={i} value={i}>
                {i}
            </option>
        );
    }

    return (
        <div className="center">
            <div className="ui buttons">
                <button
                    className="ui button"
                    disabled={page <= 0}
                    onClick={() => {
                        setPage(0);
                    }}
                >
                    <i className="fast backward icon"></i>
                </button>
                <button
                    className="ui button"
                    disabled={page <= 0}
                    onClick={() => {
                        setPage(Number(page)-1);
                    }}
                >
                    <i className="left chevron icon"></i>
                </button>
                <select
                    className="ui button"
                    value={Number(page)}
                    onChange={(e) => {
                        setPage(parseInt(e.target.value, 10));
                    }}
                >
                    {options}
                </select>
                <button
                    className="ui button"
                    disabled={page >= Number(pagesFound)-1}
                    onClick={() => {
                        setPage(Number(page)+1);
                    }}
                >
                    <i className="right chevron icon"></i>
                </button>
                <button
                    className="ui button"
                    disabled={page >= Number(pagesFound)-1}
                    onClick={() => {
                        setPage(Number(pagesFound)-1);
                    }}
                >
                    <i className="fast forward icon"></i>
                </button>
            </div>
            <br/>
            {rowsFound == undefined ? undefined : `${rowsFound} results found`}
        </div>
    );
}
