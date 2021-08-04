import React, { useState } from "react";
import PropTypes from "prop-types";
import ReactPlayer from "react-player";
import "./intro.css";

const Intro = ({ onClose, url, playing }) => {
    return <div className="exercise-intro">
        <ReactPlayer width="100%" height="50vh" url={url} playing={playing} controls={true} />
        <button type="button" className="btn btn-success w-100" onClick={() => onClose()}>
            Close video and start exercise
            <i className="fas fa-arrow-right ml-2"></i>
        </button>
    </div>;
};
Intro.propTypes = {
    onClose: PropTypes.func,
    url: PropTypes.string,
    playing: PropTypes.bool,
};
export default Intro;