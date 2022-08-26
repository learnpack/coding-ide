import React, { useState } from 'react';
import PropTypes from "prop-types";
import "./internal-error.scss";

const InternalError = ({ message, gif, solution, video, repo, config }) => {
    const [details, setDetails ] = useState(false);

    return <div className="internal-error text-white mx-auto col-12 col-md-10 col-xl-6">
        <h2 className="text-white mb-0">🥺 Whoops!</h2>
        <div>
            <h4 className="mt-0 text-white">{message}</h4>
            <div>
                Try troubleshooting with these steps:
                <div className="bg-black ">
                    {gif ? 
                        <a href={gif} target="_blank" rel="noopener noreferrer"><img className="w-100 mb-1" src={gif} /></a> 
                        :
                        <p className="text-light p-3">{solution}</p>
                    }
                    {details && <pre className="text-white p-3">{JSON.stringify(window.learnpackConfig, null, 1)}</pre>}
                </div>
            </div>
            <p className="m-0 d-flex bar">
                { video && <a className="w-50" href={video} target="_blank" rel="noopener noreferrer">📹 How to fix this error</a> }
                { repo && <a className="w-50 text-right" href={`${repo}/issues/new`} target="_blank" rel="noopener noreferrer"> 🐞 File an issue </a> }
                { <a className="w-50 text-right" href="#" onClick={() => setDetails(!details)}> {details ? "Hide": "Show"} Config </a> }
            </p>
        </div>
    </div>;
};

InternalError.propTypes = {
    message: PropTypes.string,
    gif: PropTypes.string,
    solution: PropTypes.string,
    config: PropTypes.object,
    repo: PropTypes.string,
    video: PropTypes.string,
};

InternalError.defaultProps = {
    message: null,
    gif: null,
    config: {},
    repo: null,
    solution: null,
    video: null,
};

export default InternalError;