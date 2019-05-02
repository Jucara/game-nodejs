import React, { Component } from 'react';

export default class Mainboard extends Component {

  constructor(){
    super();

    this.state = {
      board: {},
      selected: '',
      legalMove: [],
      colNames: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    }
    
    const colNames = this.state.colNames;
    for(let row = 0; row < 8; row++){
      for(let col = 0; col < 8; col++){
        let id = colNames[col] + (row+1);
        this.state.board[id] = {
          color: (row+col)%2 ? 'light' : 'dark',
          id: colNames[col] + (row+1),
          content: '',
          pieceColor: '',
          highlighted: false
        };
      }
    }
  }

  componentDidMount(){
    const reds = ['A1', 'A3', 'B2', 'C1', 'C3', 'D2', 'E1', 'E3', 'F2', 'G1', 'G3', 'H2'];
    const blues = ['A7', 'B6', 'B8', 'C7', 'D6', 'D8', 'E7', 'F6', 'F8', 'G7', 'H6', 'H8'];
    reds.forEach(pos => this.changePiece(pos, <div className="red checker"></div>, 'red'));
    blues.forEach(pos => this.changePiece(pos, <div className="blue checker"></div>, 'blue'));
  }

  changePiece(id, content, color){
    let newBoard = this.state.board;
    newBoard[id].content = content;
    newBoard[id].pieceColor = color;
    this.setState({board: newBoard});
  }

  handleClick(id){
    id.preventDefault();
     let choice = (id.currentTarget.id);
     if(this.state.board[choice].content === ''){
       this.handleEmpty(choice)
     }
     else {
       this.handleOccupied(choice)
     }
  }

  handleEmpty(choice){
    if(this.state.selected){
        
      let index = this.state.legalMove.indexOf(choice)
      if(index !== -1){
        let newBoard = {...this.state.board};
        this.state.legalMove.forEach(element => {newBoard[element].highlighted = false});
        this.setState({board: newBoard});
        let selected = this.state.board[this.state.selected];
        let pieceColor = selected.pieceColor;
        
        let row_origin = parseInt(this.state.selected.substring(1));
        let row_destination = parseInt(choice.substring(1));
        if (Math.abs(row_origin - row_destination) > 1) {
          let column_origin = this.state.colNames.indexOf(this.state.selected.substring(0, 1));
          let column_destination = this.state.colNames.indexOf(choice.substring(0, 1));
          console.log((row_origin + row_destination) / 2)
          this.changePiece((this.state.colNames[(column_origin + column_destination) / 2] + ((row_origin + row_destination) / 2)) , '', '');
        }
        this.changePiece(choice, selected.content, pieceColor);
        this.changePiece(this.state.selected, '', '');
        this.setState({legalMove: []});
      }
      else{
        console.log('move pas legal')
      }
    }
  }

  async handleOccupied(choice){
    await this.setState({selected: choice});
    let legalMove = this.possibleMove();
    this.setState({legalMove: legalMove});
    let newBoard = {...this.state.board};
    for(let square in newBoard){
      newBoard[square].highlighted = legalMove.includes(square);
    }
    
    this.setState({board: newBoard});
  }

  possibleMove(){
    let selected = this.state.board[this.state.selected];
    let pieceColor = selected.pieceColor;
    let letter = this.state.selected.substring(0,1);
    let column = this.state.colNames.indexOf(letter) + 1;
    let row = parseInt(this.state.selected.substring(1));
    let legalMove = [];

    let moveUpperLeft = this.state.colNames[column - 2] + (row - 1);
    let moveUpperRight = this.state.colNames[column] + (row - 1);
    let moveLowerLeft = this.state.colNames[column - 2] + (row + 1);
    let moveLowerRight = this.state.colNames[column] + (row + 1);
  
    if(((column - 2 >= 0) && (row < 8) && (this.state.board[moveLowerLeft].content === '') && (pieceColor === 'red')) || ((pieceColor === 'red') && (column - 3 >= 0) && (this.state.board[moveLowerLeft].pieceColor !== pieceColor) &&   (this.state.board[(this.state.colNames[column - 3] + (row + 2))].content === ''))){
      if(this.state.board[moveLowerLeft].content === '')
        legalMove.push(moveLowerLeft);

      else
        legalMove.push((this.state.colNames[column - 3] + (row + 2)));
    }
    
    if(((column < 8) && (row < 8) && (this.state.board[moveLowerRight].content === '') && (pieceColor === 'red')) || ((pieceColor === 'red') && (column < 7) && (row < 7) && (this.state.board[moveLowerRight].pieceColor !== pieceColor) && (this.state.board[(this.state.colNames[column + 1] + (row + 2))].content === ''))){
      if(this.state.board[moveLowerRight].content === '')
        legalMove.push(moveLowerRight);

      else
        legalMove.push((this.state.colNames[column + 1] + (row + 2)));
    }

    if(((column - 2 >= 0) && (row >= 2) && (this.state.board[moveUpperLeft].content === '') && (pieceColor === 'blue')) || ((pieceColor === 'blue') && (column - 3 >= 0) && (row > 2) && (this.state.board[moveUpperLeft].pieceColor !== pieceColor) && (this.state.board[(this.state.colNames[column - 3] + (row - 2))].content === ''))){
      if(this.state.board[moveUpperLeft].content === '')
        legalMove.push(moveUpperLeft);

      else
        legalMove.push((this.state.colNames[column - 3] + (row - 2)));
    }
    
    if(((column < 8) && (row >= 2) && (this.state.board[moveUpperRight].content === '') && (pieceColor === 'blue')) || ((pieceColor === 'blue') && (column < 7) && (row > 2) && (this.state.board[moveUpperRight].pieceColor !== pieceColor) && (this.state.board[(this.state.colNames[column + 1] + (row - 2))].content === ''))){
      if(this.state.board[moveUpperRight].content === '')
        legalMove.push(moveUpperRight);

      else
        legalMove.push((this.state.colNames[column + 1] + (row - 2)));
    }
    return legalMove;
  }
  
  render() {
    console.log(this.state.board)
    return (

      <div className="main-view">
        <div className="game-elements">
          <div className="top-elements">

          </div>

        </div>
        <div id="checker-board">
          {Object.keys(this.state.board).map(key => {
            let square = this.state.board[key];
            return (
            <div className={`square ${square.color}${square.highlighted ? ' highlighted' : ''}`} id={square.id} key={square.id} onClick={this.handleClick.bind(this)}>
              {square.content}
            </div>

          )})}
        </div>
        <div className="top-elements">

        </div>
      </div>
    );
  }
}
