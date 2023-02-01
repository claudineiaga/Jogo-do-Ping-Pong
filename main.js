//fazer mudanças
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     ||  
		function( callback ){
			return window.setTimeout(callback, 1000 / 60);
		};
})();

window.cancelRequestAnimFrame = ( function() {
	return  window.cancelAnimationFrame          ||
		window.webkitCancelRequestAnimationFrame    ||
		window.mozCancelRequestAnimationFrame       ||
		window.oCancelRequestAnimationFrame     ||
		window.msCancelRequestAnimationFrame        ||
		clearTimeout
} )();

var canvas = document.getElementById("canvas"),
		ctx = canvas.getContext("2d"),
		W = window.innerWidth,
		H = window.innerHeight,
		particles = [],
		ball = {},
		paddles = [2],
		mouse = {},
		points = 0,
		fps = 60,
		particlesCount = 20,
		flag = 0,
		particlePos = {}, 
		multipler = 1,
		startBtn = {},
		restartBtn = {},
		over = 0,
		init,
		paddleHit;
		level = 1;

    canvas.addEventListener("mousemove", trackPosition, true);
    canvas.addEventListener("mousedown", btnClick, true);

    // inicializa a colisão
    collision = document.getElementById("collide");

    // Tela Cheia
    canvas.width = W;
    canvas.height = H;

    // cor do fundo da tela
    function MainScreen_canvas() {
        ctx.fillStyle = "SeaGreen";
        ctx.fillRect(0, 0, W, H);
    }

    // Criando as raquetes
    function Paddle(pos) {
        this.h = 15;
        this.w = 150;
        
        // posição das raquetes
        this.x = W/2 - this.w/2;
        this.y = (pos == "top") ? 0 : H - this.h;
        
}

// coloca duas novas raquetes no vetor
paddles.push(new Paddle("bottom"));
paddles.push(new Paddle("top"));

// criação da bola
ball = {
	x: W/2,
	y: H/2+300, 
	r: 15,
	c: "white",
	vx: 4,
	vy: 8,
	
	// desenha bola na tela
	draw: function() {
		ctx.beginPath();
		ctx.fillStyle = this.c;
		ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
		ctx.fill();
	}
};

// Botão d eIniciar
startBtn = {
	w: 100,
	h: 50,
	x: W/2 - 50,
	y: H/2 - 25,
	
	draw: function() {
		ctx.strokeStyle = "white";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		ctx.font = "18px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStlye = "white";
		ctx.fillText("Jogar", W/2, H/2 );
	}
};

// Botão de Reiniciar
restartBtn = {
	w: 100,
	h: 50,
	x: W/2 - 50,
	y: H/2 - 50,
	
	draw: function() {
		ctx.strokeStyle = "white";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		
		ctx.font = "18px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStlye = "white";
		ctx.fillText("Reiniciar", W/2, H/2 - 25 );
		
	}
};

// cria as partículas quando a bola toca na raquete
function createParticles(x, y, m) {
	this.x = x || 0;
	this.y = y || 0;
	this.radius = 3;
	this.vx = -1.5 + Math.random()*3;
	this.vy = m * Math.random()*1.5;
}

// desenha tudo na tela
function draw() {
	MainScreen_canvas();
	for(var i = 0; i < paddles.length; i++) {
		p = paddles[i];
		
		ctx.fillStyle = "red";
		ctx.fillRect(p.x, p.y, p.w, p.h);
	}
	
	ball.draw();
	update();
}

// aumenta a velocidade a cada 8 pontos
function increaseSpd() {
	console.log(points);
	if(points % 8 == 0) {
		level++;
		window.alert('Você está no Nível ' +level);
		console.log("Nível: "+level);
		if(Math.abs(ball.vx) < 15) {
			ball.vx += (ball.vx < 0) ? -1 : 1;
			ball.vy += (ball.vy < 0) ? -2 : 2;
		}
	}
}

// Rastrear a posição do cursor do mouse
function trackPosition(e) {
	mouse.x = e.pageX;
	mouse.y = e.pageY;
}

// Função para atualizar posições, pontuação e tudo mais.
function update() {
	// atualizar potuação
	updateScore(); 
	// mover as raquetes e mouse
	if(mouse.x && mouse.y) {
		for(var i = 1; i < paddles.length; i++) {
			p = paddles[i];
			p.x = mouse.x - p.w/2;
		}		
	}
	// move a bola
	ball.x += ball.vx;
	ball.y += ball.vy;
	// colisão com as raquetes
	p1 = paddles[1];
	p2 = paddles[2];
	
	// Se a bola bater com as raquetes,
    // inverte o vetor de velocidade y da bola,
    // incrementa os pontos,
    // salva a posição da colisão para que as faíscas possam ser
    // emitido dessa posição, defina a variável do sinalizador,
    // e altere o multiplicador
	if(collides(ball, p1)) {
		collideAction(ball, p1);
	}
	
	else if(collides(ball, p2)) {
		collideAction(ball, p2);
	} 
	
	else {
		// Colidir com as paredes
		if(ball.y + ball.r > H) {
			ball.y = H - ball.r;
         	snd.play();
			gameOver();
		} 
		
		else if(ball.y < 0) {
			ball.y = ball.r;
			var snd = new Audio("sons/punch.wav");
         	snd.play();
			gameOver();
		}
		
		// Se a bola atingir as paredes verticais, inverta o
        // vetor de velocidade x da bola
		if(ball.x + ball.r > W) {
			ball.vx = -ball.vx;
			ball.x = W - ball.r;

			var snd = new Audio("sons/wall.mp3");
         	snd.play();
		}
		
		else if(ball.x -ball.r < 0) {
			ball.vx = -ball.vx;
			ball.x = ball.r;

			var snd = new Audio("sons/wall.mp3");
         	snd.play();
		}
	}
	
	// Se o sinalizador estiver definido, coloque as partículas
	if(flag == 1) { 
		for(var k = 0; k < particlesCount; k++) {
			particles.push(new createParticles(particlePos.x, particlePos.y, multiplier));
		}
	}	
	
	// cria as partículas
	OntouchSpark();
	flag = 0;
}

//Função para verificar a colisão entre a bola e uma das as pás
function collides(b, p) {
	if(b.x + ball.r >= p.x && b.x - ball.r <=p.x + p.w) {
		if(b.y >= (p.y - p.h) && p.y > 0){
			paddleHit = 1;
			return true;
		}
		
		else if(b.y <= p.h && p.y == 0) {
			paddleHit = 2;
			return true;
		}
		
		else return false;
	}
}

//Faça isso quando colidir == true
function collideAction(ball, p) {
	ball.vy = -ball.vy;
	
	if(paddleHit == 1) {
		ball.y = p.y - p.h;
		particlePos.y = ball.y + ball.r;
		multiplier = -1;

		var snd = new Audio("sons/ding.wav");
         	snd.play();	
	}
	
	else if(paddleHit == 2) {
		ball.y = p.h + ball.r;
		particlePos.y = ball.y - ball.r;
		multiplier = 1;	

		var snd = new Audio("sons/ding.wav");
         	snd.play();	
	}
	
	points++;
	increaseSpd();
	
	if(collision) {
		if(points > 0) 
			collision.pause();
		
		collision.currentTime = 0;
		collision.play();
	}
	
	particlePos.x = ball.x;
	flag = 1;
}

// emite partículas
function OntouchSpark() { 
	for(var j = 0; j < particles.length; j++) {
		par = particles[j];
		ctx.beginPath(); 
		ctx.fillStyle = "white";
		if (par.radius > 0) {
			ctx.arc(par.x, par.y, par.radius, 0, Math.PI*2, false);
		}
		ctx.fill();	 
		
		par.x += par.vx; 
		par.y += par.vy; 
		
		// Reduz o raio para que as partículas desapareçam após alguns segundos
		par.radius = Math.max(par.radius - 0.05, 0.0); 
		
	} 
}

// Função para atualização de pontuação
function updateScore() {
	ctx.fillStlye = "white";
	ctx.font = "20px Arial, sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Sua Potuação : " + points, 20, 20 );
	ctx.fillText("Seu Nível : " + level, 20, 40 );
}

// Função para executar quando o jogo terminar
function gameOver() {
	ctx.fillStlye = "white";
	ctx.font = "20px Arial, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	
	// parar a animação
	cancelRequestAnimFrame(init);
	//colocar no nível 1 primeiro
	level = 1;
	over = 1;
	
	// mostrar o botão de reiniciar
	restartBtn.draw();
}

// executa quando o jogo terminar
function animloop() {
	init = requestAnimFrame(animloop);
	draw();
}

// executada na inicialização
function startScreen() {
	draw();
	startBtn.draw();
	ctx.fillText("Vamos Jogar Ping Pong?",W/2, 115);
	ctx.fillText("", W/2+5,H/2+90);
}

// clicar no botão iniciar e reiniciar
function btnClick(e) {
	
	// Variáveis ​​para armazenar a posição do mouse
	var mx = e.pageX,
			my = e.pageY;
	if(mx >= startBtn.x && mx <= startBtn.x + startBtn.w) {
		animloop();
		startBtn = {};
	}	
	// Se o jogo terminar e o botão reiniciar for pressionado
	if(over == 1) {
		if(mx >= restartBtn.x && mx <= restartBtn.x + restartBtn.w) {
			ball.x = W/2;
			ball.y = H/2+300;
			points = 0;
			ball.vx = 4;
			ball.vy = 8;
			animloop();	
			over = 0;
		}
	}
}
// mostrar em tela cheia
startScreen();
