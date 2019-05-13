import React, { Component } from 'react';
import Routes from './routes';


export default class App extends Component {
  constructor(){
    super();
    this.state = {
      
    }
  }
  render() {
    return (
      <div className="App">
        <Routes />
      </div>
    );
  }
}
