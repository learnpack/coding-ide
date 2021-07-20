/* eslint-disable */
import React, { useState, useEffect } from "react";
import { render, unmountComponentAtNode } from "react-dom";

const WINDOW_TYPE = {
  CONFIRM: "confirm",
  ALERT: "alert",
  PROMPT: "prompt",
};

const Alert = ({ title, onAccept, onCancel, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");

  const close = () => {
    setIsOpen(false);
    removeElement();
  };

  const onCancelClick = () => {
    close();
    onCancel && onCancel(false);
  };

  const onAcceptClick = () => {
    close();
    onAccept && onAccept(type === WINDOW_TYPE.PROMPT ? value : true);
  };

  useEffect(() => {
    setIsOpen(true);
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
