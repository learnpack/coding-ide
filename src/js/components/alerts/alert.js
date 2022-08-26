/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { render, unmountComponentAtNode } from "react-dom";

const WINDOW_TYPE = {
  CONFIRM: "confirm",
  ALERT: "alert",
  PROMPT: "prompt",
};

const Alert = ({ title, onAccept, onCancel, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");

  const buttonRef = useRef();
  const inputRef = useRef();

  const close = () => {
    setIsOpen(false);
    removeElement();
  };

  const onCancelClick = useCallback(() => {
    close();
    onCancel && onCancel(false);
  }, []);

  const onAcceptClick = useCallback(() => {
    close();
    onAccept && onAccept(type === WINDOW_TYPE.PROMPT ? value : true);
  }, [value]);

  const onKeyPress = useCallback(
    (e) => {
      if (e.keyCode === 27) {
        onCancelClick();
      } else {
        if (e.keyCode === 13) {
          onAcceptClick();
        }
      }
    },
    [onCancelClick, onAcceptClick]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);

    return () => {
      document.removeEventListener("keydown", onKeyPress);
    };
  }, [onKeyPress]);

  useEffect(() => {
    setIsOpen(true);

    setTimeout(() => {
      if (type === WINDOW_TYPE.PROMPT) {
        inputRef.current.focus();
      } else {
        buttonRef.current.focus();
      }
    }, 50);
  }, []);

  return (
    <div
      className={`modal fade ${isOpen ? "show" : "show"}`}
      tabIndex="-1"
      role="dialog"
      style={{
        display: isOpen ? "block" : "none",
      }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-body">
            <p>{title}</p>

            {type === WINDOW_TYPE.PROMPT && (
              <input
                className="form-control"
                onChange={({ target }) => setValue(target.value)}
                ref={inputRef}
              />
            )}
          </div>

          <div className="modal-footer">
            {(type === WINDOW_TYPE.CONFIRM || type === WINDOW_TYPE.PROMPT) && (
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                onClick={onCancelClick}
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={onAcceptClick}
              ref={buttonRef}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const createElement = ({ title, onAccept, onCancel, type }) => {
  let target = document.getElementById("alert-window");

  if (!target) {
    target = document.createElement("div");
    target.id = "alert-window";
    document.body.appendChild(target);
  }

  render(
    <Alert title={title} onAccept={onAccept} onCancel={onCancel} type={type} />,
    target
  );
};

const removeElement = () => {
  const target = document.getElementById("alert-window");
  if (target) {
    unmountComponentAtNode(target);
    target.parentNode.removeChild(target);
  }
};

export const confirm = (title) => {
  return new Promise((resolve) => {
    createElement({
      title,
      onAccept: resolve,
      onCancel: resolve,
      type: WINDOW_TYPE.CONFIRM,
    });
  });
};

export const alert = (title) => {
  return new Promise((resolve) => {
    createElement({
      title,
      onAccept: resolve,
      type: WINDOW_TYPE.ALERT,
    });
  });
};

export const prompt = (title) => {
  return new Promise((resolve) => {
    createElement({
      title,
      onAccept: (data) => {
        // workaround to avoid to show multiples prompts too fast
        setTimeout(() => {
          resolve(data);
        }, 200);
      },
      type: WINDOW_TYPE.PROMPT,
    });
  });
};

export default Alert;
