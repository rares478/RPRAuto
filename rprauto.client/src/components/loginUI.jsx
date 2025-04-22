import React, { useState } from 'react';
import { loginHandle } from '../functionality/loginFun';

function Login() {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    
    const [ error, setError ] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        loginHandle(email, password);
    }

    return (
    <div className="login-container">
      <div className="card">
        <div className="card2">
          <form className="form" onSubmit={handleSubmit}>
            <p id="heading">Login</p>
            <div className="field">
              <input
                type="text"
                className="input-field"
                placeholder="email"
                value = {email}
                onChange = {(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <input
                type="password"
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="btn">
              <button type="submit" className="button1">Login</button>
              <button type="button" className="button2">Sign Up</button>
            </div>
            <button type="button" className="button3">Forgot Password</button>
          </form>
        </div>
      </div>
    </div>
    );
}
