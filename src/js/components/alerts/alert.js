/* eslint-disable */
import React, { useState, useImperativeHandle } from "react";

const WINDOW_TYPE = {
  CONFIRM: "confirm",
  ALERT: "alert",
};

var __alert_promotion;

const Alert = React.forwardRef(({ onAccept }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("");
  const [text, setText] = useState("");

  useImperativeHandle(ref, () => ({
    confirm: (text) => {
      setType(WINDOW_TYPE.CONFIRM);
      setText(text);
      setIsOpen(true);

      return new Promise((resolve) => {
        __alert_promotion = resolve;
      });
    },
  }));

  const onCancel = () => {
    setIsOpen(false);
    if (__alert_promotion) __alert_promotion(false);
  };

  const onAcceptClick = () => {
    setIsOpen(false);
    if (__alert_promotion) __alert_promotion(true);
    onAccept && onAccept();
  };

  return (
    <div
      className={`modal fade ${isOpen && "show"}`}
      tabIndex="-1"
      role="dialog"
      style={{
        display: isOpen ? "block" : "none",
      }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-body">
            <p>{text}</p>
          </div>

          <div className="modal-footer">
            {type === WINDOW_TYPE.CONFIRM && (
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                onClick={onCancel}
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
});

export default Alert;
