/*
 * File Name: GraficoCurvaGauss.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: WilliamJardim/Visualization © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/

/*
Gráfico de curva de gauss

grafico = new GraficoCurvaGauss({
	title: 'Curva de Gauss',
	textColor: 'red',
	titlePosition: 110,
	description: 'Veja a distribuição normal dos dados.',
	writeTo: 'grafico-analise', 

	data: [0.5, 0.2, 0.8, 0.9, 1, 5, 2, 0.8, 0.7, 0.2],
	baseRGB: [0,50,50],
	colorPercentMul: [40,65,25],
	backColor: 'green',
	foreColor: 'blue',
	backgroundColor: 'white',
	width: 500,
	height: 500,

	labelX: 'Amplititude',
	labelY: 'Densidade da probabilidade',
	labelColor: 'darkgreen',

	//Escala de X e Y do grafico
	minXScale: 1,
	maxXScale: 10,
	minYScale: 0.1,
	maxYScale: 0.9,
	scaleColor: 'darkred'
});

*/
class GraficoCurvaGauss extends GraficoBase{
	constructor(config){
		super(config);
		if( config.onClassInit ){
			config.onClassInit(this);
		}

		this.idGrafico = 'gra' + String( new Date().getTime() );

		this.title = 'Curva de Gauss';
		this.description = 'Veja a distribuição normal.';
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

		this.idElemento = `grafico-${this.idGrafico}`;

		if(this.data){
			this.valores = this.data;
		}

		this.createGrafico();

		if( this.onGraphCreate ){
			this.onGraphCreate(this);
		}
	}

	/**
	 * Calcula a curva de gaus para X
	 * recebe os parametros X, desvioPadrao e média artimética
	 * 
	 * Função para calcular a densidade da distribuição normal (função de Gauss)
	 * Fórmula matemática padrão: f(x) = (1 / (σ * sqrt(2 * π))) * exp(-0.5 * ((x - μ) / σ) ^ 2)
	 * onde:
	 * - μ é a média
	 * - σ é o desvio padrão
	 * - x é o valor para o qual a densidade está sendo calculada
	 * - π é a constante Pi (~3.14159)
	 * - e é a base do logaritmo natural (~2.71828)
	*/
	curvaGauss(x, desvioPadrao, media){
		const raizQuadradaDeDuasVezesPI = Math.sqrt(6.283185307179586);
		const subtraiXComMedia = ( (x * 10) - (media * 10) ) / 100;
		const desvioElevadoA2 = Math.pow(desvioPadrao, 2);
		const menosSubtraiXComMedia_elevadoA2 = Math.pow(subtraiXComMedia, 2) * -1;

		return (1 / (desvioPadrao * raizQuadradaDeDuasVezesPI)) * Math.exp(menosSubtraiXComMedia_elevadoA2 / (2 * desvioElevadoA2));
	}

	/*
	Recebe um array e valores, e calcula as curvas de Gauss que podem usadas para construir um grafico de curva de gauss
	No entando o grafico implementa seu propio calculo usando a funcao curvaGauss
	*/
	calcularCurvaGaussArray(valores){
		// Cálculo da média
		const media = this.mediaVetor(valores);

		// Cálculo do desvio padrão
		const desvioPadrao = this.desvioPadraoVetor(valores);

		const curvaGaussArray = [];

		for(let i = 0; i < valores.length; i++) {
			const curva = this.curvaGauss(valores[i], 3, 100);
			curvaGaussArray[i] = curva;
		}

		return curvaGaussArray;
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
		if(this.valores != undefined){

			const valores           = this.valores,
			      valoresSeparados  = [],
			      canvas            = this.getCanvas(),
			      ctx               = canvas.getContext('2d'),
			      curvaGauss        = this.calcularCurvaGaussArray(valores);

			// Cálculo da média
			const media = this.mediaVetor(valores);

			// Cálculo do desvio padrão
			const desvioPadrao = this.desvioPadraoVetor(valores);

			//resolução da curva
			const resolucao = 100;

			// Cria uma lista com valores igualmente espaçados
			for (let i = 0; i < resolucao; i++) {
				valoresSeparados.push((i / (resolucao - 1)) * 10); //10 é o maior valor
			}

			//Renderiza a curva de gauss
			// Plotar a curva Gaussiana
			for (let i = 0; i < valores.length; i++) {
				const x = valores[i];
				const y = this.curvaGauss(x, desvioPadrao, media);
				const height = y * canvas.height;
				const width = canvas.width / (valores.length - 1);
				const xPos = i * width;
				const yPos = canvas.height - height;

				ctx.fillStyle = this.backColor;
				ctx.fillRect(xPos, yPos, width, height);
				ctx.fillStyle = this.foreColor;
				ctx.strokeRect(xPos, yPos, width, height);
			}

			// Adicionar rótulos nos eixos x e y
			ctx.font = "14px Arial";
			ctx.textAlign = 'left';
			ctx.textBaseline = 'top';
			ctx.fillStyle = this.labelColor;
			ctx.fillText(this.labelX, 190, canvas.height + 90 );
			ctx.fillText(this.labelY, -80, 80);
			ctx.fillStyle = "black";

			const min_x = this.minXScale || this.getValorMinimo(valores);  // mínimo valor em x
			const max_x = this.maxXScale || this.getValorMaximo(valores);  // máximo valor em x
			const min_y = this.minYScale || this.getValorMinimo(valores) / 10;  // mínimo valor em y
			const max_y = this.maxYScale || this.getValorMaximo(valores) / 10;  // máximo valor em y

			// desenhar eixo horizontal (x)
			ctx.beginPath();
			ctx.strokeStyle = "#000";

			const posicaoInicialEscalasX_coordenadaX = 0;
			const posicaoInicialEscalasX_coordenadaY = 557;
			const posicaoInicialEscalasY_coordenadaX = 0;
			const posicaoInicialEscalasY_coordenadaY = 557;

			ctx.fillStyle = this.scaleColor;
			// posição inicial do eixo x
			ctx.moveTo(posicaoInicialEscalasX_coordenadaX, posicaoInicialEscalasX_coordenadaY);
			for (let i = min_x; i <= max_x; i++) {
				const x = posicaoInicialEscalasX_coordenadaX + (i - min_x) * (canvas.width - 100) / (max_x - min_x);
				ctx.lineTo(x, posicaoInicialEscalasX_coordenadaY);
				ctx.stroke();

				// desenhar rótulo no eixo x
				ctx.fillText(i, x, posicaoInicialEscalasX_coordenadaY);
			}

			// desenhar eixo vertical (y)
			ctx.beginPath();

			// posição inicial do eixo y
			ctx.moveTo(posicaoInicialEscalasY_coordenadaX, posicaoInicialEscalasY_coordenadaY); 
			for (let j = min_y; j <= max_y; j += 0.1) {
				var y = posicaoInicialEscalasY_coordenadaY - j * (canvas.height - 100) / (max_y - min_y);
				ctx.lineTo(posicaoInicialEscalasY_coordenadaX, y);
				ctx.stroke();

				// desenhar rótulo no eixo y
				ctx.fillText(j.toFixed(1), -30, y);
			}
			ctx.fillStyle = "black";
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