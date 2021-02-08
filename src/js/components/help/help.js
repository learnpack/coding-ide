import React, { useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import './help.scss';
import { MarkdownParser, Loading } from "@breathecode/ui-components";

const Help = ({ onClose, config }) => {
    const [ questions, setQuestions ] = React.useState([]);
    const [ current, setCurrent ] = React.useState(null);

    useEffect(() => {
        fetch('https://learnpack.herokuapp.com/v1/support/question')
            .then(r => r.json())
            .then(questions => setQuestions(questions));
    },[]);

    return <div className="help">
        <div className="d-flex pb-2">
            <div className="w-100">
                { current ? 
                    <button className="btn btn-dark" onClick={() => setCurrent(null)}>⬅ Back to questions</button>
                    :
                    <h4>Frequently Asked Questions</h4>
                }
            </div>
            <button className="btn btn-dark close-btn" onClick={() => onClose && onClose()}>
                Close <i className="ml-1 fas fa-times text-white"></i>
            </button>
        </div>
        { current ? 
            <Question slug={current.slug} /> 
            :
            <Fragment>
                { questions.length === 0 && <Loading className="centered-box" />}
                <ul className="questions">
                    {questions.map(q => <li key={q.slug} onClick={() => setCurrent(q)}>{q.title}</li>)}
                </ul>
                <div className="small text-white-700">LearnPack Editor version {config.editor ? config.editor.version : "uknown"}</div>
            </Fragment>
        }
    </div>;
};
Help.propTypes = {
  onClose: PropTypes.func,
  config: PropTypes.object,
};
Help.defaultProps = {
  onClose: null,
  config: {},
};
export default Help;

const Question = ({ slug }) => {
    const [ question, setQuestion ] = React.useState([]);

    useEffect(() => {
        fetch(`https://learnpack.herokuapp.com/v1/support/question/${slug}`)
            .then(r => r.json())
            .then(question => setQuestion(question));
    },[slug]);

    if(!question) return <Loading />;

    return <MarkdownParser className="markdown" source={question.answer} />;
};
Question.propTypes = {
  slug: PropTypes.string.required,
};
Question.defaultProps = {
  slug: null
};