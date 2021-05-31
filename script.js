var board,
	game = new Chess();

jQuery("#chess_board").on(
	"scroll touchmove touchend touchstart contextmenu",
	function (e) {
		e.preventDefault();
	}
);
function undo() {
	game.undo();
	board.position(game.fen());
}
$("#undoButton").on("click", function () {
	if (game.history().length >= 2) {
		undo();
		window.setTimeout(function () {
			undo();
		}, 250);
	} else {
		alert("Nothing to undo");
	}
});

var minmaxTree = function (depth, game, isMaximisingPlayer) {
	var possibleMoves = game.ugly_moves();
	var bestMove = -1000;
	var bestMoveFound;

	for (var i = 0; i < possibleMoves.length; i++) {
		var possibleMove = possibleMoves[i];
		game.ugly_move(possibleMove);
		var value = minimax(depth - 1, game, -99999, 99999, !isMaximisingPlayer);

		game.undo();
		if (value >= bestMove) {
			bestMove = value;
			bestMoveFound = possibleMove;
		}
	}
	return bestMoveFound;
};

var minimax = function (depth, game, alpha, beta, isMaximisingPlayer) {
	positionCounter++;
	if (depth === 0) {
		return -getBoardValue(game.board());
	}

	var possibleMoves = game.ugly_moves();

	if (isMaximisingPlayer) {
		var bestMove = -1000;
		for (var i = 0; i < possibleMoves.length; i++) {
			game.ugly_move(possibleMoves[i]);
			bestMove = Math.max(
				bestMove,
				minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer)
			);
			game.undo();
			alpha = Math.max(alpha, bestMove);
			if (beta <= alpha) {
				return bestMove;
			}
		}
		return bestMove;
	} else {
		var bestMove = 1000;
		for (var i = 0; i < possibleMoves.length; i++) {
			game.ugly_move(possibleMoves[i]);
			bestMove = Math.min(
				bestMove,
				minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer)
			);
			game.undo();
			beta = Math.min(beta, bestMove);
			if (beta <= alpha) {
				return bestMove;
			}
		}
		return bestMove;
	}
};

var getBoardValue = function (board) {
	var boardValue = 0;
	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {
			boardValue = boardValue + getPieceValue(board[i][j], i, j);
		}
	}
	return boardValue;
};
var calculatePieceValue = function (piece, color, x, y) {
	if (piece.type === "p") {
		return 10 + (color === "w" ? whitePawn[x][y] : blackPawn[x][y]);
	} else if (piece.type === "n") {
		return 30 + (color === "w" ? whiteKnight[x][y] : blackKnight[x][y]);
	} else if (piece.type === "b") {
		return 30 + (color === "w" ? whiteBishop[x][y] : blackBishop[x][y]);
	} else if (piece.type === "r") {
		return 50 + (color === "w" ? whiteRook[x][y] : blackRook[x][y]);
	} else if (piece.type === "q") {
		return 90 + (color === "w" ? whiteQueen[x][y] : blackQueen[x][y]);
	} else if (piece.type === "k") {
		return 1000 + (color === "w" ? whiteKing[x][y] : blackKing[x][y]);
	}
};

var getPieceValue = function (piece, x, y) {
	if (piece === null) {
		return 0;
	}

	var pieceValue = calculatePieceValue(piece, piece.color === "w", x, y);
	return piece.color === "w" ? pieceValue : -pieceValue;
};

var whitePawn = [
	[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
	[5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
	[1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
	[0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
	[0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
	[0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
	[0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
	[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
];
var whiteKnight = [
	[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
	[-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
	[-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
	[-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
	[-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
	[-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
	[-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
	[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
];
var whiteBishop = [
	[-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
	[-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
	[-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
	[-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
	[-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
	[-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
	[-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
	[-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
];
var whiteRook = [
	[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
	[0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0],
];
var whiteQueen = [
	[-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
	[-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
	[-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
	[-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
	[0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
	[-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
	[-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
	[-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
];
var whiteKing = [
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
	[-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
	[2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
	[2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0],
];

var blackPawn = whitePawn.slice().reverse();
var blackKnight = whiteKnight.slice().reverse();
var blackBishop = whiteBishop.slice().reverse();
var blackRook = whiteRook.slice().reverse();
var blackQueen = whiteQueen.slice().reverse();
var blackKing = whiteKing.slice().reverse();

var makeBestMove = function () {
	var bestMove = getBestMove(game);
	game.ugly_move(bestMove);
	if (bestMove.captured !== undefined) {
		getCapturedPiece(bestMove.captured, "w");
	}
	board.position(game.fen());
	showPlayedMovesHistory(game.history());
	if (game.game_over()) {
		alertEndMessage();
		return;
	}
	console.log(getBoardValue(game.board()));
};
var alertEndMessage = function () {
	game.in_checkmate() ? alert("Check Mate!") : null;
	game.in_stalemate() ? alert("Stale Mate!") : null;
	game.in_threefold_repetition() ? alert("Threefold repetition!") : null;
	game.insufficient_material() ? alert("Insufficient material!") : null;
	game.in_draw() ? alert("Draw!") : null;
};
var positionCounter;
var getBestMove = function (game) {
	if (game.game_over()) {
		alertEndMessage();
		return;
	}

	depth = parseInt($("#search-depth").find(":selected").text());
	positionCounter = 0;

	var startTime = new Date().getTime();
	var bestMove = minmaxTree(depth, game, true);
	var finishTime = new Date().getTime();

	$(".positions-counter").text(positionCounter);
	positionsPerSec = (positionCounter * 1000) / (finishTime - startTime);
	$(".positions-persecond").text(positionsPerSec.toFixed(2));
	return bestMove;
};

var showPlayedMovesHistory = function (moves) {
	var historyEl = $("#movesHistory").empty();
	historyEl.empty();
	for (var i = 0; i < moves.length; i = i + 2) {
		historyEl.append(
			"<span>" +
				moves[i] +
				" " +
				(moves[i + 1] ? moves[i + 1] : " ") +
				"</span><br>"
		);
	}
	historyEl.scrollTop(historyEl[0].scrollHeight);
};
whitePieceCounter = {
	p: 0,
	n: 0,
	b: 0,
	r: 0,
	q: 0,
};
blackPieceCounter = {
	p: 0,
	n: 0,
	b: 0,
	r: 0,
	q: 0,
};
var incrementCaptureCounter = function (capturedPiece, color) {
	if (color === "w") {
		if (capturedPiece === "p") {
			whitePieceCounter.p++;
		} else if (capturedPiece === "n") {
			whitePieceCounter.n++;
		} else if (capturedPiece === "b") {
			whitePieceCounter.b++;
		} else if (capturedPiece === "r") {
			whitePieceCounter.r++;
		} else if (capturedPiece === "q") {
			whitePieceCounter.q++;
		}
	} else if (color === "b") {
		if (capturedPiece === "p") {
			blackPieceCounter.p++;
		} else if (capturedPiece === "n") {
			blackPieceCounter.n++;
		} else if (capturedPiece === "b") {
			blackPieceCounter.b++;
		} else if (capturedPiece === "r") {
			blackPieceCounter.r++;
		} else if (capturedPiece === "q") {
			blackPieceCounter.q++;
		}
	}
};
var getImageName = function (capturedPiece, color) {
	if (color === "w") return whitePieceCounter[capturedPiece];
	return blackPieceCounter[capturedPiece];
};
var DeleteCapturedPieceImg = function (capturedPiece, color) {
	color = color === "w" ? "black" : "white";
	$("." + color + capturedPiece + " ." + color + "Captures").remove();
};
var getCapturedPiece = function (capturedPiece, color) {
	var colorClass = null;
	if (color === "w") {
		colorClass = "black";
	} else if (color === "b") {
		colorClass = "white";
	}
	incrementCaptureCounter(capturedPiece, color);
	DeleteCapturedPieceImg(capturedPiece, color);
	var capturedPieceEl = $("." + colorClass + capturedPiece);
	capturedPieceEl.append(
		"<img class=" +
			colorClass +
			"Captures" +
			' src="./captures/' +
			color +
			capturedPiece +
			"x" +
			getImageName(capturedPiece, color) +
			'.png" />'
	);
};

// ### CONFIG FUNCTIONS ###

//executes when user picks up chess piece
var onDragStart = function (source, piece, position, orientation) {
	if (
		game.in_checkmate() === true ||
		game.in_draw() === true
		// || 	piece.search(/^b/) !== -1
	) {
		return false;
	}
};

//executes when user drops down chess piece
var onDrop = function (source, target) {
	var move = game.move({
		from: source,
		to: target,
		promotion: $("#promote-to").find(":selected").text().toLowerCase(), //always promote to QUEEN for now
	});

	removeHighlightedSquares();
	if (move === null) {
		return "snapback";
	}
	if (move.captured !== undefined) {
		getCapturedPiece(move.captured, "b");
	}
	showPlayedMovesHistory(game.history());
	window.setTimeout(makeBestMove, 300);
};

//executes when cursor hovers square
var onMouseoverSquare = function (square, piece) {
	var moves = game.moves({
		square: square,
		verbose: true,
	});

	if (moves.length === 0) return;
	highlightSquares(square, moves[0].from);

	for (var i = 0; i < moves.length; i++) {
		highlightSquares(moves[i].to);
	}
};
//executes when mouse stops hovering square
var onMouseoutSquare = function (square, piece) {
	removeHighlightedSquares();
};

//executes after "snap" animation finishes
var onSnapEnd = function () {
	board.position(game.fen());
};
// ##########################

var removeHighlightedSquares = function () {
	$("#board .square-55d63").css("background", "");
	$("#board .square-55d63").css("box-shadow", "");
};
var highlightSquares = function (square, initSquare) {
	var squareElements = $("#board .square-" + square);
	var initialSquare = $("#board .square-" + initSquare);

	var darkenBG = "#b4aa8c";
	if (squareElements.hasClass("black-3c85d") === true) {
		darkenBG = "#506450";
	}

	url = "./circle20x20x70p.png";
	var onHoverCssObject = {
		"background-color": darkenBG,
		"background-repeat": "no-repeat",
		"background-size": "30%",
		"background-position": "center",
		"background-image": "url(" + url + ")",
	};
	squareElements.css(onHoverCssObject);
	initialSquare.css("background-image", "");
};

// window.setTimeout(makeBestMove, 300);
var cfg = {
	// orientation: "black",
	draggable: true,
	position: "start",
	onDragStart: onDragStart,
	onDrop: onDrop,
	onMouseoutSquare: onMouseoutSquare,
	onMouseoverSquare: onMouseoverSquare,
	onSnapEnd: onSnapEnd,
};
board = ChessBoard("board", cfg);
