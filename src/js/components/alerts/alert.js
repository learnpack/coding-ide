/* eslint-disable */
import React, { useState, useEffect } from "react";
import { render, unmountComponentAtNode } from "react-dom";

const WINDOW_TYPE = {
  CONFIRM: "confirm",
  ALERT: "alert",
};

const Alert = ({ title, onAccept, onCancel, type }) => {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
    removeElement();
  };

  const onCancelClick = () => {
    close();
    onCancel && onCancel();
  };

  const onAcceptClick = () => {
    close();
    onAccept && onAccept();
  };

  useEffect(() => {
    setIsOpen(true);
  }, []);

  console.log("Opened", isOpen);

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
          </div>

          <div className="modal-footer">
            {type === WINDOW_TYPE.CONFIRM && (
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

  console.log(target);

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

export const confirm = ({ title, onAccept, onCancel }) => {
  createElement({
    title,
    onAccept,
    onCancel,
    type: WINDOW_TYPE.CONFIRM,
  });
};

export default Alert;
