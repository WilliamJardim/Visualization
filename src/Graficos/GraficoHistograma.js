/*
 * File Name: GraficoHistograma.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: WilliamJardim/Visualization © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/

/*
	grafico = new GraficoHistograma({
		title: 'Histograma',
		textColor: 'red',
		titlePosition: 110,
		description: 'Veja a relação que existe entre os dados.',
		writeTo: 'grafico-analise', 

		data: [10,20,30,10,5,5,10,20,20,5,5,5,5,8,8,8,8,8],
		baseRGB: [0,50,50],
		color: 'blue',
		backgroundColor: 'white',
		width: 500,
		height: 500
	});

	O que influencia o tamanho das barras no grafico é a frequencia.
	Quanto mais frequente, maior a barra de Y.
	Quando maior forem os valores de DATA, mais longe do começo do grafico vai ficar a exibição.
	A escala de frequencia dependendo nao é tao precisa.
*/
class GraficoHistograma extends GraficoBase{
	constructor(config){
		super(config);
		if( config.onClassInit ){
			config.onClassInit(this);
		}

		this.idGrafico = 'gra' + String( new Date().getTime() );

		this.title = 'Histograma';
		this.description = 'Veja os niveis abaixo.';
		this.width = 600;
		this.height = 400;

		//Vai ser atrituido depois de montar o grafico
		this.isRendered = false;
		this.elemento = null;

		this.data = [5,10,25,50];
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

		this.rectWidth = 20;
		this.rectHeight = 20;

		this.cimadateDelay = 1;

		this.textColor = 'black';
		this.baseRGB = [0,50,50];
		this.colorPercentMul = [40,65,25];

		this.copyArgs(config);

		this.inputData = this.data;
		this.calculateHistogram();

		this.idElemento = `grafico-${this.idGrafico}`;

		this.createGrafico();

		if( this.onGraphCreate ){
			this.onGraphCreate(this);
		}
	}

	/*
	Função usada para montar um histograma comum.
	Ele calcula as classes e as frequencias
	data é um Array numérico
	*/
	async calcularHistogramaFrequencias( data ){
		const valorMaximo = await this.getValorMaximo(data);
		const valorMinino = await this.getValorMinimo(data);
		const dataLength = data.length;

		//Aplitude total
		const alcance = Number.parseFloat(valorMaximo) - Number.parseFloat(valorMinino);

		//Regra de sturges pra calcular o numero de classes
		const numeroClasses = Math.ceil( (1.0 + 3.3) * Math.log10(dataLength) ); 
		
		//Tamanho do intervalo, ou seja, tamanho da classe
		const amplitude = Math.ceil( Number.parseFloat(alcance) / Number.parseFloat(numeroClasses) );
		
		let classes = [
			//[start, end]
		];

		let classesNumberLine = [];

		//Calcular as classes
		for( let i = valorMinino ; i <= valorMaximo ; i += amplitude )
		{
			classes.push( [ i, i+amplitude ] );

			//Adiciona tambem o valor na reta numerica
			classesNumberLine.push( i );
			if( classes.length == numeroClasses ){
				classesNumberLine.push( i+amplitude );
			}

			if( classes.length == numeroClasses ){ 
				break 
			}
		}
		
		const frequencias = {
			//Ordenado pelo index das classes
			byIndex: {},

			//Ordenado pelo range das classes
			byRange: {},

			array: []
		};
		
		//Calcular as frequencias, ou seja, em cada intervalo, quantos numeros aparecem
		for( let i = 0 ; i < classes.length ; i++ )
		{
			const [inicio, final] = classes[i];
			
			//Para cada dado dentro do array data
			for( let j = 0 ; j < data.length ; j++ )
			{
				const valorDeJ = data[j]; //Ponto J
				
				//Verifica se o valor está entre o intervalo da classe
				if( i == numeroClasses-1 ? (valorDeJ >= inicio && valorDeJ <= final) : 
				                           (valorDeJ >= inicio && valorDeJ < final) 
				){
					if(!frequencias.byIndex[i]){ 
						frequencias.byIndex[i] = 0;
					}
					frequencias.byIndex[i]++;   

					if(!frequencias.byRange[`${inicio}-${final}`]){ 
						frequencias.byRange[`${inicio}-${final}`] = 0;
					}  
					//Outra forma de obter esse dado
					frequencias.byRange[`${inicio}-${final}`] = frequencias.byIndex[i];  
				}
			}

			//Tambem coloca em um array na mesma ordem das classes
			frequencias.array.push( frequencias.byIndex[i] );
		}

		return {
			usedData: data,
			frequencyByIndex: frequencias.byIndex,
			frequencyByRange: frequencias.byRange,
			frequencyArray  : frequencias.array,
			classes: classes,
			classesNumberLine: classesNumberLine,
			amplitude: amplitude,
			alcance: alcance,
			numeroClasses: numeroClasses
		}
	
	}

	getSepararPontos(espacamentoX=0, espacamentoY=0, x, y){
		let sepX = [...x];
		let sepY = [...y];
		let maxX = this.getValorMaximo(x);
		let maxY = this.getValorMaximo(y);
		let mediaY = this.mediaVetor(y);

		//Distancia os pontos pra nao ficar muito colado
		for( let i = 0 ; i < x.length ; i++ ){
			sepX[i] = espacamentoX + (Math.floor( (sepX[i] * Math.sqrt(maxX) ) * maxX ) / maxX ) * Math.sqrt(this.rectWidth);
			sepY[i] = espacamentoY + (Math.floor( (sepY[i] * Math.sqrt(maxY) ) * maxY ) / maxY ) * Math.sqrt(this.rectWidth);
		}

		//Reducao de tamanho
		for( let i = 0 ; i < x.length ; i++ ){
			sepX[i] = Math.floor( sepX[i] / Math.sqrt(this.rectWidth) );
			sepY[i] = Math.floor( sepY[i] / Math.sqrt(this.rectWidth) );
		}
		
		return [sepX, sepY];
	}

	async calculateHistogram(){
		this.calculatedData = await this.calcularHistogramaFrequencias(this.data);
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

	writeTitle(cnv){
		const ctx = cnv.getContext('2d');
		ctx.font = `${ Math.ceil( Math.sqrt(this.width/2) ) }px Arial`;
		ctx.fillStyle = this.textColor;
		ctx.textAlign = "center";
		ctx.filter = 'saturation(90%) brightness(110%)';
		ctx.fillText(this.title, Math.floor(cnv.width/2), this.titlePosition );
		ctx.strokeText(this.title, Math.floor(cnv.width/2) - 1, this.titlePosition);
	}

	writeText(cnv, text, x, y){
		const ctx = cnv.getContext('2d');
		const oldStyle = ctx.fillStyle;
		ctx.font = `${ Math.ceil( Math.sqrt(this.width/2) ) }px Arial`;
		ctx.fillStyle = this.textColor;
		ctx.textAlign = "center";
		ctx.filter = 'saturation(90%) brightness(110%)';
		ctx.fillText(text, x, y );
		ctx.strokeText(text, x - 1, y);
		ctx.fillStyle = oldStyle;
	}

	writeDescription(cnv){
		const ctx = cnv.getContext('2d');
		ctx.font = `${ Math.ceil( Math.sqrt(this.width/2) ) }px Arial`;
		ctx.fillStyle = this.textColor;
		ctx.textAlign = "center";
		ctx.filter = 'saturation(200%) brightness(110%)';
		ctx.fillText(this.description, Math.floor(cnv.width/2), this.titlePosition + 30);
		ctx.strokeText(this.description, Math.floor(cnv.width/2) - 1, this.titlePosition + 30);
	}

	getColorRange( y, baseRGB=[2,20,65], colorPercentMul=[20,50,25] ){
		let colorRange = [];
		for( let i = 0 ; i < y.length ; i++ ){
			const freq = Math.floor( y[i] );
			let red   = baseRGB[0] + ( (freq <= 255 ? freq : 255) * (colorPercentMul[0]/100) );
			let green = baseRGB[1] + ( (freq <= 255 ? freq : 255) * (colorPercentMul[1]/100) );
			let blue  = baseRGB[2] + ( (freq <= 255 ? freq : 255) * (colorPercentMul[2]/100) );

			colorRange.push( `rgb(${red},${green},${blue})` );
		}

		return colorRange;
	}

	renderPoints(cnv){
		if(this.calculatedData != undefined){

			const originalX = this.calculatedData.classesNumberLine,
			      originalY = this.calculatedData.frequencyArray,
			      sortedOriginalY = this.arraySortDescending([...originalY]),
			      pontosSeparados = this.getSepararPontos(0, 0, originalX, originalY),
			      x = pontosSeparados[0].filter( function(v){ if( !isNaN(v) && v != undefined ){ return v }  } ),
			      y = pontosSeparados[1].filter( function(v){ if( !isNaN(v) && v != undefined ){ return v }  } ),
			      minY = this.getValorMinimo(originalY),
			      maxY = this.getValorMaximo(originalY),
			      meanY = this.mediaVetor(originalY),
			      minDrawY = this.getValorMinimo( y ),
			      maxDrawY = this.getValorMaximo( y ),
			      ctx = cnv.getContext('2d');

			//Calcula as cores
			const colors = this.getColorRange(y, this.baseRGB, this.colorPercentMul);

			//Para cada classe
			for( let ix = 0 ; ix < x.length ; ix++ )
			{
				const freqDeX = y[ix];
				const freqOriginalDeX = originalY[ix];

				const classX = x[ix];
				const classOriginalDeX = originalX[ix];

				ctx.fillStyle = colors[ix];

				for( let iy = freqDeX ; iy > 0 ; iy-- )
				{
					ctx.fillRect(Math.ceil(x[ix]) + this.width/4, -iy + this.height, this.rectWidth, this.rectHeight );
				}

				//Coloca o texto da classe
				if( !isNaN(classOriginalDeX) ){
					this.writeText(cnv, Math.floor(classOriginalDeX), (this.rectWidth/2) + Math.ceil(x[ix]) + this.width/4, this.height + this.rectHeight + this.rectHeight );
				}

				//Desenha uma borda a esquerda e direita dos blocos
				for( let iy = 0 ; iy <= freqDeX; iy++ )
				{
					//Borda
					ctx.fillStyle = 'black';
					ctx.fillRect(Math.ceil(x[ix]) + this.width/4, -iy + this.height, 2, 2);
					ctx.fillRect( (Math.ceil(x[ix]) + this.width/4) + this.rectWidth, -iy + this.height, 2, 2);
				}

				//Desenha linhas internas
				for( let iy = freqDeX ; iy > 0; iy -= 20 )
				{
					//Linha interna
					ctx.fillStyle = 'black';
					ctx.fillRect(Math.ceil(x[ix]) + this.width/4, -iy + this.height, this.rectWidth, 2);
				}
			}

			/*Desenha a escala das frequencias á esquerda*/
			let nextH = minDrawY;
			
			for( let h = minDrawY ; h < (minDrawY + maxDrawY + 10) ; h += 1 ){
				ctx.fillStyle = 'black';

				if( h >= nextH ){
					const calcValorFreq = (h * maxY) / (minDrawY + maxDrawY + 10)
					this.writeText( cnv,  Math.ceil(calcValorFreq), this.cameraGrafico.x + 25, -h + this.height + 50 );

					nextH = h + this.rectHeight;
					
				}
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

			//this.drawScales(this.canvas);
			
			this.renderPoints( this.canvas );
			ctx.restore();

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
