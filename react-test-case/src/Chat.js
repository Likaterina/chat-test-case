import React, { useState, useEffect, useReducer } from "react"
import io from "socket.io-client"
import { HOST } from "./constants"

import * as tokenService from "./tokenService"
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Input from '@material-ui/core/Input'

const messageReducer = (state, action) => {
  switch (action.type) {
    case "add":
      return state.concat(action.payload)
    case "set":
      return action.payload
    default:
      throw new Error()
  }
}

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  chat: {
    borderWidth: "1px",
    borderColor: "#ccc",
    borderRightStyle: "solid",
    borderLeftStyle: "solid",
  },
  container: {
    height: "100vh",
  },
  marin: {
    margin: theme.spacing(1),
    flexWrap: 'wrap',
  },
  button: {
    margin: theme.spacing(1),
  },
  message: {
    margin: theme.spacing(2, 0),
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#97C6E3",
    borderRadius: "10px",
    font: 'Open Sans',
    backgroundColor: "#A8DDFD",
    padding: theme.spacing(1),
    color: "black",
  },
  users: {
    margin: theme.spacing(1, 3),
    font: 'Open Sans',
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "10px",
    padding: theme.spacing(1, 2),
    
  }, 
  height: {
    height: "100%"
  }
}))

export const Chat = props => {
  const [users, setOnlineUsers] = useState([])
  const [socket, setSocket] = useState(null)
  const [message, setMessage] = useState("")
  const [messages, dispatchMessages] = useReducer(messageReducer, [])

  const classes = useStyles()

  useEffect(() => {
    const token = tokenService.getToken()

    if (!token) return

    const socket = io(HOST, {
      query: {
        token
      }
    })

    socket.on("allMessages", payload => {
      dispatchMessages({
        type: "set",
        payload
      })
    })

    socket.on("message", payload => {
      dispatchMessages({
        type: "add",
        payload
      })
    })

    socket.on("sendAllUsers", users => {
      let usersToDisplay = {}

      console.log(users)

      for (let i in users) {
        const color = setRandomColor()
        if (!usersToDisplay[i]) {
          usersToDisplay[i] = { ...users[i], color }
        }
      }
      console.log(usersToDisplay)
      setOnlineUsers(usersToDisplay)
    })

    setSocket(socket)
  }, [])

  const sendMessage = () => {
    if (message && message.trim()) {
      socket.emit("message", { text: message })
      setMessage("")
    }
  }

  const handleMessage = e => {
    setMessage(e.target.value)
  }

  const muteUser = user => {
    socket.emit("muteUser", user)
  }

  const unmuteUser = user => {
    socket.emit("unmuteUser", user)
  }

  const banUser = user => {
    socket.emit("banUser", user)
  }

  const unbanUser = user => {
    socket.emit("unbanUser", user)
  }

  const setRandomColor = () => {
    const rand256 = () => Math.floor(Math.random() * 256)
    return `rgb(${rand256()}, ${rand256()}, ${rand256()})`
  }

  const showUsers = () =>
    Object.keys(users)
      .filter(key => users[key].online)
      .map(key => {
        const user = users[key]
        return (
          <li key={user._id} style={{ color: user.color }} className={classes.users}>
            {user.login}{console.log(user)}
            {props.currentUser.isAdmin && !user.isAdmin && (
              <div>
                <Button onClick={() => banUser(user)}>Ban</Button>
                {!user.isMuted ? (
                  <Button onClick={() => muteUser(user)}>
                    Mute
                </Button>
                ) : (
                    <Button onClick={() => unmuteUser(user)}>
                      Unmute
                </Button>
                  )}
              </div>
            )}
          </li>
        )
      })

  return (
    <Grid container spacing={3} direction="row" className={classes.container} >
      <Grid
        
        item xs={4}
        container
        direction="column"
        alignItems="center"
        justify="flex-start"
      >
        <div className="online-users">
          <Typography component="h1" variant="h4">Online users:</Typography>
          <ul style={{ listStyle: "none" }}>{showUsers()}</ul>
        </div>
      </Grid>
      <Grid
        item xs={4}
        container
        direction="column"
        justify="flex-end"
        alignItems="center"
        className={classes.chat}>
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="stretch" 
          >
            
          <ul style={{ listStyle: "none" }} >
            {messages.map(msg => {
              return (
                <li key={msg._id}>
                  {users[msg.userId] ?
                    <p style={{ color: users[msg.userId].color }}>
                      {msg.userName}:  <p className={classes.message} >{msg.text}</p>
                    </p> :
                    <p>{msg.userName}: <p className={classes.message}>{msg.text}</p>
                    </p>
                  }

                </li>
              )
            })}
          </ul>
        </Grid>
        <Grid container
          direction="row"
          justify="flex-end"
          alignItems="flex-end">
          <Input value={message} onChange={handleMessage} id="standard-basic" fullWidth placeholder="Enter your message" />
          <Button
            onClick={sendMessage}
            color="primary">
            Send</Button>
        </Grid>
      </Grid>
      <Grid item xs={1} container
        direction="column">
        <Button
          onClick={e => {
            socket.disconnect()
            props.logout(e)
          }}
        >
          logout
      </Button>
      </Grid>
      <Grid
        item xs={3}
        container
        direction="column"
        alignItems="center">
        <div className="offline-users" >
          <ul style={{ listStyle: "none" }}>
            {Object.keys(users)
              .filter(key => !users[key].online)
              .map(key => {
                const user = users[key]
                if (props.currentUser.isAdmin && !user.isAdmin) {
                  return (
                    <div>
                      <li key={user._id} className={classes.users}>
                        {user.login}
                        <div>
                          {!user.isBanned ? (
                            <Button onClick={() => banUser(user)}>
                              Ban
                </Button>
                          ) : (
                              <Button onClick={() => unbanUser(user)}>
                                Unban
                </Button>
                            )}
                          {!user.isMuted ? (
                            <Button onClick={() => muteUser(user)}>
                              Mute
                </Button>
                          ) : (
                              <Button onClick={() => unmuteUser(user)}>
                                Unmute
                </Button>
                            )}
                        </div>
                      </li>
                    </div>
                  )
                }
              })}
          </ul>
        </div>
      </Grid>
    </Grid>
  )
}
