import React from 'react';

const Loader = () => {
  return (
    <div className="loader-wrapper flex items-center justify-center">
      <div className="loader">
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
      </div>
    </div>
  );
};

export default Loader;
