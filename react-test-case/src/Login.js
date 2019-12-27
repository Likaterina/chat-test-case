import React, { useState, useEffect } from "react"
import * as tokenService from './tokenService';

export const Login = (props) => {

    useEffect(() => {
        const token = tokenService.getToken()
        if (token) {
            window.location.replace('/');
        }

    }, [])

    return (
      <div>
        <h2>Enter your login and password</h2>
        <form onSubmit={props.loginRequest}>
          <input
            type="text"
            value={props.currentLogin}
            onChange={props.handleLogin}
            pattern="[A-Za-z]{3,}"
            placeholder="Enter your login"
            required
            autoFocus
          />
          <input
            type="password"
            value={props.currentPassword}
            onChange={e => props.handlePassword(e)}
            placeholder="Enter your password"
            required
          />
          <button type="submit" onSubmit={props.loginRequest}>Login</button>
        </form>

      </div>
    )
  }