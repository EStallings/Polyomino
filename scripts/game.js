//==  GAME UTILS  ============================================================//

var resetStorage = false;

function initGame(){
	dragging             = false;
	snapping             = false;
	currentlyAnimating   = true;
	triggerDetectSquares = true;
	spawnNewPoly         = false;
	gameWon              = false
	comboActiveCtr       = 0;
}

function newGame(){
	board = new grid(gridSize);
	for(var i=0;i<board.size;++i)for(var j=0;j<board.size;++j)
		board.setCell(i,j,new cell());

	blockId = 0;
	score   = 0;

	initGame();
	placeStartingPolys();
	updateScoreBoxes();
	saveGame();
}

function loadGame(){
	if(bypassLoadGame)return false;
	try{
		if(typeof(Storage) !== "undefined") {
			var storedBoard = JSON.parse(localStorage.getItem("board"));
			if(!storedBoard)
				return false;
			console.log(storedBoard);
			board = new grid(gridSize);
			for(var i=0;i<board.size;++i)for(var j=0;j<board.size;++j){
				var s = storedBoard[i][j];
				var c = new cell();
				c.quickSet(s.occupied,s.id,s.order);
				board.setCell(i,j,c);
			}
			blockId = parseInt(localStorage.getItem("blockId"));
			score   = parseInt(localStorage.getItem("score"));
			var testscoreFuncVersion = parseInt(localStorage.getItem("scoreFuncVersion"));
			if(scoreFuncVersion === testscoreFuncVersion)
				highScore = parseInt(localStorage.getItem("highScore"));
			else
				highScore = 0;
			initGame();
			return true;
		}
	}catch(e){return false;}
	return false;
}

function saveGame(){
	if(typeof(Storage) !== "undefined") {
		localStorage.setItem("board",            JSON.stringify(board));
		localStorage.setItem("blockId",          blockId);
		localStorage.setItem("score",            score);
		localStorage.setItem("scoreFuncVersion", scoreFuncVersion);
		localStorage.setItem("highScore",        highScore);
	}
}

function gameOver(){
	// TODO: spin off animation event, bool for temp control override (click to continue?)
}

//==  SCORE RELATED  =========================================================//

function addToScore(squareOrder,pieceOrder,multiplier){
	score += Math.floor(Math.pow(squareOrder*squareOrder*pieceOrder, multiplier*0.5+0.5));
	if(score > highScore)highScore = score;
	updateScoreBoxes();
}

var scoreFuncVersion = btoa(addToScore.toString());

function updateScoreBoxes(){
	document.querySelector(".highscore").textContent = highScore;
	document.querySelector(".score").textContent = score;
	$('#gameOverScore')[0].innerHTML = score;
	$('#gameWonScore')[0].innerHTML = score;

}

//==  ENTRY FUNCTION  ========================================================//

$(function(){

	// setup controls and canvas element
	canvas = document.getElementById("canvas");
	gfx = canvas.getContext("2d");
	window.onresize();  // determine grid/cell size
	//setupInstruction(); // setup instructions based on grid size
	setupControls();

	// see if first-time visitor and needs instructions
	if(typeof(Storage) !== "undefined"){
		if(resetStorage){
			localStorage.clear();
		}

		var visited = localStorage.getItem("visited");
		if(!visited){
			localStorage.setItem("visited",          true);
			localStorage.setItem("scoreFuncVersion", scoreFuncVersion);
			localStorage.setItem("highScore",        0);

			// XXX: direct user to instructions
			location = "#instructions";
		}else{
			// XXX: direct user to game
			location = "#close";
		}
	}

	// setup game
	var success = loadGame();
	console.log(success);
	if(!success)
		newGame();
	updateScoreBoxes();

	// begin game
	tick=new Date().getTime();
	render();
});
