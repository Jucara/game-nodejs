export default class Piece {
  constructor(player, img){
    this.player = player;
       this.style = {backgroundImage: "url('"+img+"')"};
  }
}
