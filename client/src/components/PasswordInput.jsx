import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons.jsx';

export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-wrap">
      <input type={show ? 'text' : 'password'} {...props} />
      <button
        type="button"
        className="icon-btn input-addon"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
