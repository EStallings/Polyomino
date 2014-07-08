function newGame(){
	boardMain = new grid(gridSize);
  boardFloating = new grid(gridSize);
	for(var i=0;i<gridSize;++i)for(var j=0;j<gridSize;++j) {
    boardMain.setCell(i, j, new cell());
    boardFloating.setCell(i, j, new cell());
  }

	blockId = 0;
	score = 0;
	// TODO: should highScore be considered here? its only ever defined in loadGame
	dragging = false;
	snapping = false;
	currentlyAnimating = true;
	triggerDetectSquares = true;
	for(var i=0;i<initPieceCount;++i)placeNewPoly();
	updateScoreBoxes();
}

function gameOver(){
	// TODO: spin off animation event, bool for temp control override (click to continue?)
}

function loadGame(){
	if(bypassLoadGame)return false;
	try{
		if(typeof(Storage) !== "undefined") {
			var storedBoard = JSON.parse(localStorage.getItem("board"));
			if(!storedBoard)
				return false;
			boardMain = new grid(gridSize);
      boardFloating = new grid(gridSize);
			for(var i=0;i<gridSize;++i)for(var j=0;j<gridSize;++j){
        boardMain .setCell(i, j, new cell());
        boardMain [i][j].occupied = storedboard[i][j].occupied;
        boardMain [i][j].id = storedboard[i][j].id;
        boardMain [i][j].order = storedboard[i][j].order;

        boardFloating.setCell(i, j, new cell());
			}




			blockId = parseInt(localStorage.getItem("blockId"));
			score = parseInt(localStorage.getItem("score"));
			var testscoreFuncVersion = parseInt(localStorage.getItem("scoreFuncVersion"));
			if(scoreFuncVersion === testscoreFuncVersion)
				highScore = parseInt(localStorage.getItem("highScore"));
			else
				highScore = 0;
			dragging = false;
			snapping = false;
			currentlyAnimating = true;
			triggerDetectSquares = true;
			return true;
		}
	}catch(e){return false;}
	return false;
}

function saveGame(){
	if(typeof(Storage) !== "undefined") {
		localStorage.setItem("board", JSON.stringify(boardMain));
		localStorage.setItem("blockId", blockId);
		localStorage.setItem("score", score);
		localStorage.setItem("scoreFuncVersion", scoreFuncVersion);
		localStorage.setItem("highScore", highScore);
	}
}

function setupInstruction(){
	var txt = "Can you reach the " + ((gridSize === 10) ? "<i>hexomino</i>" : "<i>pentomino</i>") + "? (contains " + ((gridSize === 10) ? '6' : '5') +  " squares)";
	document.getElementById("inst_inner").innerHTML = txt;
}

function clearContainer(container){
	while(container.firstChild){
		container.removeChild(container.firstChild);
	}
}

// IMPORTANT: If you update the score function, increment this!
// XXX: can't you compute the hash of the score function and use that instead?
var scoreFuncVersion = 2;

function addToScore(ord){
	score += (ord*ord) * scoreCombo; //dummy score function. May be updated!
	scoreTick = tick;

	// TODO show points on-board (particles? some other effect?)
	if(score > highScore)highScore = score;
	updateScoreBoxes();
}

function updateScoreBoxes(){
	document.querySelector(".highscore").textContent = highScore;
	document.querySelector(".score").textContent = score;
}

$(function(){

	// setup controls and canvas element
	canvas = document.getElementById("canvas");
	gfx = canvas.getContext("2d");
	window.onresize();  // determine grid/cell size
	setupInstruction(); // setup instructions based on grid size
	setupControls();

	// see if first-time visitor and needs instructions
	if(typeof(Storage) !== "undefined"){
		var visited = localStorage.getItem("visited");
		if(!visited)
			location = "#instructions";
		else
			location = "#close";
		localStorage.setItem("visited", true);
	}

	// setup game
	initShapes();
	if(!loadGame())newGame();
	updateScoreBoxes();

	// begin game
	tick=new Date().getTime();
	render();
});
