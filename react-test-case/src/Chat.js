import React, { useState, useEffect, useReducer } from "react"
import io from "socket.io-client"
import { HOST } from "./constants"

import * as tokenService from "./tokenService"

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

export const Chat = props => {
  const [users, setOnlineUsers] = useState([])
  const [socket, setSocket] = useState(null)
  const [message, setMessage] = useState("")
  const [messages, dispatchMessages] = useReducer(messageReducer, [])

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
          <li key={user._id} style={{ color: user.color }}>
            {user.login}{console.log(user)}
            {props.currentUser.isAdmin && !user.isAdmin && (
              <div>
                <button onClick={() => banUser(user)}>Ban</button>
                {!user.isMuted ? (
                  <button onClick={() => muteUser(user)}>
                    Mute
                </button>
                ) : (
                    <button onClick={() => unmuteUser(user)}>
                      Unmute
                </button>
                  )}
              </div>
            )}
          </li>
        )
      })

  return (
    <div>
      <h2>Let`s talk</h2>
      <input type="text" value={message} onChange={handleMessage} />
      <button onClick={sendMessage}>Send</button>
      <button
        onClick={e => {
          socket.disconnect()
          props.logout(e)
        }}
      >
        logout
      </button>
      <ul>
        {messages.map(msg => {
          return (
            <li key={msg._id} >
              <div>
                {users[msg.userId] ? <p style={{ color: users[msg.userId].color }}>{msg.userName}:</p> : <p>{msg.userName}:</p>}
              </div> {msg.text}
            </li>
          )
        })}
      </ul>
      <h2>Online</h2>
      <ul>{showUsers()}</ul>
      <div>
        <ul>
          {Object.keys(users)
            .filter(key => !users[key].online)
            .map(key => {
              const user = users[key]
              if (props.currentUser.isAdmin && !user.isAdmin) {
                return (
                  <div>
                    <li key={user._id}>
                      {user.login}
                      <div>
                      {!user.isBanned ? (
                          <button onClick={() => banUser(user)}>
                            Ban
                </button>
                        ) : (
                            <button onClick={() => unbanUser(user)}>
                              Unban
                </button>
                          )}
                        {!user.isMuted ? (
                          <button onClick={() => muteUser(user)}>
                            Mute
                </button>
                        ) : (
                            <button onClick={() => unmuteUser(user)}>
                              Unmute
                </button>
                          )}
                      </div>
                    </li>
                  </div>
                )
              }
            })}
        </ul>
      </div>
    </div>
  )
}
