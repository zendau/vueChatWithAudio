<template>
  
    <div>Room title - {{roomData.roomTitle}}</div>
    <div>Room author - {{roomData.adminLogin}}</div>
    <div>Room id - {{roomData.roomId}}</div>
    <ul>
        <li v-for="user in roomUsers" :key="user.userId">User - {{user.userId}}. Mute status - {{!!user.mute}}</li>
    </ul>
    <free-users :roomId='roomId' :users="testUser" />
    <button @click="changeVideoStatus(userId)"> {{ videoStatus ? 'Play' : 'Pause' }}</button>
    <div ref="videoGroup">
        <videoOverlay 
            v-for='videoData in videos' 
            :key="videoData.id" 
            :id="videoData.id" 
            :srcObject="videoData.stream" 
            :muted="videoData.muted"
            :pause='videoData.pause'
            />
    </div>
</template>

<script>
import { useRoute } from 'vue-router'
import {  reactive, onUnmounted, ref, inject, watch } from 'vue'


import $api from '../../axios'
import freeUsers from '../../components/freeUsers.vue'
import videoOverlay from '../../components/videoOverlay.vue'

import Peer from 'peerjs';
export default {
    components: { freeUsers, videoOverlay },
    async setup() {

        // ==== vars ==== //

        //const router = useRouter()
        const route = useRoute()

        const roomUsers = ref([])

        // user Data
        const roomId = route.params.id
        const userLogin = Date.now()
        const userId = ref(null)
        const peerId = ref(null)

        const testUser = ref([])

        const socket = inject('socket', undefined)
        const socketConnected = inject('connected', false)
        const peerConnected = ref(false)
        
        const videoGroup = ref(null)

        const mainStream = ref(null)
        const childStream = []


        const videos = reactive([])
        
        const videoStatus = ref(false)

        console.log(videos)

        // ==== hooks ==== //


        
       
        watch([socketConnected, peerConnected], ([socketStatus, peerStatus]) => {
            if (socketStatus && peerStatus) {
                userId.value = socket.id
                console.log('join to the room')
                socket.emit('join-room', { 
                    userId: userId.value,
                    peerId: peerId.value,
                    roomId: roomId,
                    userLogin
                })
                //connectToNewUser()
            }
        }, {
            immediate: true
        })

        // socket.on('connect', () =>{
        //     console.log('connected room')
        //     userId.value = socket.id

        //     socket.emit('join-room', { 
        //         userId: userId.value,
        //         roomId: roomData.roomId,
        //         userLogin
        //     })

        //     console.log( userId.value, roomData.roomId, userLogin)
        //     //Object.keys(socket).forEach(item => console.log(item + ' ' + socket[item]))
        // })


       
        onUnmounted(() => {
            socket.emit('exit-room', {
                userId: userId.value,
                roomId: roomId,
                userLogin
            })
            window.removeEventListener('keypress', muteEvent)
            socket.removeAllListeners('getUsers')
            mainStream.value.getTracks().forEach(t => {
                console.log(t)
                t.stop()
                console.log(t)
            })
            childStream.forEach(stream => {
               stream.getTracks().forEach(track => {
                track.stop()
            })
            })
        })

        function changeVideoStatus(userId) {

            videoStatus.value = !videoStatus.value

            videos.forEach(video => {
                if (video.id === userId ) video.pause = videoStatus.value
            })
            socket.emit('videoPause', {
                userId,
                roomId
            })
            //const el = document.getElementById(userId)
            //el.pause()
        }


        // ==== socket ==== //

        socket.on('getUsers', (users) => {
            console.log('users', users);
            roomUsers.value = users
 
            users.forEach(item => {
                
                videos.find((video) => {
                    if (video.id === item.peerId) {
                        video.muted = item.mute
                        video.pause = item.pause
                        return true
                    } else {
                        return false
                    }
                })

                console.log('ZZZ', videos)
                
                //const videoELement = document.getElementById(item.peerId)
                //console.log('mute', videoELement, item.mute)
                //if (videoELement) videoELement.muted = item.mute
            });
            //socket.emit('message', { test: 'test' });
        });

        socket.on('getFreeUsers', (users) => {
           console.log('free users2', users)
           testUser.value = users
        })
        
        socket.on('userJoinedRoom', (userId) => {
            console.log('Connected user with id', userId, mainStream)
            connectToNewUser(userId, mainStream.value)
        })

        socket.on('UserLeave', (userId) => {
            console.log('disconnect', userId);
            const element = document.getElementById(userId)
            console.log(element)
            element.remove();
        })


        // socket.on('mutevideoStream', (userId) => {
        //     const videoElement = document.getElementById(userId)
        //     console.log('muted video tag',videoElement, userId) 
        //     videoElement.muted = !videoElement.muted
        // })


        // ==== async ==== //

        const res = await $api.get('/room/get/'+roomId)
        const roomData = reactive(res.data)
        

        // socket.on('disconnect',function() {
        //     socket.emit('exit-room', {
        //         userId: userId.value,
        //         roomId,
        //         userLogin
        //     });
        // });

        

       

        // socket.on('join-room', () => {
        //     console.log('Connected');

        //     //
        // });




        // ==== events ==== //
        window.addEventListener('keypress', muteEvent)

        function muteEvent(event) {
          if (event.code === 'KeyM') {
            console.log('click M', userId.value)
            socket.emit('userMute', {
                userId: userId.value,
                roomId
            })
          }
        }


        // ==== peers ==== //

        const myPeer = new Peer({
            path: '/peer',
            host: '/',
            port: '9000'
        })


        const peers = {}

        const getUserMedia =
        navigator.mediaDevices.getUserMedia ||
        navigator.mediaDevices.webkitGetUserMedia ||
        navigator.mediaDevices.mozGetUserMedia;

        getUserMedia({
        video: true,
        audio: true,
        }).then(stream => {
        //localStream.value = stream
        //console.log('localStream',localStream)
        mainStream.value = stream
        console.log('localStream',stream) // new - temp
            console.log('userConnetSOcker', userId)
            addvideoStream(stream, userId.value, true)
        // socket.on('user-connected', userId => {
        //     // const video = document.createElement('video')
        //     // video.id = userId;
        //     // document.body.append(video)
        //     console.log('userConnetSOcker', userId)
        //     //connectToNewUser(userId, stream)
        // })          
        })


        myPeer.on('call', call => {
            console.log("answer")

            getUserMedia({
              video: true,
              audio: true,
            }).then(stream => {
              childStream.push(stream)
          
              call.answer(stream)
              console.log('remoteStream', stream)
              //video.muted = store.state.users.filter(item => item.id === call.peer)[0].mute
              call.once('stream', userVideoStream => {
   
                console.log('answer video stream', call.peer)
                addvideoStream(userVideoStream, call.peer, false)
              })
            })
          }
        )

        myPeer.on('open', id => {
          console.log('join peer server', id)
          peerConnected.value = true
          peerId.value = id
        //   socket.data.getConnect().emit('join-room', roomId, id, userLogin)

        //   //socket.data.createRoom(roomId, userLogin, id)
        //   socket.data.getUserId(userId, store)
        //   socket.data.getUsers(store)
        //   socket.data.resiveMessage(store, function () {
        //     return nextTick(() => {
        //     const elem = messagesRef.value
        //     elem.value.scrollTo(0, elem.value.scrollHeight)        
        //   })
        })


        function connectToNewUser(userId, stream) {
            console.log('conntected to new user. Call to '+userId, myPeer, stream)
            

            const call = myPeer.call(userId, stream)
            
            call.once('stream', userVideoStream => {
       
                console.log('connectToNewUser video stream', userId)
                addvideoStream(userVideoStream, userId, false)
            })
            call.on('close', () => {
                console.log('!!!! CLOSE CONNECT')
            })

            peers[userId] = call
        }

        function addvideoStream(stream, id, status) {

            videos.push({
                id,
                stream,
                muted: status,
                pause: false,
            })

            console.log('videos', stream)

            console.log(stream, 'stream')
            //video.addEventListener('loadedmetadata', () => {
            //    video.play()
            //})
            //videoGroup.value.append(video)
        }

        return {
            roomData,
            roomUsers,
            roomId,
            testUser,
            videoGroup,
            changeVideoStatus,
            userId,
            videos,
            videoStatus
        }
    }
}
</script>

<style>

</style>