<template>
  <div>
      <h3>Online users</h3>
      <ul>
          <li v-for="user in onlineUsers" :key=user.userId>
              <p>{{user.userId}}</p>
              <p>{{user.userLogin}}</p>
              <button class="btn btn-primary" @click="sendInvinteToRoom(user.userId, roomId)">invite</button>
          </li>
      </ul>
  </div>
</template>

<script>
import { inject, onMounted, onUnmounted } from '@vue/runtime-core'
import { ref } from "vue";
export default {
    props: ['roomId', 'users'],
    setup() {
        console.log('setup free users')

        //const mountedStatus = inject('freeUserStatus')

        onMounted(() => console.log('mounted free users'))

        onUnmounted(() => socket.removeAllListeners('getOnlineUsers'))

        const onlineUsers = ref(null)

        const socket = inject('socket')
        console.log(socket)

        //Object.keys(socket._callbacks).forEach(item => console.log(item + ' ' + socket[item]))
        socket.on('getOnlineUsers', (users) => {
           console.log('online users', users)
           onlineUsers.value = users
        })
        //console.log('=======================')
        //Object.keys(socket._callbacks).forEach(item => console.log(item + ' ' + socket[item]))
        

        // defineProps({
        //     roomId: String
        // })

        function sendInvinteToRoom(userId, roomId) {
            console.log(userId, roomId)
            socket.emit('invite-user', {
                userId, roomId
            })
        }


        return {
            onlineUsers,
            sendInvinteToRoom
        }
    }
}
</script>

<style scoped>
    div {
        border: 1px solid black;
        padding: 10px;
        position: absolute;
        right: 100px;
    }
</style>