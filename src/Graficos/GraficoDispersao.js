/*
 * File Name: GraficoDispersao.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: WilliamJardim/Visualization © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/

/*
	Grafico de dispersão Scatter plot. 
	O gráfico de dispersão(que também pode ser chamado de Scatter Plot) serve para medir o quão perto ou distante os pontos X estão do ponto Y.
	Em outras palavras, ele mede a correlação que existe entre os pontos. Quando mais próximo, maior a correlação, e quando mais distante, menor.

	Exemplos de uso:
	
		var graficoDispersao = new GraficoDispersao({
			title: 'Grafico de dispersão',
			textColor: 'red',
			titlePosition: 110,
			description: 'Veja a relação que existe entre os dados.',
			writeTo: 'mygraph-el2', 
			
			x: [8,  11, 10, 15, 22, 21, 22, 23, 25],
			y: [12, 25, 5,  15, 30, 21, 22, 24, 50],
			color: 'blue',
			backgroundColor: 'white',
			pointSize: 2,
			pointType: 'bubble',
			width: 500,
			height: 500
		});

*/
class GraficoDispersao extends GraficoBase{
	constructor(config){
		super(config);
		if( config.onClassInit ){
			config.onClassInit(this);
		}

		this.idGrafico = 'gra' + String( new Date().getTime() );

		this.title = 'Grafico de barras';
		this.description = 'Veja os niveis abaixo.';
		this.width = 600;
		this.height = 400;

		//Vai ser atrituido depois de montar o grafico
		this.isRendered = false;
		this.elemento = null;

		this.x = [];
		this.y = [];
		this.color = 'lightblue';
		this.backgroundColor = 'white';
		this.backgroundLinesColor = 'black';
		this.backgroundLineSize = 1;
		this.backgroundLineSpaceY = 15;
		this.backgroundLineSpaceX = 15;
		this.colors = ['blue', 'yellow', 'orange', 'red'];
		this.titlePosition = 25;

		//Vertical and horizintal lines
		this.lines = {
			vertical: true,
			horizontal: true
		};

		this.scales = {
			vertical: true,
			horizontal: true
		};

		this.pointType = 'bubble';
		this.rectWidth = 50;
		this.rectHeight = 50;	

		this.cimadateDelay = 1;

		//Se o ponto for uma bolha, ou circulo, usa um radius
		this.bubbleRadius = 10;

		this.textColor = 'black';

		this.copyArgs(config);

		if( config.pointSize ){
			this.rectHeight = this.pointSize;
			this.rectWidth = this.pointSize;
			this.bubbleRadius = this.pointSize;
		}

		this.idElemento = `grafico-${this.idGrafico}`;

		this.createGrafico();

		if( this.onGraphCreate ){
			this.onGraphCreate(this);
		}
	}

	separarPontos(sepSize=50){
		const x = this.x,
		      y = this.y,
		      oldX = [... x],
		      oldY = [... y];

		for( let i = 0 ; i < x.length ; i++ ){
			x[i] += Math.floor( Math.abs(x[i] - this.bubbleRadius * 2 ) * this.bubbleRadius * 2 );
			y[i] += Math.floor( Math.abs(y[i] - this.bubbleRadius * 2 ) * this.bubbleRadius * 2 );
		}
	}

	drawBackgroundColor(cnv){
		const ctx = cnv.getContext('2d');
		ctx.fillStyle = this.backgroundColor;
		ctx.fillRect(0,0, cnv.width, cnv.height);
	}

	drawLinesBeforeData(cnv, color='black'){
		const ctx = cnv.getContext('2d'),
		      espaceY = this.backgroundLineSpaceY,
		      espaceX = this.backgroundLineSpaceX,
		      lineSize = this.backgroundLineSize;

		//Desenha de acordo com a camera de visualizacao do grafico
		if( this.lines.horizontal )
		{ 
			//Horizontal
			for( let h = this.cameraGrafico.y ; h < this.cameraGrafico.y + cnv.height ; h += espaceY ){
				for( let w = this.cameraGrafico.x ; w < this.cameraGrafico.x + cnv.width ; w++ ){
					ctx.fillStyle = color;
					ctx.fillRect(w, h, 1, lineSize);
				}
			}
		}

		if( this.lines.vertical )
		{ 
			//Vertical
			for( let w = this.cameraGrafico.x ; w < this.cameraGrafico.x + cnv.width; w += espaceX ){
				for( let h = this.cameraGrafico.y ; h < this.cameraGrafico.y + cnv.height ; h++ ){
					ctx.fillStyle = color;
					ctx.fillRect(w, h, lineSize, 1);
				}
			}
		}
	}

	//Segunda Tentativa de desenhar escala no grafico
	drawScales(cnv, color="black"){
		const minY = this.getValorMinimo(this.y),
		      maxY = this.getValorMinimo(this.y),
		      meanY = this.mediaVetor(this.y),
		      minX = this.getValorMinimo(this.x),
		      maxX = this.getValorMinimo(this.x),
		      meanX = this.mediaVetor(this.x);

		const ctx = cnv.getContext('2d');
		ctx.font = `12px Arial`;

		//Desenha de acordo com a camera de visualizacao do grafico
		if( this.scales.horizontal )
		{ 
			let nextW = -cnv.width;

			//Horizontal
			for( let w = -cnv.width ; w < this.cameraGrafico.x + cnv.width ; w += 1 ){
				ctx.fillStyle = color;

				if( w >= nextW ){
					ctx.fillText( Number(Number( Number( w/( 0.65 + (this.bubbleRadius) ) ).toFixed(10)) ).toFixed(0), w, this.cameraGrafico.y + (cnv.width - 10) );

					if( Math.abs(w) < 10){
						nextW = (w + 10);

					}else if( Math.abs(w) >= 10){
						nextW = (w + 40);

					}else if( Math.abs(w) >= 100){
						nextW = (w + 50);

					}else if( Math.abs(w) >= 1000){
						nextW = (w + 70);
					}
				}
			}
		}

		if( this.scales.vertical )
		{ 
			let nextH = -cnv.height;

			//Vertical
			for( let h = -cnv.height ; h < this.cameraGrafico.y + cnv.height ; h += 1 ){
				ctx.fillStyle = color;

				if( h >= nextH ){
					ctx.fillText( Number(Number(Number(h/ (3.5 + (this.bubbleRadius) ) ).toFixed(10)) ).toFixed(0), this.cameraGrafico.x + 25, h );

					if( Math.abs(h) < 10){
						nextH = (h + 10);

					}else if( Math.abs(h) >= 10){
						nextH = (h + 40);

					}else if( Math.abs(h) >= 100){
						nextH = (h + 50);

					}else if( Math.abs(h) >= 1000){
						nextH = (h + 80);
					}
				}
			}
		}
	}

	writeTitle(cnv){
		const ctx = cnv.getContext('2d');
		ctx.font = `${ Math.ceil(0.0005) * ((3/100) * cnv.width )  }px Arial`;
		ctx.fillStyle = this.textColor;
		ctx.textAlign = "center";
		ctx.filter = 'saturation(90%) brightness(110%)';
		ctx.fillText(this.title, Math.floor(cnv.width/2), this.titlePosition );
		ctx.strokeText(this.title, Math.floor(cnv.width/2) - 1, this.titlePosition);
	}

	writeDescription(cnv){
		const ctx = cnv.getContext('2d');
		ctx.font = `${ Math.ceil(0.0003) * ((3/100) * cnv.width )  }px Arial`;
		ctx.fillStyle = this.textColor;
		ctx.textAlign = "center";
		ctx.filter = 'saturation(200%) brightness(110%)';
		ctx.fillText(this.description, Math.floor(cnv.width/2), this.titlePosition + 30);
		ctx.strokeText(this.description, Math.floor(cnv.width/2) - 1, this.titlePosition + 30);
	}

	renderPoints(cnv){
		
		const minX = this.getValorMinimo(this.x),
		      minY = this.getValorMinimo(this.y),
		      maxX = this.getValorMaximo(this.x),
		      maxY = this.getValorMaximo(this.y),
		      mean = (this.mediaVetor( this.x ) + this.mediaVetor( this.y ) ) / 2,
		      ctx = cnv.getContext('2d');
		
		this.separarPontos();

		ctx.fillStyle = this.color;
		for( let i = 0 ; i < this.x.length ; i++ ){
			if( this.pointType == 'rect' ){
				ctx.fillRect( this.x[i], this.y[i], this.rectWidth, this.rectHeight );

			}else if( this.pointType == 'bubble' ){
				ctx.beginPath();
				ctx.arc(this.x[i], this.y[i], this.bubbleRadius, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.fill();		
			}
		}
	}

	destroy()
	{
		document.getElementById(this.writeTo).removeChild( this.elemento );

		this._stopRender();

		if( this.onDestroy ){
			this.onDestroy(this);
		}
	}

	hide()
	{
		this.elemento.style.visibility = 'hidden';
		this.elemento.style.display = 'none';

		if( this.onHide ){
			this.onHide(this);
		}
	}

	show()
	{
		this.elemento.style.visibility = 'visible';
		this.elemento.style.display = 'block';

		if( this.onShow ){
			this.onShow(this);
		}
	}

	//Atualiza a exibicao dos dados
	redraw()
	{	
		document.getElementById(this.writeTo).removeChild( this.elemento );
		this.createGrafico();

		if( this.onRedraw ){
			this.onRedraw(this);
		}
	}

	_renderGrafico(){
		if(this.canvas)
		{
			const oldX = [...this.x];
			const oldY = [...this.y];

			const ctx = this.canvas.getContext('2d');
			ctx.clearRect(0,0, this.width, this.height);

			//Move a camera
			ctx.save();
			ctx.translate(-this.cameraGrafico.x, -this.cameraGrafico.y);

			if( this.movimentoGrafico.cima ){
				this.cameraGrafico.y -= this.movimentoGrafico.velocidadeMovimento;
			}

			if( this.movimentoGrafico.baixo ){
				this.cameraGrafico.y += this.movimentoGrafico.velocidadeMovimento;
			}

			if( this.movimentoGrafico.esquerda ){
				this.cameraGrafico.x -= this.movimentoGrafico.velocidadeMovimento;
			}

			if( this.movimentoGrafico.direita ){
				this.cameraGrafico.x += this.movimentoGrafico.velocidadeMovimento;
			}


			if(this.backgroundColor){
				this.canvas.style.backgroundColor = this.backgroundColor;
				this.drawBackgroundColor( this.canvas );
			}

			this.drawLinesBeforeData( this.canvas, this.backgroundLinesColor );
			if(this.title)
			{
				this.writeTitle(this.canvas);
			}
			if(this.description)
			{
				this.writeDescription(this.canvas);
			}

			this.drawScales(this.canvas);

			this.renderPoints( this.canvas );
			ctx.restore();

			//Restaura x e y antes da render
			this.x = oldX;
			this.y = oldY;

		}
	}

	_startLoopRenderGrafico(context){
		const contexto = context;
		contexto._renderGrafico();

		contexto.requestIntervalID = setInterval( function(){
			contexto._renderGrafico.bind(contexto)();
		}, contexto.cimadateDelay );
	}

	_stopRender(){
		clearInterval(this.requestIntervalID);
	}

	//Diz que esta focando nesse grafico
	focus(){
		this.focando = true;
	}

	createGrafico()
	{
		const contexto = this;

		//Se tiver o callback onBeforeRender
		if( this.onBeforeRender ){
			this.onBeforeRender( this );
		}

		const htmlGrafico = `
			<div class="grafico-wrap">
				<div class="grafico-wrap-cabecalho">
					<h2 class='h2-titulo-grafico'> ${this.title} </h2>
					<p class="p-descricao-grafico"> ${this.description} </p>
				</div>

				<div class="grafico-content">
					<canvas width='${this.width}px' height='${this.height}px' id='${this.idElemento}'></canvas>
				</div>
			</div>
		`;

		document.getElementById( this['writeTo'] ).innerHTML += htmlGrafico;

		//Cria a referencia interna
		this.canvas = document.getElementById(this.idElemento);
		this.elemento = this.canvas;

		this.iniciarMovimentosGrafico();
		this._startLoopRenderGrafico(this);

		this.isRendered = true;

		//Se tiver o callback onAfterRender
		if( this.onAfterRender ){
			this.onAfterRender( this );
		}
	}

	copyArgs(args){
		let keys = Object.keys(args);
		for( let i = 0 ; i < keys.length ; i++ ){
			const key = keys[i];
			const value = args[key];

			this[key] = value;
		}
	}
}