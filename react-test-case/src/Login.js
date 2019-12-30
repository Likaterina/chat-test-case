import React, { useState, useEffect } from "react"
import * as tokenService from './tokenService'

import Container from '@material-ui/core/Container'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}))

export const Login = props => {

  const classes = useStyles()

  useEffect(() => {
    const token = tokenService.getToken()
    if (token) {
      window.location.replace('/')
    }

  }, [])

  return (
    <Container component="main" maxWidth="xs">
      <div div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Enter your login and password
        </Typography>
        <form onSubmit={props.loginRequest} className={classes.form} noValidate>
          <TextField
            value={props.currentLogin}
            onChange={props.handleLogin}
            inputProps={{ pattern: "[A-Za-z]{3,}" }}
            label="Enter your login"
            variant="outlined"
            margin="normal"
            id="email"
            autoComplete="email"
            required
            fullWidth
            autoFocus
          />
          <TextField
            type="password"
            id="password"
            autoComplete="current-password"
            value={props.currentPassword}
            onChange={e => props.handlePassword(e)}
            label="Enter your password"
            variant="outlined"
            margin="normal"
            required
            fullWidth
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button 
          type="submit"
            onSubmit={props.loginRequest}
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >Login
          </Button>
        </form>

      </div>
    </Container>
  )
}