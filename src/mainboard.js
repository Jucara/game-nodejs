import React, { Component } from 'react'
import './index.css';


class Game extends Component{
  constructor(props){
    super(props);
    
    
    this.state = {
      endpoint: "localhost:8000",
      board: {},
      selected: '',
      legalMove: [],
      mandatory: [],
      colNames: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

    };
    this.socket = props.socket;
    const colNames = this.state.colNames;
    for(let row = 0; row < 8; row++){
      for(let col = 0; col < 8; col++){
        let id = colNames[col] + (row+1);
        this.state.board[id] = {
          color: (row+col)%2 ? 'light' : 'dark',
          id: colNames[col] + (row+1),
          content: '',
          pieceColor: '',
          highlighted: false,
          queen: false
        };
      }
    }
  }

  changePiece(id, content, color, isQueen){
    let newBoard = this.state.board;
    newBoard[id].content = content
    newBoard[id].pieceColor = color;
    newBoard[id].queen = isQueen;
    this.setState({board: newBoard});
  } 

  handleClick(id){
    id.preventDefault();
    let choice = id.currentTarget.id;
    if(this.state.board[choice].content === ''){
      this.handleEmpty(choice)
    }
    else {
      this.handleOccupied(choice)
    }
  }

  handleEmpty(choice){

    if(this.state.selected){
      if((this.state.mandatory.length !== 0) && (this.state.mandatory.indexOf(this.state.selected + choice ) === -1)) {
        console.log("u have to capture smthg u fool")
        return;
      }
      let index = this.state.legalMove.indexOf(choice)
      if(index !== -1){
        this.socket.emit("move", {playerNumber:this.props.playerNumber, playerMove: this.state.selected + choice});

      }
      else
        console.log('move pas legal')

    }
  }

  async handleOccupied(choice){
   await this.setState({selected: choice});
   for(let square in this.state.board){
     if(this.state.board[square].pieceColor === this.state.board[choice].pieceColor)
       this.mandatoryMove(this.state.board[square]);

   }
   let legalMove = this.possibleMove();
   this.setState({legalMove: legalMove});
   let newBoard = {...this.state.board};
   for(let square in newBoard){
     newBoard[square].highlighted = legalMove.includes(square);
   }
   console.log(this.state.mandatory);
   this.setState({board: newBoard});
  }

 mandatoryMove(cell) {
       
       let letter = cell.id.substring(0,1);
       let column = this.state.colNames.indexOf(letter) + 1;
       let row = parseInt(cell.id.substring(1));
       let pieceColor = cell.pieceColor;
       let newMandatory = this.state.mandatory;

       if ((pieceColor === 'red' || cell.queen) && (column - 3 >= 0) && (row < 7) && ((this.state.board[this.state.colNames[column - 2] + (row + 1)].pieceColor !== pieceColor) && this.state.board[this.state.colNames[column - 2] + (row + 1)].content !== '') &&  (this.state.board[(this.state.colNames[column - 3] + (row + 2))].content === '')) {

         if(this.state.mandatory.indexOf(cell.id + this.state.colNames[column - 3] + (row + 2)) === -1) {
          console.log(cell);
          console.log(pieceColor);
           newMandatory.push(cell.id + this.state.colNames[column - 3] + (row + 2))
           
         }
        }

       if ((pieceColor === 'red' || cell.queen) && (column < 7) && (row < 7) && ((this.state.board[this.state.colNames[column] + (row + 1)].pieceColor !== pieceColor) && this.state.board[this.state.colNames[column] + (row + 1)].content !== '') &&  (this.state.board[(this.state.colNames[column + 1] + (row + 2))].content === '')) {

         if(this.state.mandatory.indexOf(cell.id + this.state.colNames[column + 1] + (row + 2)) === -1) {
           
           newMandatory.push(cell.id + this.state.colNames[column + 1] + (row + 2))
         }
       }

       if ((pieceColor === 'blue' || cell.queen) && (column - 3 >= 0) && (row > 2) && ((this.state.board[this.state.colNames[column - 2] + (row - 1)].pieceColor !== pieceColor) && this.state.board[this.state.colNames[column - 2] + (row - 1)].content !== '') &&  (this.state.board[(this.state.colNames[column - 3] + (row - 2))].content === '')) {

         if(this.state.mandatory.indexOf(cell.id + this.state.colNames[column - 3] + (row - 2)) === -1) {
          console.log(cell);
          console.log(pieceColor);
           newMandatory.push(cell.id + this.state.colNames[column - 3] + (row - 2))
           
         }
       }

       if ((pieceColor === 'blue' || cell.queen) && (column < 7) && (row > 2) && ((this.state.board[this.state.colNames[column] + (row - 1)].pieceColor !== pieceColor) && this.state.board[this.state.colNames[column] + (row - 1)].content !== '') &&  (this.state.board[(this.state.colNames[column + 1] + (row - 2))].content === '')) {

         if(this.state.mandatory.indexOf(cell.id + this.state.colNames[column + 1] + (row - 2)) === -1) {
          
           newMandatory.push(cell.id + this.state.colNames[column + 1] + (row - 2))
          
         }
       }
       this.setState({mandatory: newMandatory});
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

      if(((column - 2 >= 0) && (row < 8) && (this.state.board[moveLowerLeft].content === '' ) && (pieceColor === 'red' || selected.queen)) || ((pieceColor === 'red' || selected.queen) && (column - 3 >= 0) && (row < 7) && (this.state.board[moveLowerLeft].pieceColor !== pieceColor) &&   (this.state.board[(this.state.colNames[column - 3] + (row + 2))].content === ''))){
        if(this.state.board[moveLowerLeft].content === '')
          legalMove.push(moveLowerLeft);

        else
          legalMove.push((this.state.colNames[column - 3] + (row + 2)));
      }

      if(((column < 8) && (row < 8) && (this.state.board[moveLowerRight].content === '') && (pieceColor === 'red' || selected.queen)) || ((pieceColor === 'red' || selected.queen) && (column < 7) && (row < 7) && (this.state.board[moveLowerRight].pieceColor !== pieceColor) && (this.state.board[(this.state.colNames[column + 1] + (row + 2))].content === ''))){
        if(this.state.board[moveLowerRight].content === '')
          legalMove.push(moveLowerRight);

        else
          legalMove.push((this.state.colNames[column + 1] + (row + 2)));
      }

      if(((column - 2 >= 0) && (row >= 2) && (this.state.board[moveUpperLeft].content === '') && (pieceColor === 'blue' || selected.queen)) || ((pieceColor === 'blue' || selected.queen) && (column - 3 >= 0) && (row > 2) && (this.state.board[moveUpperLeft].pieceColor !== pieceColor) && (this.state.board[(this.state.colNames[column - 3] + (row - 2))].content === ''))){
        if(this.state.board[moveUpperLeft].content === '')
          legalMove.push(moveUpperLeft);

        else
          legalMove.push((this.state.colNames[column - 3] + (row - 2)));
      }

      if(((column < 8) && (row >= 2) && (this.state.board[moveUpperRight].content === '') && (pieceColor === 'blue' || selected.queen)) || ((pieceColor === 'blue' || selected.queen) && (column < 7) && (row > 2) && (this.state.board[moveUpperRight].pieceColor !== pieceColor) && (this.state.board[(this.state.colNames[column + 1] + (row - 2))].content === ''))){
        if(this.state.board[moveUpperRight].content === '')
          legalMove.push(moveUpperRight);

        else
          legalMove.push((this.state.colNames[column + 1] + (row - 2)));
      }
      return legalMove;
    }

    componentDidMount(){
      const reds = ['A1', 'A3', 'B2', 'C1', 'C3', 'D2', 'E1', 'E3', 'F2', 'G1', 'G3', 'H2'];
      const blues = ['A7', 'B6', 'B8', 'C7', 'D6', 'D8', 'E7', 'F6', 'F8', 'G7', 'H6', 'H8'];
      reds.forEach(pos => this.changePiece(pos, <div className="red checker"></div>, 'red', false));
      blues.forEach(pos => this.changePiece(pos, <div className="blue checker"></div>, 'blue', false));

      // reception des messages
      
      this.socket.on('move',(data) => {
        let choice = data.playerMove.substring(2,4);
        let newBoard = {...this.state.board};
        this.state.legalMove.forEach(element => {newBoard[element].highlighted = false});
        this.setState({board: newBoard});
        let selected = data.playerMove.substring(0, 2);
        console.log(selected)
        
        let pieceColor = this.state.board[selected].pieceColor;

        let row_origin = parseInt(selected.substring(1));
        let row_destination = parseInt(choice.substring(1));

        if(row_destination === 8 && pieceColor === 'red'){
          this.changePiece(choice, <div className="red-queen checker"></div>, pieceColor, true)

        }

        else if(row_destination === 1 && pieceColor === 'blue'){
          this.changePiece(choice, <div className="blue-queen checker"></div>, pieceColor, true)

        }

        else {
          this.changePiece(choice, this.state.board[selected].content, pieceColor, this.state.board[selected].isQueen);
        }

        if (Math.abs(row_origin - row_destination) > 1) {
          let column_origin = this.state.colNames.indexOf(selected.substring(0, 1));
          let column_destination = this.state.colNames.indexOf(choice.substring(0, 1));


          this.changePiece((this.state.colNames[(column_origin + column_destination) / 2] + ((row_origin + row_destination) / 2)) , '', '', false);
        }
        this.changePiece(selected, '', '', false);
        this.setState({legalMove: []});
        this.setState({mandatory: []});
        this.setState({selected: ''});
      });
      this.socket.on('gameOver', data =>{

      })

//-------------------------------------------------------------
}
render(){
  // console.log(this.state.board)
  return (

    <>        
    <div 
    className="col align-self-center" 
    id="mainboard">
    <h1 className='title'> 
      Mon jeu de dames 
    </h1>
    <p className="vs">
     {this.props.playerOne} vs {this.props.playerTwo}</p>
    
    <div id="checker-board">
    {Object.keys(this.state.board).map(key => {
      let square = this.state.board[key];
      return (
        <div 
        className={`square ${square.color}${square.highlighted ? ' highlighted' : ''}`} 
        id={square.id} 
        key={square.id} 
        onClick={this.handleClick.bind(this)}>{square.content}
        </div>
        )})}
    </div>
    </div>

    </>
    );
  }
}

export default Game;
