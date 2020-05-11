import * as React from "react";

export const tagList = (tags : readonly string[]) => {
    return tags.map(t => (
        <span className="ui blue mini label" key={t}>{t}</span>
    ));
};
