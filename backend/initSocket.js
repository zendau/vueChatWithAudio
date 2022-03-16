const {addUser, getRoomUser, getUserById, userLeaveChat} = require("./users")
const {addPeerUser, getRoomPeerUser, getPeerUserById, peerUserLeaveChat} = require("./peerUsers")

module.exports = function(io) {
    // Вывод сообщение что был подключен пользователь по сокету
    io.on("connection", (socket) => {
        console.log("user connect")

        socket.on("room", (userData) => {
            
            const user = {
                id: socket.id,
                room: userData[0],
                login: userData[1]
            }

            addUser(user)
            socket.join(user.room)
            io.to(user.room).emit("getUserId", user.id)
            io.to(user.room).emit("getUsers", getRoomUser(user.room))
            io.to(user.room).emit("message", `${user.login} has join to chat`)  

                
            
        })

        socket.on('newMessage', (msg) => {
            console.log(`message ${msg[1]} from user ${msg[0]}, room ${msg[2]}`)
            console.log("msg", msg)
            io.to(msg[2]+"").emit("message", msg)  
        })

        socket.on("logoutUser", () => {
            socket.disconnect()
        })

        // socket.on('disconnect', () => {
        //     console.log(`user ${socket.id} disconnected`, )
        //     const user = getUserById(socket.id)
        //     console.log(user)
        //     if (user) {
        //         userLeaveChat(user.id)
        //         io.to(user.room).emit("userDisconnect", socket.id)
        //         io.to(user.room).emit("message", `${user.login} has left the chat`)  
        //         io.to(user.room).emit("getUsers", getRoomUser(user.room))
        //     }   
        // })


        socket.on('join-room', (roomId, userId, userLogin) => {

            addPeerUser({
                id: userId,
                room: roomId,
                login: userLogin
            })
            socket.join(roomId)
            socket.broadcast.emit('user-connected', userId)
        
            socket.on('disconnect', () => {
                console.log('disconnet 2')
                peerUserLeaveChat(userId)
                socket.to(roomId).emit('userDisconnect', userId)
            })
          })
    })
}