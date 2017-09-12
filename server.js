let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);

server.listen(8080);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});
app.get('/client.js', function (req, res) {
	res.sendfile(__dirname + '/client.js');
});

let pool = [], gsid = 0;

let blocks = [];
let sendover = [0, 0, 0, 1, 3];

//////////////////  O
blocks.push([[0,0,0,0],
	         [0,1,1,0],
	         [0,1,1,0],
	         [0,0,0,0]]);

blocks.push([[0,0,0,0],
	         [0,1,1,0],
	         [0,1,1,0],
	         [0,0,0,0]]);

blocks.push([[0,0,0,0],
	         [0,1,1,0],
	         [0,1,1,0],
	         [0,0,0,0]]);

blocks.push([[0,0,0,0],
	         [0,1,1,0],
	         [0,1,1,0],
	         [0,0,0,0]]);


//////////////////  I
blocks.push([[0,2,0,0],
	         [0,2,0,0],
	         [0,2,0,0],
	         [0,2,0,0]]);

blocks.push([[0,0,0,0],
	         [0,0,0,0],
	         [2,2,2,2],
	         [0,0,0,0]]);

blocks.push([[0,2,0,0],
	         [0,2,0,0],
	         [0,2,0,0],
	         [0,2,0,0]]);

blocks.push([[0,0,0,0],
	         [0,0,0,0],
	         [2,2,2,2],
	         [0,0,0,0]]);





//////////////////  S
blocks.push([[0,0,0,0],
	         [0,0,3,0],
	         [0,3,3,0],
	         [0,3,0,0]]);

blocks.push([[0,0,0,0],
	         [0,0,0,0],
	         [3,3,0,0],
	         [0,3,3,0]]);

blocks.push([[0,0,0,0],
	         [0,0,3,0],
	         [0,3,3,0],
	         [0,3,0,0]]);

blocks.push([[0,0,0,0],
	         [0,0,0,0],
	         [3,3,0,0],
	         [0,3,3,0]]);



//////////////////  Z
blocks.push([[0,0,0,0],
	         [0,4,0,0],
	         [0,4,4,0],
	         [0,0,4,0]]);

blocks.push([[0,0,0,0],
	         [0,0,0,0],
	         [0,4,4,0],
	         [4,4,0,0]]);

blocks.push([[0,0,0,0],
	         [0,4,0,0],
	         [0,4,4,0],
	         [0,0,4,0]]);

blocks.push([[0,0,0,0],
	         [0,0,0,0],
	         [0,4,4,0],
	         [4,4,0,0]]);




//////////////////  L
blocks.push([[0,0,0,0],
	         [0,5,5,0],
	         [0,5,0,0],
	         [0,5,0,0]]);

blocks.push([[0,0,0,0],
	         [0,0,0,0],
	         [5,5,5,0],
	         [0,0,5,0]]);

blocks.push([[0,0,0,0],
	         [0,5,0,0],
	         [0,5,0,0],
	         [5,5,0,0]]);

blocks.push([[0,0,0,0],
	         [5,0,0,0],
	         [5,5,5,0],
	         [0,0,0,0]]);



//////////////////  J
blocks.push([[0,0,0,0],
	         [0,6,0,0],
	         [0,6,0,0],
	         [0,6,6,0]]);

blocks.push([[0,0,0,0],
	         [0,0,0,0],
	         [6,6,6,0],
	         [6,0,0,0]]);

blocks.push([[0,0,0,0],
	         [6,6,0,0],
	         [0,6,0,0],
	         [0,6,0,0]]);

blocks.push([[0,0,0,0],
	         [0,0,6,0],
	         [6,6,6,0],
	         [0,0,0,0]]);





//////////////////  T
blocks.push([[0,0,0,0],
	         [0,7,0,0],
	         [0,7,7,0],
	         [0,7,0,0]]);

blocks.push([[0,0,0,0],
	         [0,0,0,0],
	         [7,7,7,0],
	         [0,7,0,0]]);

blocks.push([[0,0,0,0],
	         [0,7,0,0],
	         [7,7,0,0],
	         [0,7,0,0]]);

blocks.push([[0,0,0,0],
	         [0,7,0,0],
	         [7,7,7,0],
	         [0,0,0,0]]);


class Field {
	constructor(x, y) {
		this.lenX = x;
		this.lenY = y;
		this.field = [];
		this.currBlock = 0;
		this.blockX = 0;
		this.blockY = 0;
		this.blockIdx = 0;
		for(let i = 0;i < this.lenX;i ++) {
			this.field[i] = [];
			for(let j = 0;j < this.lenY;j ++) {
				this.field[i][j] = 0;
			}
		}
	}
	lineCheck() {
		let lines = [];
		for(let y = 0;y < this.lenY;y ++) {
			let empty = false;
			for(let x = 0;x < this.lenX;x ++) {
				if(this.field[x][y] == 0) {
					empty = true;
					break;
				}
			}
			if(!empty) {
				lines.push(y);
			}
		}
		return lines;
	}
	kill(lines) {
		for(let i = 0;i < lines.length;i ++) {
			const y = lines[i];
			for(let j = y-1;j >= 0;j --) {
				for(let i = 0;i < this.lenX;i ++) {
					this.field[i][j+1] = this.field[i][j];
				}
			}
		}
	}
	push(cnt) {
		for(let j = 0;j < cnt;j ++) {
			for(let i = 0;i < this.lenX;i ++) {
				if(this.field[i][j] != 0) return false;
			}
		}
		for(let j = 0;j < this.lenY - cnt;j ++) {
			for(let i = 0;i < this.lenX;i ++) {
				this.field[i][j] = this.field[i][j+cnt];
			}
		}
		for(let j = this.lenY - cnt;j < this.lenY;j ++) {
			for(let i = 0;i < this.lenX;i ++) {
				this.field[i][j] = blocks.length / 4 + 1;
			}
			this.field[Math.floor(Math.random() * this.lenX)][j] = 0;
		}
		this.blockY -= cnt;
		if(this.blockY < 0) this.blockY = 0;

		return true;
	}
	freezeCheck() {
		const blx = blocks[this.currBlock].length;
		const bly = blocks[this.currBlock][0].length;
		for(let i = 0;i < blx;i ++) {
			for(let j = 0;j < bly;j ++) {
				if(blocks[this.currBlock][i][j] != 0) {
					const ni = i + this.blockX;
					const nj = j + this.blockY;
					if(nj >= this.lenY || this.field[ni][nj] != 0) {
						return true;
					}
				}
			}
		}
		return false;
	}
	boundsCheck() {
		const blx = blocks[this.currBlock].length;
		const bly = blocks[this.currBlock][0].length;
		for(let i = 0;i < blx;i ++) {
			for(let j = 0;j < bly;j ++) {
				if(blocks[this.currBlock][i][j] != 0) {
					const ni = i + this.blockX;
					const nj = j + this.blockY;
					if(ni < 0 || nj < 0 || ni >= this.lenX || nj >= this.lenY) {
						return true;
					}
				}
			}
		}
		return false;
	}
	freeze() {
		const blx = blocks[this.currBlock].length;
		const bly = blocks[this.currBlock][0].length;
		for(let i = 0;i < blx;i ++) {
			for(let j = 0;j < bly;j ++) {
				const ni = i + this.blockX;
				const nj = j + this.blockY;
				if(blocks[this.currBlock][i][j] != 0) {
					this.field[ni][nj] = blocks[this.currBlock][i][j];
				}
			}
		}
	}
}

class Player {
	constructor(socket, x, y) {
		this.socket = socket;
		this.field = new Field(x, y);
	}
}

io.on('connection', function (socket) {
	console.log('new connection');
	pool.push(new Player(socket, 10, 24));
	if(pool.length % 3 == 0) {
		startMatch(gsid++, [pool[pool.length-1], pool[pool.length-2], pool[pool.length-3]]);
		pool.pop();
		pool.pop();
		pool.pop();
	}

});

function newBlock(player, next) {
	player.field.currBlock = next[++ player.field.blockIdx];
	player.field.blockX = player.field.lenX / 2;
	player.field.blockY = 0;
}

function genNext(cnt) {
	let arr = [];
	for(let i = 0;i < cnt;i ++) {
		arr.push(Math.floor(Math.random() * (blocks.length / 4)) * 4);
	}
	return arr;
}

function sendShadow(player) {
	const cp = player.field.blockY;
	while(!player.field.freezeCheck()) {
		player.field.blockY ++;
	}
	player.field.blockY --;
	player.socket.emit('s', player.field.blockY);
	player.field.blockY = cp;
}

function emitBlockInfo(players, idx, next) {
	const o = players[idx];
	for(let i = 0;i < players.length;i ++) {
		const p = players[i];
		p.socket.emit('b', {x:o.field.blockX, y:o.field.blockY, b:o.field.currBlock,
			n:next[o.field.blockIdx+1], u: idx});
	}
}

function freeze(players, idx) {
	const first = players[idx];
	if(first.field.freezeCheck()) {
		first.field.blockY --;
		first.field.freeze();
		const lines = first.field.lineCheck();
		if(lines.length > 0) {
			first.field.kill(lines);
			sendShadow(first);
			for(let i = 0;i < players.length;i ++) {
				if(i == idx) continue;
				const p = players[i];
				let succ = p.field.push(sendover[lines.length]);
				if(!succ) {
					die(players, i);
				} else {
					sendShadow(p);
					emitFieldInfo(players, i);
				}
			}
		}
		return true;
	}
	return false;
}

function die(players, loserIdx) {
	players[loserIdx].socket.emit('e', 0);
	players[loserIdx].socket.disconnect();
	//players.splice(loserIdx, 1);
}

function emitFieldInfo(players, idx) {
	for(let i = 0;i < players.length;i ++) {
		players[i].socket.emit('f', {f: players[idx].field.field, u: idx});
	}
}

function startMatch(sid, players) {
	console.log('New match', sid);

	let next = genNext(10000);

	for(let i = 0;i < players.length;i ++) {
		const p = players[i];
		newBlock(p, next);
		p.socket.emit('init', {n:players.length, x:p.field.lenX, y:p.field.lenY, b:blocks, s:sid, i:i});
		sendShadow(p);
		emitBlockInfo(players, i, next);
		p.socket.on('m', function(data) {
			onData(players, i, data);
		});
	}

	function onData(players, idx, data) {
		const player = players[idx];
		if(data == 0) {
			player.field.blockX --;
			if(player.field.boundsCheck() || player.field.freezeCheck()) {
				player.field.blockX ++;
			}
		}
		if(data == 2) {
			player.field.blockX ++;
			if(player.field.boundsCheck() || player.field.freezeCheck()) {
				player.field.blockX --;
			}
		}
		if(data == 1) {
			player.field.blockY ++;
		}
		if(data == 3)  {
			player.field.currBlock ++;
			if(player.field.currBlock % 4 == 0) player.field.currBlock -= 4;
			if(player.field.boundsCheck() || player.field.freezeCheck()) {
				if(player.field.currBlock % 4 == 0) {
					player.field.currBlock += 3;
				} else {
					player.field.currBlock --;
				}
			}
		}
		if(data == 4) {
			while(!player.field.freezeCheck()) {
				player.field.blockY ++;
			}
		}
		emitBlockInfo(players, idx, next);
		sendShadow(player);
		check();
	}

	function tick() {
		if(players.length == 0) { // EOG
			clearInterval(tickInterval);
			return;
		}

		for(let i = 0;i < players.length;i ++) {
			players[i].field.blockY ++;
			emitBlockInfo(players, i, next);
		}

		check();
	}

	function check() {
		for(let i = 0;i < players.length;i ++) {
			if(freeze(players, i)) {
				newBlock(players[i], next);
				if(players[i].field.freezeCheck()) {
					die(players, i);
				} else {
					sendShadow(players[i]);
					emitFieldInfo(players, i);
					emitBlockInfo(players, i, next);
				}
			}
		}
	}

	let tickInterval = setInterval(tick, 600);
}
