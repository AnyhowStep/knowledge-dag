import * as React from "react";
import {NodeTagMultiselect} from "../../ui";

export const useForm = () => {
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [content, setContent] = React.useState("");
    const [tags, setTags] = React.useState<readonly string[]>([]);

    const [expandContent, setExpandContent] = React.useState(false);

    const [submitDisabled, setSubmitDisabled] = React.useState(false);

    return {
        title,
        setTitle,
        description,
        setDescription,
        content,
        setContent,
        tags,
        setTags,
        expandContent,
        setExpandContent,
        submitDisabled,
        setSubmitDisabled,
    };
};

export type UseForm = ReturnType<typeof useForm>;

export const Form = (props : UseForm) => {
    const {
        title,
        setTitle,
        description,
        setDescription,
        content,
        setContent,
        tags,
        setTags,
        expandContent,
        setExpandContent,
        submitDisabled,
        //setSubmitDisabled,
    } = props;

    return (
        <React.Fragment>
            <div
                className="fields equal width"
                style={{
                    display : expandContent ? "none" : undefined,
                }}
            >
                <div className="field">
                    <label>Title</label>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                        }}
                    />
                </div>
                <div className="field">
                    <label>Description</label>
                    <input
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="field">
                <label
                    style={{
                        display : expandContent ? "none" : undefined,
                    }}
                >
                    Tags
                </label>
                <div style={{ display : "flex" }}>
                    <NodeTagMultiselect
                        values={tags}
                        setValues={setTags}
                        style={{
                            flex : 1,
                            display : expandContent ? "none" : undefined,
                        }}
                    />
                    <div
                        style={{
                            flex : 1,
                            display : expandContent ? "inline-block" : "none",
                            overflow : "hidden",
                        }}
                    >
                        <strong>
                            {
                                title.length == 0 ?
                                <span style={{ color : "#cccccc" }}>Untitled</span> :
                                title
                            }
                        </strong>
                        <br/>
                        {
                            tags.length == 0 ?
                            undefined :
                            tags.map(t => (
                                <span className="ui blue mini label" key={t}>{t}</span>
                            ))
                        }
                        {
                            description.length == 0 ?
                            undefined :
                            <small>{description}</small>
                        }
                    </div>
                    <div
                        className={"ui simple dropdown item button"}
                    >
                        <i className="bars icon"></i>
                        <div className="left menu">
                            <div
                                className="ui item"
                                onClick={() => {
                                    setExpandContent(!expandContent);
                                }}
                            >
                                {
                                    expandContent ?
                                    "Shrink Content" :
                                    "Expand Content"
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <textarea
                placeholder="Content"
                style={{
                    fontFamily : `"Courier New", Courier, monospace`,
                    maxHeight : "unset",
                    flex : 1,
                }}
                value={content}
                onChange={(e) => {
                    setContent(e.target.value);
                }}
            ></textarea>
            <button
                className={"ui button large primary"}
                type="submit"
                disabled={submitDisabled}
            >
                Submit
            </button>
        </React.Fragment>
    );
};
