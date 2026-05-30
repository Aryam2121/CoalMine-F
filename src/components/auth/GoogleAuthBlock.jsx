import React, { useEffect, useRef, useState } from 'react';

/**
 * Full-width wrapper for @react-oauth/google button + optional hint below.
 * GoogleLogin only accepts pixel width — we measure the container.
 */
const GoogleAuthBlock = ({ children, hint }) => {
  const innerRef = useRef(null);
  const [btnWidth, setBtnWidth] = useState(0);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setBtnWidth(Math.floor(w));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="auth-google-block">
      <div ref={innerRef} className="auth-google-block__inner">
        {typeof children === 'function' ? children(btnWidth) : children}
      </div>
      {hint ? <p className="auth-google-block__hint">{hint}</p> : null}
    </div>
  );
};

export default GoogleAuthBlock;
