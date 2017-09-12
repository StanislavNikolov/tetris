let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
resize();

window.addEventListener('resize', resize);

let fields = [], blocks, log = "", shadowY = -1, myid = -1;

let colors = ["black", "blue", "green", "red", "brown", "lime", "yellow", "pink", "grey"];

class Field {
	constructor(x, y) {
		this.lenX = x;
		this.lenY = y;
		this.field = [];
		this.currBlock = -1;
		this.blockX = -1;
		this.blockY = -1;
		this.nextBlock = 0;
		for(let i = 0;i < this.lenX;i ++) {
			this.field[i] = [];
			for(let j = 0;j < this.lenY;j ++) {
				this.field[i][j] = 0;
			}
		}
	}
	draw(context, scale) {
		for(let i = 0;i < this.lenX;i ++) {
			for(let j = 0;j < this.lenY;j ++) {
				context.fillStyle = colors[this.field[i][j]];

				const ni = i - this.blockX;
				const nj = j - this.blockY;
				if(this.currBlock != -1
					&& ni >= 0 && ni < blocks[this.currBlock].length
					&& nj >= 0 && nj < blocks[this.currBlock][ni].length) {
					if(blocks[this.currBlock][ni][nj] != 0) {
						context.fillStyle = colors[blocks[this.currBlock][ni][nj]];
					}
				}

				context.fillRect(i * scale, j * scale, scale, scale);
			}
		}
	}
	drawShadow(context, scale) {
		if(shadowY == -1 || this.currBlock == -1) return;

		const blx = blocks[this.currBlock].length;
		const bly = blocks[this.currBlock][0].length;
		for(let i = 0;i < blx;i ++) {
			for(let j = 0;j < bly;j ++) {
				if(blocks[this.currBlock][i][j] != 0) {
					const ni = (i + this.blockX);
					const nj = (j + shadowY);

					context.globalAlpha = 0.15;
					context.fillStyle = colors[blocks[this.currBlock][i][j]];
					context.fillRect(ni * scale, nj * scale, scale, scale);

					context.globalAlpha = 1;
					context.lineWidth = 3;
					context.strokeStyle = colors[blocks[this.currBlock][i][j]];
					context.strokeRect(ni * scale, nj * scale, scale, scale);
				}
			}
		}
	}
}

var socket = io();
socket.on('init', function (data) {
	console.log('room', data.s);

	for(let i = 0;i < data.n;i ++) fields[i] = new Field(data.x, data.y);
	blocks = data.b;
	myid = data.i;

	draw();
});

socket.on('b', function (data) {
	fields[data.u].blockX = data.x;
	fields[data.u].blockY = data.y;
	fields[data.u].currBlock = data.b;
	fields[data.u].nextBlock = data.n;
});

socket.on('f', function (data) {
	console.log(data);
	fields[data.u].field = data.f;
});

socket.on('e', function(data) {
	log += data ? 'You win!' : 'You lose!' ;
});

socket.on('s', function(data) {
	shadowY = data;
});

window.addEventListener('keydown', function(event) {
	if(event.key == 'a' || event.key == 'ArrowLeft') socket.emit('m', 0);
	if(event.key == 's' || event.key == 'ArrowDown') socket.emit('m', 1);
	if(event.key == 'd' || event.key == 'ArrowRight') socket.emit('m', 2);
	if(event.key == 'w' || event.key == 'ArrowUp') socket.emit('m', 3);
	if(event.key == ' ') socket.emit('m', 4);
});

function drawBlock(block, context, scale) {
	const blx = blocks[block].length;
	const bly = blocks[block][0].length;
	for(let i = 0;i < blx;i ++) {
		for(let j = 0;j < bly;j ++) {
			context.fillStyle = colors[blocks[block][i][j]];
			context.fillRect(i * scale, j * scale, scale, scale);
		}
	}
}

function draw() {
	let sumX = 0, maxY = 1;
	for(let i = 0;i < fields.length;i ++) {
		sumX += fields[i].lenX;
		maxY = Math.max(maxY, fields[i].lenY);
	}

	const hole = blocks[0].length; // TODO
	const sc1 = canvas.width / (sumX + hole);
	const sc2 = canvas.height / (maxY);
	const scale = Math.floor(Math.min(sc1, sc2));

	context.clearRect(0, 0, canvas.width, canvas.height);

	if(log) {
		context.font = "24px Monospace";
		context.fillStyle = "black";
		context.fillText(log, canvas.width / 2, canvas.height / 2);
	} else {
		context.save();
		for(let i in fields) {
			fields[i].draw(context, scale);
			if(myid == i) fields[i].drawShadow(context, scale);
			context.translate(scale * (fields[0].lenX + 1), 0);
		}
		context.restore();
		//context.translate(scale * (fields[0].lenX + hole), 0);
		//context.translate(-scale * (fields[0].lenX + hole), 0);

		//drawBlock(fields[myid].nextBlock, context, scale); // TODO
	}

	window.requestAnimationFrame(draw);
}
