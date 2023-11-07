import React, { Fragment, useEffect, useRef } from "react";

function Messages({ messages, user }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isSameUser = (message, ind) => {
    if (ind === 0) return false;
    return message.sender._id === messages[ind - 1].sender._id;
  };

  return (
    <Fragment>
      {messages.map((message, ind) => (
        <div
          className={`flex flex-col max-w-sm lg:max-w-md xl:max-w-lg ${
            message.sender._id === user._id
              ? "self-end items-end"
              : "self-start"
          }`}
        >
          <h4
            className={`mx-1 text-gray-500 ${
              isSameUser(message, ind) ? "hidden" : "block"
            }`}
          >
            {message.sender.username}
          </h4>
          <div
            className={`px-2 py-1 rounded-md flex items-end justify-between min-w-[10rem] ${
              message.sender._id === user._id ? "bg-orange-200" : "bg-gray-200"
            }`}
          >
            <p>{message.text}</p>
            <span className="text-xs text-gray-500 ml-1 w-16">
              {message.time.split(",")[2]}
            </span>
          </div>
        </div>
      ))}

      <div ref={bottomRef} />
    </Fragment>
  );
}

export default Messages;
