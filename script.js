var board,
	game = new Chess();

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
		var bestMove = 9999;
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
			boardValue = boardValue + getPieceValue(board[i][j]);
		}
	}
	return boardValue;
};
var calculatePieceValue = function (piece) {
	if (piece.type === "p") {
		return 10;
	} else if (piece.type === "n") {
		return 30;
	} else if (piece.type === "b") {
		return 30;
	} else if (piece.type === "r") {
		return 50;
	} else if (piece.type === "q") {
		return 90;
	} else if (piece.type === "k") {
		return 1000;
	}
};
var getPieceValue = function (piece) {
	if (piece === null) {
		return 0;
	}

	var pieceValue = calculatePieceValue(piece, piece.color === "w");
	return piece.color === "w" ? pieceValue : -pieceValue;
};

var makeBestMove = function () {
	var bestMove = getBestMove(game);
	game.ugly_move(bestMove);
	// console.log(bestMove.captured);
	if (bestMove.captured !== undefined) {
		getCapturedPiece(bestMove.captured, "w");
	}
	board.position(game.fen());
	showPlayedMovesHistory(game.history());
	if (game.game_over()) {
		alert("Game over");
	}
};

var getBestMove = function (game) {
	if (game.game_over()) {
		alert("Game over");
	}
	depth = 3; //make it so user inputs depth

	var bestMove = minmaxTree(depth, game, true);
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
		game.in_draw() === true ||
		piece.search(/^b/) !== -1
	) {
		return false;
	}
};

//executes when user drops down chess piece
var onDrop = function (source, target) {
	var move = game.move({
		from: source,
		to: target,
		promotion: "q", //always promote to QUEEN for now
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

	// console.log(square);
	// console.log(moves[0].from);
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

var cfg = {
	draggable: true,
	position: "start",
	onDragStart: onDragStart,
	onDrop: onDrop,
	onMouseoutSquare: onMouseoutSquare,
	onMouseoverSquare: onMouseoverSquare,
	onSnapEnd: onSnapEnd,
};
board = ChessBoard("board", cfg);
