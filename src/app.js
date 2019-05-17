import React, { Component } from 'react'
import './index.css';
import io from "socket.io-client";
import  Game from './mainboard';

var socket;

class Chat extends Component{
  constructor(props){
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
    this.login = this.login.bind(this);
    this.createRoom = this.createRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    
    this.state = {
      endpoint: "localhost:8000",
      username: '',
      message:'', //sert à communiquer avec le serveur
      messages: [], //ensemble des messages reçus du serveur
      session: false, //boolean pour switch l'opérateur ternaire
      room: '', // sert à communiquer avec le serveur
      rooms:[], //ensemble des rooms existantes reçues du serveur
      room_check: false, //boolean pour switch l'opérateur ternaire
      playerOne:'',
      playerTwo:'', 
      playerNumber: ''
    };
    socket = io();
  }  

  login(event) {
    event.preventDefault();
    if (this.state.username !== ""){this.setState({session: true})
    socket.emit('user-login', {username: this.state.username})
    this.setState({username: ''});
    }
  }

  createRoom(event){
    event.preventDefault();
    if(this.state.room !== ""){this.setState({room_check: true})
    socket.emit('createRoom',{roomName: this.state.room, user: this.state.username})
   
    }
     this.setState({room: ''});
  }

  joinRoom(roomName){
    socket.emit('joinRoom', {roomName: roomName, user: this.state.username})
    if (!this.state.room) {this.setState({room_check: true})};
  }

  leaveRoom(roomName){
    socket.emit('leaveRoom', {roomName: roomName, user: this.state.username})
    this.setState({room_check: false})
    this.setState({room:''})
  }

  sendMessage(event) {
    event.preventDefault();
    socket.emit('chat-message', {message: this.state.message})
    this.setState({message: ''});
  }

  

  componentDidMount(){
  // reception des messages
    socket.on('chat-message', (data) =>{
      this.setState({messages: [...this.state.messages, data]});
    });

    socket.on('login',(data) => {
      this.setState({username: data.userName});
    });
    
    socket.on('room-service',(data) => {
      this.setState({room: data[0], playerOne: data[1], playerTwo: data[2]});
    });

    socket.on('playerNumber', (data) =>{
      this.setState({playerNumber: data})
    })

    socket.on('room-list', (data) => {
      this.setState({rooms: data});
      console.log("state room : ", this.state.rooms);
    })

  }
  render(){
    // console.log(this.state);
    console.log('playerone ' + this.state.playerOne)

    return (

      <> 
        { this.state.session ?
          <div>
           {  !this.state.room_check ?
            <div className="room">
              
              <section className="chat">
                  {this.state.rooms.map(item => {
                    return (
                      <div>{item}
                      <button onClick={()=>this.joinRoom(item)}>Join room</button> 
                      

                      </div>
                    )}
                  )}
              </section>
              <h5>Hello {this.state.username}</h5>
              <form>
                <input
                  className="m"
                  autoComplete="off"
                  value={this.state.room}
                  onChange={ev => this.setState({room: ev.target.value})}/> 
                <button onClick={this.createRoom}>Create room</button>
              </form>
              
            </div>
            :
            <div>
              <div className="chat_room">
                <div>
                  <h3 className='roomName'> chat room name :{this.state.room}</h3>
                  <button onClick={() => this.leaveRoom(this.state.room)}>Leave room</button>
                </div>
                <form action="">
                  <input
                    className="m"
                    autoComplete="off"
                    value={this.state.message}
                    onChange={ev => this.setState({message: ev.target.value})}/> 
                  <button onClick={this.sendMessage}>Send</button>
                </form>
                <section className="chat">
                  {this.state.messages.map(msg => {
                    return (
                      <p>{msg.username} {msg.message}</p>
                    )}
                  )}
                </section>
              </div>
              <Game
                playerOne = {this.state.playerOne}
                playerTwo = {this.state.playerTwo}
                playerNumber = {this.state.playerNumber}
                socket={socket}
              />  
            </div>
          }
          </div>
          :
           <section className="login">
            <form action="">
              <label htmlFor="u">Username </label>
              <input
                className="u" 
                onChange={ev => this.setState({username: ev.target.value})}
                autoComplete="off"
                autoFocus />
              <button onClick={this.login}>Login</button>
            </form>
          </section>
        }
      </>
    );
  }
}
export default Chat;
