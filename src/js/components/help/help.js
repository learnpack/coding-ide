import React, { useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import './help.scss';
import { MarkdownParser, Loading } from "@breathecode/ui-components";

const Help = ({ onClose }) => {
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
                { current && <button className="btn btn-dark" onClick={() => setCurrent(null)}>⬅ Back to questions</button>}
            </div>
            <button className="btn btn-dark close-btn" onClick={() => onClose && onClose()}>
                Close <i className="ml-1 fas fa-times text-white"></i>
            </button>
        </div>
        { current ? 
            <Question slug={current.slug} /> 
            :
            <Fragment>
                <h3>What is your question?</h3>
                <ul>
                    {questions.map(q => <li key={q.slug} onClick={() => setCurrent(q)}>{q.title}</li>)}
                    <li>
                        <a 
                            href="https://github.com/learnpack/learnpack/issues/new?assignees=&labels=&template=bug_report.md&title=" target="_blank" rel="noopener noreferrer"
                            >Report a bug</a>
                    </li>
                </ul>
            </Fragment>
        }
    </div>;
};
Help.propTypes = {
  onClose: PropTypes.func,
};
Help.defaultProps = {
  onClose: null
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