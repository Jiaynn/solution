import React, { HTMLAttributes } from 'react';

export const IconJoin: React.FC<HTMLAttributes<HTMLSpanElement>> = (props) => {
  return <span {...props}>
    <svg className="svg-join" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <circle className="svg-join-background" cx="20" cy="20" fill="#3381FF" r="20"></circle>
      <path d="M8 8h24v24H8z" fill="#FFF" opacity=".01"></path>
      <path d="m20 13 6-2v16l-6 2z" fill="#FFF" stroke="#FFF" strokeLinejoin="round" strokeWidth="1.25"></path>
      <path d="M18 27h-4V11h12v16" stroke="#FFF" strokeLinejoin="round" strokeWidth="1.25"></path>
    </g>
  </svg>
  </span>;
};

export const IconBegin: React.FC<HTMLAttributes<HTMLSpanElement>> = (props) => {
  return <span {...props}>
    <svg className="svg-begin" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <circle className="svg-begin-background" cx="20" cy="20" fill="#3381FF" r="20"></circle>
        <path d="M8 8h24v24H8z" fill="#FFF" opacity=".01"></path>
        <path d="M11 20h18m-9-9v18" stroke="#FFF" strokeLinejoin="round" strokeWidth="1.25"></path>
      </g>
    </svg>
  </span>;
};
