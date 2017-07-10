
var board = []; // b=empty s=sah v=vezir k=kale a=at f=fil p=piyon // d=dark w=white
var past = [];
var future = [];
var sira = 1; // 1=beyaz -1=siyah
var gameOver;
var sounds_no;
var sounds_kill;
var sounds_go;
var sounds_promotion;
var sounds_error;
var sounds_draw;
var lang = 1;
var whiterrock = true; // white in left e rock yapma sansi var
var whitelrock = true;
var blackrrock = true;
var blacklrock = true;
var touchcoords = [0,0];
var cpumode = -1;


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById("startgame").onclick = function () {
	if (document.getElementById("whitename").value && document.getElementById("blackname").value ||
	    document.getElementById("whitename").value && cpumode==1) {
		
		gameOver = false;

		// center is top left i=y j=x
		// makes board empty
		for (var i = 0; i<=9; i++) {
			board[i] = [];
			past[i] = [];
			future[i] = [];
			for (var j=0; j<=9; j++) {
				board[i][j] = 'b';
				past[i][j] = 'b';
				future[i][j] = 'b';

			}
		}	
		for (i = 0; i<=9 ; i++) {
			board[0][i]= 'u';
			board[9][i] = 'u';
			board[i][0] = 'u';
			board[i][9] = 'u';
			past[0][i]= 'u';
			past[9][i] = 'u';
			past[i][0] = 'u';
			past[i][9] = 'u';
			future[0][i]= 'u';
			future[9][i] = 'u';
			future[i][0] = 'u';
			future[i][9] = 'u';

		}


		// initial positions of pieces
		//board[8][6] = 'wv';
		/*board[1][4] = 'dk';
		board[8][7] = 'wp';*/


		
		board[1][1] = board[1][8] = 'dk';
		board[1][2] = board[1][7] = 'da';
		board[1][3] = board[1][6] = 'df';
		board[1][4] = 'dv';
		board[1][5] = 'ds';
		board[8][1] = board[8][8] = 'wk';
		board[8][2] = board[8][7] = 'wa';
		board[8][3] = board[8][6] = 'wf';
		board[8][4] = 'wv';
		board[8][5] = 'ws';
		for (i = 1; i<=8; i++) {
			board[2][i] = 'dp';
			board[7][i] = 'wp';
		}
		
		


		// name text fields become names
		document.getElementById("whitename").style.display = "none";
		document.getElementById("blackname").style.display = "none";
		document.getElementById("whitenamee").innerHTML = document.getElementById("whitename").value.toUpperCase().slice(0,20);
		document.getElementById("blacknamee").innerHTML = cpumode==1?"CPU":document.getElementById("blackname").value.toUpperCase().slice(0,20);
		document.getElementById("whitenamee").style.fontWeight = "bold";
		document.getElementById("cpumode").style.display = "none";

		// switch buttons
		document.getElementById("startgame").disabled = true;
		document.getElementById("startgame").style.color = "";
		document.getElementById("endgame").disabled = false;
		document.getElementById("endgame").style.color = "#e00";


		draw();
	}
	else error(text[lang][6]);
}








/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function moveAttempt(x, y, fx, fy) {

	x = parseInt(x);
	y = parseInt(y);
	fx = parseInt(fx);
	fy = parseInt(fy);


	// if gameover
	if (gameOver) return;


	// if empty selected
	if (board[y][x]=='b') return;

	// if tries to move to its own coords
	if (x==fx && y==fy) return;


	// if you try to move cpu's army
	if(board[y][x][0]!=(sira==1?'w':'d') && cpumode==1) {error(text[lang][15]); return;}

	// see if its your turn
	if(board[y][x][0]!=(sira==1?'w':'d')) {error(text[lang][9]); return;}

	

	// if tries to attack own army
	if (board[y][x][0]!='b' && board[y][x][0]==board[fy][fx][0]) {error(text[lang][11]); return;}


	// if valid
	if (!isvalid(x,y,fx,fy)) {error(text[lang][13]); return; }


	// if causes check
		if ( exposed(virtualmove(x,y,fx,fy),(sira==1?'w':'d')) ) { 
			
			if (exposed(board,(sira==1?'w':'d'))) {
				if ( board[y][x][1]=='s') error(text[lang][8]);
				else error(text[lang][7]);
			}
			else error(text[lang][12]);
			return;
		}


	

	
	move(x,y,fx,fy);

	
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function move(x, y, fx, fy) {

	//MUST BE CHANGED

	x = parseInt(x);
	y = parseInt(y);
	fx = parseInt(fx);
	fy = parseInt(fy);
	var move = 'go'; //go, kill, promotion, checkmate

	

	//rocking
	if (board[8][5]!='ws') {whitelrock = false; whiterrock = false; }
	if (board[1][5]!='ds') {blacklrock = false; blackrrock = false; }
	if (board[1][1]!='dk') blacklrock = false;
	if (board[1][8]!='dk') blackrrock = false;
	if (board[8][1]!='wk') whitelrock = false;
	if (board[8][8]!='wk') whiterrock = false;

	if (board[y][x]=='ws' && fx-x==2) {
		board[8][8]= 'b';
		board[8][6]= 'wk';
		whiterrock = false;
		whitelrock = false;
	}
	if (board[y][x]=='ws' && fx-x==-2) {
		board[8][1]= 'b';
		board[8][4]= 'wk';
		whitelrock = false;
		whiterrock = false;
	}
	if (board[y][x]=='ds' && fx-x==2) {
		board[1][8]= 'b';
		board[1][6]= 'dk';
		blackrrock = false;
		blacklrock = false;
	}
	if (board[y][x]=='ds' && fx-x==-2) {
		board[1][1]= 'b';
		board[1][4]= 'dk';
		blacklrock = false;
		blackrrock = false;
	}

	//en passant
	
	if (board[y][x]=='wp' && (fx-x==1 || fx-x==-1) && board[fy][fx]=='b') {
		board[fy+1][fx]='b';
		move = 'kill';
	}
	if (board[y][x]=='dp' && (fx-x==1 || fx-x==-1) && board[fy][fx]=='b') {
		board[fy-1][fx]='b';
		move = 'kill';
	}




	if (board[fy][fx]!='b') move = 'kill';



	


	for (var i = 0; i<=9; i++) {
		past[i] = [];
		for (var j = 0; j<=9; j++) {
			past[i][j] = board[i][j];
			future[i][j] = 'b';
		}
	}

	// tas degistirme
	board[fy][fx] = board[y][x];
	board[y][x] = 'b';

	//promotion
	if (board[fy][fx]=='wp' && fy==1) { board[fy][fx]='wv'; move = 'promotion'; }
	if (board[fy][fx]=='dp' && fy==8) { board[fy][fx]='dv'; move = 'promotion'; }

	//sesler
	switch(move) {
		case 'go':
		sounds_go.play();
		break;
		case 'kill':
		sounds_kill.play();
		break;
		case 'promotion':
		sounds_promotion.play();
		break;
	}




	// if draw
	var nopossiblemoves = true;
	var validareas;
	for ( i = 1; i<=8; i++) {
		for (j = 1; j<=8; j++) {
			if (board[j][i][0]==(sira==1?'d':'w')) {
				validareas = isvalid(i,j);
				for (var k = 0; k<validareas.length; k++) {
					if (!exposed(virtualmove(i,j,validareas[k][1],validareas[k][0]),(sira==1?'d':'w'))) nopossiblemoves=false;
				}
			}
		}
	}

	//draw
	if (nopossiblemoves && !exposed(board,(sira==1?'d':'w'))) {
		error(text[lang][14]);
		sounds_draw.play();
		gameOver = true;
		draw();
		return;
	}
	//checkmate
	else if (nopossiblemoves) {
		sounds_no.play();
		gameOver = true;
		for(i = 1; i<=8; i++) {
			for (j = 1; j<=8; j++) {
				if (board[j][i]==(sira==1?'d':'w')+'s') {
					board[j][i]='r';
				}
			}
		}
		draw();
		return;
	}

	/*
	//if checkmate
	for ( i = 1; i<=8; i++) {
		for (j = 1; j<=8; j++) {
			if (board[j][i][0]==(sira==1?'d':'w')) {
				validareas = isvalid(i,j);
				for (var k = 0; k<validareas.length; k++) {
					//validareas[0]==y
					if (!exposed(virtualmove(i,j,validareas[k][1],validareas[k][0]),(sira==1?'d':'w'))) checkmate=false;
				}
			}
		}
	}
	*/
/*
	if (checkmate) {
		sounds_no.play();
		move = 'checkmate';
		gameOver = true;
		console.log("gameover");
		for(i = 1; i<=8; i++) {
			for (j = 1; j<=8; j++) {
				if (board[j][i]==(sira==1?'d':'w')+'s') {
					board[j][i]='r';
				}
			}
		}
	}
*/


	

	siradegistir();
	draw();

	if (cpumode==1 && sira==-1) setTimeout(function() {cputime(); },500);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function virtualmove(x,y,fx,fy) {

	for (var i = 0; i<=9; i++) {
		future[i] = [];
		for (var j = 0; j<=9; j++) {
			future[i][j] = board[i][j];
		}
	}
	future[fy][fx] = future[y][x];
	future[y][x] = 'b';

	return future;
	
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function exposed(theboard, to, x, y ) {

	if (!x && !y) {
		for (var i = 1; i<=8; i++) {
			for (var j = 1; j<=8; j++) {
				if (theboard[i][j]==(to+'s')) {
					//console.log("king found at x="+j+" y="+i);
					x = j;
					y = i;
				}
			}
		}
	}

	var x = parseInt(x);
	var y = parseInt(y);

	for (var i = 1; i<=8; i++) {
		for (var j = 1; j<=8; j++) {
			if (theboard[i][j][0]==(to=='w'?'d':'w')) {

				// piyon
				if (theboard[i][j]=='dp' && i==y-1 && (j==x+1 || j ==x-1)) return true;
				if (theboard[i][j]=='wp' && i==y+1 && (j==x+1 || j ==x-1)) return true;

				// kaleler

				var tempx = j;
				var tempy = i;
				if(theboard[i][j][1]=='k' || theboard[i][j][1]=='v') {
					while (theboard[tempy][tempx]!='u') {
						tempy++;
						if (tempy==y && tempx==x) return true;
						if (theboard[tempy][tempx]!='b') break;
					}
					tempy = i;
					while (theboard[tempy][tempx]!='u') {
						tempy--;
						if (tempy==y && tempx==x) return true;
						if (theboard[tempy][tempx]!='b') break;
					}
					tempy = i;
					while (theboard[tempy][tempx]!='u') {
						tempx++;
						if (tempy==y && tempx==x) return true;
						if (theboard[tempy][tempx]!='b') break;
					}
					tempx = j;
					while (theboard[tempy][tempx]!='u') {
						tempx--;
						if (tempy==y && tempx==x) return true;
						if (theboard[tempy][tempx]!='b') break;
					}
				}	
				// fıller

				var tempx = j;
				var tempy = i;
				if(theboard[i][j][1]=='f' || theboard[i][j][1]=='v') {
					while (theboard[tempy][tempx]!='u') {
						tempy++;
						tempx++;
						if (tempy==y && tempx==x) return true;
						if (theboard[tempy][tempx]!='b') break;
					}
					tempy = i;
					tempx = j;
					while (theboard[tempy][tempx]!='u') {
						tempy--;
						tempx--;
						if (tempy==y && tempx==x) return true;
						if (theboard[tempy][tempx]!='b') break;
					}
					tempy = i;
					tempx = j;
					while (theboard[tempy][tempx]!='u') {
						tempx++;
						tempy--;
						if (tempy==y && tempx==x) return true;
						if (theboard[tempy][tempx]!='b') break;
					}
					tempy = i;
					tempx = j;
					while (theboard[tempy][tempx]!='u') {
						tempx--;
						tempy++;
						if (tempy==y && tempx==x) return true;
						if (theboard[tempy][tempx]!='b') break;
					}
					tempy = i;
					tempx = j;
				}

				//atlar
				if(theboard[i][j][1]=='a') {
					if (x===j+2 && y===i+1) return true;
					if (x===j+2 && y===i-1) return true;
					if (x==j+1 && y==i+2) return true;
					if (x==j+1 && y==i-2) return true;
					if (x==j-1 && y==i+2) return true;
					if (x==j-1 && y==i-2) return true;
					if (x==j-2 && y==i+1) return true;
					if (x==j-2 && y==i-1) return true;
					}

				//sah
				if(theboard[i][j][1]=='s') {
					if (x===j+1 && y===i+1) return true;
					if (x===j+1 && y===i) return true;
					if (x==j+1 && y==i-1) return true;
					if (x==j && y==i+1) return true;
					if (x==j && y==i-1) return true;
					if (x==j-1 && y==i+1) return true;
					if (x==j-1 && y==i) return true;
					if (x==j-1 && y==i-1) return true;
					}	
			}
		}
	}

	return false;
}












//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function isvalid(x,y,fx,fy) {

	x = parseInt(x);
	y = parseInt(y);
	var valids = [];

	// dark piyon
	if (board[y][x]=='dp') {
		if(y==2 && board[4][x]=="b" && board[y+1][x]=="b") valids[valids.length] = [4,x];
		if (board[y+1][x]=="b") valids[valids.length] = [y+1,x];
		if (board[y+1][x+1][0]=="w") valids[valids.length] = [y+1,x+1];
		if (board[y+1][x-1][0]=="w") valids[valids.length] = [y+1,x-1];
		// en passant
		if (y==5 && past[7][x+1]=="wp" && past[5][x+1]=="b" && board[7][x+1]=="b" && board[5][x+1]=="wp") valids[valids.length] = [y+1,x+1];
		if (y==5 && past[7][x-1]=="wp" && past[5][x-1]=="b" && board[7][x-1]=="b" && board[5][x-1]=="wp") valids[valids.length] = [y+1,x-1];
	}

	// white piyon
	if (board[y][x]=='wp') {
		if(y==7 && board[5][x]=="b" && board[y-1][x]=="b") valids[valids.length] = [5,x];
		if (board[y-1][x]=="b") valids[valids.length] = [y-1,x];
		if (board[y-1][x+1][0]=="d") valids[valids.length] = [y-1,x+1];
		if (board[y-1][x-1][0]=="d") valids[valids.length] = [y-1,x-1];
		// en passant
		if (y==4 && past[2][x+1]=="dp" && past[4][x+1]=="b" && board[2][x+1]=="b" && board[4][x+1]=="dp") valids[valids.length] = [y-1,x+1];
		if (y==4 && past[2][x-1]=="dp" && past[4][x-1]=="b" && board[2][x-1]=="b" && board[4][x-1]=="dp") valids[valids.length] = [y-1,x-1];
	}

	// kaleler

	var tempx = x;
	var tempy = y;
	if(board[y][x][1]=='k' || board[y][x][1]=='v') {
		while (board[tempy][tempx]!='u') {
			tempy++;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}

		}
		tempy = y;
		while (board[tempy][tempx]!='u') {
			tempy--;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}
		}
		tempy = y;
		while (board[tempy][tempx]!='u') {
			tempx++;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}

		}
		tempx = x;
		while (board[tempy][tempx]!='u') {
			tempx--;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}

		}
		tempx = x;
	}

	// atlar

	if(board[y][x][1]=='a') {
	try {if (board[y+1][x+2][0]=='b' || board[y+1][x+2][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+1,x+2];  } catch(e) {}
	try {if (board[y+1][x-2][0]=='b' || board[y+1][x-2][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+1,x-2];  } catch(e) {}
	try {if (board[y+2][x+1][0]=='b' || board[y+2][x+1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+2,x+1];  } catch(e) {}
	try {if (board[y+2][x-1][0]=='b' || board[y+2][x-1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+2,x-1];  } catch(e) {}
	try {if (board[y-1][x+2][0]=='b' || board[y-1][x+2][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-1,x+2];  } catch(e) {}
	try {if (board[y-1][x-2][0]=='b' || board[y-1][x-2][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-1,x-2];  } catch(e) {}
	try {if (board[y-2][x+1][0]=='b' || board[y-2][x+1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-2,x+1];  } catch(e) {}
	try {if (board[y-2][x-1][0]=='b' || board[y-2][x-1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-2,x-1];  } catch(e) {}
	}

	// filler

	tempx = x;
	tempy = y;
	if(board[y][x][1]=='f' || board[y][x][1]=='v') {
		while (board[tempy][tempx]!='u') {
			tempy++;
			tempx++;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}

		}
		tempy = y;
		tempx = x;
		while (board[tempy][tempx]!='u') {
			tempy--;
			tempx--;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}
		}
		tempy = y;
		tempx = x;
		while (board[tempy][tempx]!='u') {
			tempx++;
			tempy--;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}

		}
		tempx = x;
		tempy = y;
		while (board[tempy][tempx]!='u') {
			tempx--;
			tempy++;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}

		}
		tempx = x;
		tempy = y;
	}

	// sah

	if(board[y][x][1]=='s') {
		if (board[y+1][x+1][0]=='b' || board[y+1][x+1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+1,x+1];
		if (board[y+1][x][0]=='b' || board[y+1][x][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+1,x];
		if (board[y+1][x-1][0]=='b' || board[y+1][x-1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+1,x-1];
		if (board[y][x+1][0]=='b' || board[y][x+1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y,x+1];
		if (board[y][x-1][0]=='b' || board[y][x-1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y,x-1];
		if (board[y-1][x+1][0]=='b' || board[y-1][x+1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-1,x+1];
		if (board[y-1][x][0]=='b' || board[y-1][x][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-1,x];
		if (board[y-1][x-1][0]=='b' || board[y-1][x-1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-1,x-1];
		if (whiterrock && y==8 && x==5 && board[8][6]=='b' && board[8][7]=='b' && board[y][x][0]=='w' && !exposed(board,'w',5,8) && !exposed(board,'w',6,8)) valids[valids.length] = [8,7];
		if (whitelrock && y==8 && x==5 && board[8][2]=='b' && board[8][3]=='b' && board[8][4]=='b' && board[y][x][0]=='w' && !exposed(board,'w',5,8) && !exposed(board,'w',4,8) ) valids[valids.length] = [8,3];
		if (blackrrock && y==1 && x==5 && board[1][6]=='b' && board[1][7]=='b' && board[y][x][0]=='d' && !exposed(board,'d',5,1) && !exposed(board,'d',6,1)) valids[valids.length] = [1,7];
		if (blacklrock && y==1 && x==5 && board[1][2]=='b' && board[1][3]=='b' && board[1][4]=='b' && board[y][x][0]=='d' && !exposed(board,'d',5,1) && !exposed(board,'d',4,1)) valids[valids.length] = [1,3];
	}

	if(!fx || !fy) return valids;

	for (var i = 0; i<valids.length; i++) {
		if (fx==valids[i][1] && fy==valids[i][0]) return true;
	}

	return false;

}

//////////////////////// DEBUGGING ZONE //////////////////////////////////////////////////////////////////////////////////
/*
function debug1() {
	
	if (document.getElementById("getexposed").value.length != 1) return;
	var selected = document.getElementById("getexposed").value;

	for (var i = 1; i<=8; i++) {
		for (var j = 1; j<=8; j++) {
			if ( exposed(board, selected , i, j)) {
				document.getElementById("p"+j+"p"+i).style["background-color"] = "#a0f";
			}
		}
	}

	
}








function debug2() {
	if (document.getElementById("getvalid").value.length != 4) return;
	var selected = document.getElementById("getvalid").value;
	document.getElementById(selected).style["background-color"] = "#50a";
	document.getElementById("getvalid").value = "";

	var x = parseInt(selected[3]);
	var y = parseInt(selected[1]);
	var valids = [];

	// dark piyon
	if (board[y][x]=='dp') {
		if(y==2 && board[4][x]=="b" && board[y+1][x]=="b") valids[valids.length] = [4,x];
		if (board[y+1][x]=="b") valids[valids.length] = [y+1,x];
		if (board[y+1][x+1][0]=="w") valids[valids.length] = [y+1,x+1];
		if (board[y+1][x-1][0]=="w") valids[valids.length] = [y+1,x-1];
		// en passant
		if (y==5 && past[7][x+1]=="wp" && past[5][x+1]=="b" && board[7][x+1]=="b" && board[5][x+1]=="wp") valids[valids.length] = [y+1,x+1];
		if (y==5 && past[7][x-1]=="wp" && past[5][x-1]=="b" && board[7][x-1]=="b" && board[5][x-1]=="wp") valids[valids.length] = [y+1,x-1];
	}

	// white piyon
	if (board[y][x]=='wp') {
		if(y==7 && board[5][x]=="b" && board[y-1][x]=="b") valids[valids.length] = [5,x];
		if (board[y-1][x]=="b") valids[valids.length] = [y-1,x];
		if (board[y-1][x+1][0]=="d") valids[valids.length] = [y-1,x+1];
		if (board[y-1][x-1][0]=="d") valids[valids.length] = [y-1,x-1];
		// en passant
		if (y==4 && past[2][x+1]=="dp" && past[4][x+1]=="b" && board[2][x+1]=="b" && board[4][x+1]=="dp") valids[valids.length] = [y-1,x+1];
		if (y==4 && past[2][x-1]=="dp" && past[4][x-1]=="b" && board[2][x-1]=="b" && board[4][x-1]=="dp") valids[valids.length] = [y-1,x-1];
	}

	// kaleler

	var tempx = x;
	var tempy = y;
	if(board[y][x][1]=='k' || board[y][x][1]=='v') {
		while (board[tempy][tempx]!='u') {
			tempy++;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}

		}
		tempy = y;
		while (board[tempy][tempx]!='u') {
			tempy--;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}
		}
		tempy = y;
		while (board[tempy][tempx]!='u') {
			tempx++;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}

		}
		tempx = x;
		while (board[tempy][tempx]!='u') {
			tempx--;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}

		}
		tempx = x;
	}

	// atlar

	if(board[y][x][1]=='a') {
	try {if (board[y+1][x+2][0]=='b' || board[y+1][x+2][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+1,x+2];  } catch(e) {}
	try {if (board[y+1][x-2][0]=='b' || board[y+1][x-2][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+1,x-2];  } catch(e) {}
	try {if (board[y+2][x+1][0]=='b' || board[y+2][x+1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+2,x+1];  } catch(e) {}
	try {if (board[y+2][x-1][0]=='b' || board[y+2][x-1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+2,x-1];  } catch(e) {}
	try {if (board[y-1][x+2][0]=='b' || board[y-1][x+2][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-1,x+2];  } catch(e) {}
	try {if (board[y-1][x-2][0]=='b' || board[y-1][x-2][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-1,x-2];  } catch(e) {}
	try {if (board[y-2][x+1][0]=='b' || board[y-2][x+1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-2,x+1];  } catch(e) {}
	try {if (board[y-2][x-1][0]=='b' || board[y-2][x-1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-2,x-1];  } catch(e) {}
	}

	// filler

	tempx = x;
	tempy = y;
	if(board[y][x][1]=='f' || board[y][x][1]=='v') {
		while (board[tempy][tempx]!='u') {
			tempy++;
			tempx++;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}

		}
		tempy = y;
		tempx = x;
		while (board[tempy][tempx]!='u') {
			tempy--;
			tempx--;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}
		}
		tempy = y;
		tempx = x;
		while (board[tempy][tempx]!='u') {
			tempx++;
			tempy--;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}

		}
		tempx = x;
		tempy = y;
		while (board[tempy][tempx]!='u') {
			tempx--;
			tempy++;
			if(board[tempy][tempx]=='b') valids[valids.length] = [tempy, tempx];
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'d':'w')) {valids[valids.length] = [tempy, tempx]; break;}
			if(board[tempy][tempx][0]==(board[y][x][0]=='w'?'w':'d')) {break;}

		}
		tempx = x;
		tempy = y;
	}

	// sah

	if(board[y][x][1]=='s') {
		if (board[y+1][x+1][0]=='b' || board[y+1][x+1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+1,x+1];
		if (board[y+1][x][0]=='b' || board[y+1][x][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+1,x];
		if (board[y+1][x-1][0]=='b' || board[y+1][x-1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y+1,x-1];
		if (board[y][x+1][0]=='b' || board[y][x+1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y,x+1];
		if (board[y][x-1][0]=='b' || board[y][x-1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y,x-1];
		if (board[y-1][x+1][0]=='b' || board[y-1][x+1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-1,x+1];
		if (board[y-1][x][0]=='b' || board[y-1][x][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-1,x];
		if (board[y-1][x-1][0]=='b' || board[y-1][x-1][0]==(board[y][x][0]=='w'?'d':'w')) valids[valids.length] = [y-1,x-1];
		if (whiterrock && y==8 && x==5 && board[8][6]=='b' && board[8][7]=='b' && board[y][x][0]=='w') valids[valids.length] = [8,7];
		if (whitelrock && y==8 && x==5 && board[8][2]=='b' && board[8][3]=='b' && board[8][4]=='b' && board[y][x][0]=='w') valids[valids.length] = [8,3];
		if (blackrrock && y==1 && x==5 && board[1][6]=='b' && board[1][7]=='b' && board[y][x][0]=='d') valids[valids.length] = [1,7];
		if (blacklrock && y==1 && x==5 && board[1][2]=='b' && board[1][3]=='b' && board[1][4]=='b' && board[y][x][0]=='d') valids[valids.length] = [1,3];
	}







	// coloring the valids

	for (var i = 0; i<valids.length; i++) {
		document.getElementById("p"+valids[i][0]+"p"+valids[i][1]).style["background-color"] = "#a0f";
	}

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function debug3() {
	for (var i = 1; i<=8; i++) {
		for (var j = 1; j<=8; j++) {
			document.getElementById("p"+i+"p"+j).style["background-color"] = ((i%2)+(j%2)==1 ? '#750' : '#ee9');
		}
	}
}


*/












//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function siradegistir() {
	if (sira==1) {
		document.getElementById("whitenamee").style.fontWeight = "normal";
		document.getElementById("blacknamee").style.fontWeight = "bold";
	}
	else {
		document.getElementById("whitenamee").style.fontWeight = "bold";
		document.getElementById("blacknamee").style.fontWeight = "normal";
	}
	sira *= -1;
}






/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById("endgame").onclick = function () {
	
	// makes board empty
	for (var i = 1; i<=8; i++) {
		board[i] = [];
		for (var j=1; j<=8; j++) {
			board[i][j] = 'b';
		}
	}	

	// touch settings
	try {document.getElementById("p"+touchcoords[1]+"p"+touchcoords[0]).style["background-color"] = ((touchcoords[1]%2)+(touchcoords[0]%2)==1 ? '#750' : '#ee9'); } catch(e) {}
	touchcoords[0]=0;
	touchcoords[1]=0;

	draw();

	// name names become text fields
	document.getElementById("whitename").style.display = "inline";
	document.getElementById("blackname").style.display = "inline";
	document.getElementById("cpumode").style.display = "inline";
	document.getElementById("whitenamee").innerHTML = "";
	document.getElementById("blacknamee").innerHTML = "";
	document.getElementById("whitename").value = "";
	document.getElementById("blackname").value = "";
	document.getElementById("whitenamee").style.fontWeight = "normal";
	document.getElementById("blacknamee").style.fontWeight = "normal";
	if (cpumode==1) cpumodechange();


	// switch buttons
	document.getElementById("startgame").disabled = false;
	document.getElementById("startgame").style.color = "#e00";
	document.getElementById("endgame").disabled = true;
	document.getElementById("endgame").style.color = "";

	sira = 1;
	gameOver = true;

}





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function error(msg) {
	
	sounds_error.play();
	document.getElementById("startgame").style.display = "none";
	document.getElementById("endgame").style.display = "none";
	/*
	document.getElementById("getexposed").style.display = "none";
	document.getElementById("getvalid").style.display = "none";
	document.getElementById("getnormal").style.display = "none";
	*/
	document.getElementById("errormessage").innerHTML = '<strong>!!! '+msg+' !!!</strong>';
	document.getElementById("settings").style["background-color"] = "#faa";
	setTimeout(function(){
	document.getElementById("startgame").style.display = "inline";
	document.getElementById("endgame").style.display = "inline";
	/*
	document.getElementById("getexposed").style.display = "inline";
	document.getElementById("getvalid").style.display = "inline";
	document.getElementById("getnormal").style.display = "inline";
	*/
	document.getElementById("errormessage").innerHTML = '';
	document.getElementById("settings").style["background-color"] = "#ddd"; },3000);

}





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function drawstuff () {
	var children = "";

	for (var i = 1; i<=8; i++) {
		children += "<tr>\n";
		for (var j = 1; j<=8; j++) {
			children += '<td id="p'+i+'p'+j+'" ondragover="allowDrop(event)" ondrop="drop(event)" onclick="clicked(event)" style="width: 50px; height: 50px;  border: 1px solid black; background-color: #'+ ((i%2)+(j%2)==1 ? '750' : 'ee9') + '"></td>\n'; // 1c6 4f9 // 750 ee9
		}
		children += "</tr>\n";
	}

	document.getElementById("board").innerHTML = children;

	
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function clicked(event) {

	if (cpumode==1 && sira==-1) { error(text[lang][15]); return;}

	if (touchcoords[0]==0 ) {
		try {if (board[event.target.id[1]][event.target.id[3]]=='b') return; } catch(e) {return;}

	touchcoords[1] = event.target.id[1];
	touchcoords[0] = event.target.id[3];
	document.getElementById("p"+touchcoords[1]+"p"+touchcoords[0]).style["background-color"] = "#0f0";
	return;
	}
	
	moveAttempt(touchcoords[0],touchcoords[1],event.target.id[3],event.target.id[1]);
	document.getElementById("p"+touchcoords[1]+"p"+touchcoords[0]).style["background-color"] = ((touchcoords[1]%2)+(touchcoords[0]%2)==1 ? '#750' : '#ee9');
	touchcoords[0]=0;
	touchcoords[1]=0;

	draw();
	

	// eger onceden tas secilmemisse ve dokunulan yer bos ise bitir
	// eger onceden tas secilmisse oyna
	// eger onceden tas secilmemisse kirmizi yap
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function cpumodechange() {
	if (cpumode==-1) {
		document.getElementById("cpumode").style.fontWeight = "bold";
		document.getElementById("cpumode").style.color = "#f00";
		document.getElementById("blackname").disabled = true;
	}
	else {
		document.getElementById("cpumode").style.fontWeight = "normal";
		document.getElementById("cpumode").style.color = "inherit";
		document.getElementById("blackname").disabled = false;
	}
	cpumode*= -1;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function cputime() {

	
	var validareas = [];
	var moveableareas = [];
		for ( var i = 1; i<=8; i++) {
			for (var j = 1; j<=8; j++) {
				if (board[j][i][0]=='d') {

					// not: [targety, targetx, sourcey, sourcex]

					for (var k = 0; k<isvalid(i,j).length; k++) {
						validareas[validareas.length] = isvalid(i,j)[k];
						validareas[validareas.length-1][2] = j;
						validareas[validareas.length-1][3] = i;

						//console.log("valid area: source:"+board[j][i]+" x:"+isvalid(i,j)[l][1]+" y:"+isvalid(i,j)[l][0]);
					}

					for ( k = 0; k<validareas.length; k++) {
						if (!exposed(virtualmove(validareas[k][3],validareas[k][2],validareas[k][1],validareas[k][0]),'d')) {
							moveableareas[moveableareas.length] = validareas[k];
							//console.log("moveable: "+moveableareas.join(" "));

						}
					}

				}
			}
		}

		var edible = [];
		//0=bos 1=piyon 2=at 3=fil 4=kale 5=vezir
		var priority = function (piece) {
			switch (piece) {
				case 'b':
				return 0;
				case 'wp':
				return 1;
				case 'wa':
				return 2;
				case 'wf':
				return 3;
				case 'wk':
				return 4;
				case 'wv':
				return 5;
			}
		} 

		var maxpriority = 0;
		for (var k = 0; k<moveableareas.length; k++) {
			if (priority(board[moveableareas[k][0]][moveableareas[k][1]])>maxpriority) {
				maxpriority = priority(board[moveableareas[k][0]][moveableareas[k][1]]);
			}
		}

		if (maxpriority == 0) {
			for (i = 0; i<moveableareas.length; i++) {
				if (exposed(virtualmove(moveableareas[i][3],moveableareas[i][2],moveableareas[i][1],moveableareas[i][0]),'w') ) {
					edible[edible.length] = moveableareas[i];
				}
			}
		}
		
		if (edible.length==0) {
			for (i = 0; i<moveableareas.length; i++) {
				if (maxpriority == priority(board[moveableareas[i][0]][moveableareas[i][1]])) {
					edible[edible.length] = moveableareas[i];
				}
			}
		}

		var decision = Math.floor(Math.random()*edible.length);

		//console.log(edible[decision][2]+" "+edible[decision][3]+" "+edible[decision][0]+" "+edible[decision][1]);
		moveAttempt(edible[decision][3],edible[decision][2],edible[decision][1],edible[decision][0]);
	
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById("help").onclick = function () {
	alert("(version 3) " + text[lang][10]);
}





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function draw() {
	for (var i = 1; i<=8; i++) {
		for (var j = 1; j<=8; j++) {
			switch (board[i][j]) {
				case 'b':
				document.getElementById("p"+i+"p"+j).innerHTML = '';
				break;
				case 'dk':
				case 'da':
				case 'df':
				case 'dv':
				case 'ds':
				case 'dp':
				case 'wk':
				case 'wa':
				case 'wf':
				case 'wv':
				case 'ws':
				case 'wp':
				document.getElementById("p"+i+"p"+j).innerHTML = '<img id="i'+i+'i'+j+'"  ondragstart="dragStart(event)" style="cursor: pointer" width="50" height="46" src="pictures/'+board[i][j]+'.png">';
				break;
				case 'r':
				document.getElementById("p"+i+"p"+j).innerHTML = "RIP";
				document.getElementById("p"+i+"p"+j).style.color = "#f00";
				break;
			}
		}
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function dragStart(event) {
    event.dataTransfer.setData("Data", event.target.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    if (cpumode==1 && sira==-1) { error(text[lang][15]); return;}
    var data = event.dataTransfer.getData("Data");
    moveAttempt(data[3],data[1], event.target.id[3], event.target.id[1]);
    try {document.getElementById("p"+touchcoords[1]+"p"+touchcoords[0]).style["background-color"] = ((touchcoords[1]%2)+(touchcoords[0]%2)==1 ? '#750' : '#ee9'); } catch(e) {}
	touchcoords[0]=0;
	touchcoords[1]=0;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function changelang(no) {
	lang = no;

	// Language dependent stuff
	document.getElementById("blackname").placeholder = "("+text[lang][1]+") "+text[lang][3];
	document.getElementById("whitename").placeholder = "("+text[lang][2]+") "+text[lang][3];
	document.getElementById("startgame").value = text[lang][4];
	document.getElementById("endgame").value = text[lang][5];

	for (var i = 0; i<text.length; i++) {
		document.getElementById("lang"+i).style.color = "#00f";
	}
		document.getElementById("lang"+lang).style.color = "#000";

}

/*****************************************************************************************************************************
*****************************************************************************************************************************
*****************************************************************************************************************************/

window.onload = function () {
	drawstuff();
	sounds_no = new Audio("sounds/no.mp3");
	sounds_promotion = new Audio("sounds/promotion.wav");
	sounds_kill = new Audio("sounds/kill.wav");
	sounds_go = new Audio("sounds/go.wav");
	sounds_error = new Audio("sounds/error.wav");
	sounds_draw = new Audio("sounds/draw.wav");

	
	for (var i = 0; i<text.length; i++) {
	document.getElementById("langs").innerHTML += '<span id="lang'+i+'" onclick="changelang('+i+')" style="color:#00f">'+text[i][0]+' ';
	}
	document.getElementById("lang1").style.color = "#000";
	document.getElementById("langs").innerHTML += '&nbsp;&nbsp;&nbsp;';
}

window.onerror = function(messageOrEvent, source, lineno, colno, error) { 
	//alert("Error: "+ messageOrEvent + "(kaynak "+lineno+")");
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var text = [];
text[0] = [];
text[1] = [];
text[2] = [];


text[0][0] = "TR";
text[0][1] = "Siyahlar";
text[0][2] = "Beyazlar";
text[0][3] = "Adınızı yazınız:";
text[0][4] = "Oyunu Başlat";
text[0][5] = "Oyunu Bitir";
text[0][6] = "İsimler nerde";
text[0][7] = "Şah saldırı altında";
text[0][8] = "Oraya gitmek şahını kurtarmayacak";
text[0][9] = "Sıra sende değil";
text[0][10] = "Bu oyun Deniz Başgören tarafından yapıldı.\n\n Ters giden birşey olursa bana buradan ulaşın: fb.com/deniz.basgoren.50";
text[0][11] = "Kendi orduna saldıramazsın";
text[0][12] = "Şahını koru";
text[0][13] = "Böyle yapamazsın";
text[0][14] = "Oyun berabere";
text[0][15] = "Bilgisayara ne yapacağını söyleme";
text[1][0] = "EN";
text[1][1] = "Black";
text[1][2] = "White";
text[1][3] = "Write your name:";
text[1][4] = "Start Game";
text[1][5] = "End Game";
text[1][6] = "Where are your names";
text[1][7] = "The king is under attack";
text[1][8] = "That won't save you dear";
text[1][9] = "It's not your turn";
text[1][10] = "This game is made by Deniz Bashgoren.\n\nIf something goes wrong, contact me at fb.com/deniz.basgoren.50";
text[1][11] = "You can't attack your own army";
text[1][12] = "Protect your king";
text[1][13] = "You can't do that";
text[1][14] = "Game is drawn";
text[1][15] = "Don't tell the computer what to do";
text[2][0] = "RU";
text[2][1] = "Черные";
text[2][2] = "Белые";
text[2][3] = "Напишите вашее имя:";
text[2][4] = "Начать Игру";
text[2][5] = "Закончить Игру";
text[2][6] = "А где имина-то";
text[2][7] = "Король под угрозой";
text[2][8] = "Это не спасет твоего короля";
text[2][9] = "Не твоя очередь";
text[2][10] = "Эта игра была создана Денизом Башгореном.\n\nЕсли что-то пойдет ни так, свяжитесь со мной через fb.com/deniz.basgoren.50";
text[2][11] = "Нельзя аттаковать свою армию";
text[2][12] = "Береги короля";
text[2][13] = "Так нельзя";
text[2][14] = "Игра ничья";
text[2][15] = "Не говори компьютеру что делать";