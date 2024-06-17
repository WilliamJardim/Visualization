/*
 * File Name: GraficoBase.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: WilliamJardim/Visualization © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/
class GraficoBase{
    constructor(config){
        this.copyArgs(config);

        //Camera do grafico, ou seja, podemos mover pro lado pro outro etc...
		this.cameraGrafico = {
			x: 0,
			y: 0,
			width: config.width,
			height: config.height
		};
    }

    iniciarMovimentosGrafico = function(){
        const contexto = this;

        this.movimentoGrafico = {
			cima: false,
			baixo: false,
			esquerda: false,
			direita: false,
			velocidadeMovimento: 12
		} 

        //Movimentacao do gráfico usando mouse
		this.xMouseAntigo = 0;
		this.yMouseAntigo = 0;

		//Ja começa focando nos eventos do grafico
		this.focando = true;
		this.movimentoGraficondoGraficoComMouse = false;

		this.canvas.onclick = function(){
			contexto.focus();
		};

		window.addEventListener('keydown', function(event) {
			const key = event.key;
			if( !contexto.focando ){ return };

			if( key == 'w' ){
				contexto.movimentoGrafico.cima = true;
			}else if( key == 'a' ){
				contexto.movimentoGrafico.esquerda = true;
			}else if( key == 'd' ){
				contexto.movimentoGrafico.direita = true;
			}else if( key == 's' ){
				contexto.movimentoGrafico.baixo = true;
			}

			contexto.movimentoGraficondoGraficoComMouse = false;
			contexto.movimentoGraficondoGraficoComTeclado = true;

		}, false);

		window.addEventListener('keyup', function(evento) {
			const key = evento.key;
			if( !contexto.focando ){ return };

			if( key == 'w' ){
				contexto.movimentoGrafico.cima = false;
			}else if( key == 'a' ){
				contexto.movimentoGrafico.esquerda = false;
			}else if( key == 'd' ){
				contexto.movimentoGrafico.direita = false;
			}else if( key == 's' ){
				contexto.movimentoGrafico.baixo = false;
			}

			contexto.movimentoGraficondoGraficoComTeclado = false;

		}, false);

        this.direcaoMovimentoMouse = undefined;
		window.addEventListener('mousemove', function(evento) {
			if(evento.pageX < contexto.xMouseAntigo){
            	contexto.direcaoMovimentoMouse = "esquerda"
	        }else if(evento.pageX > contexto.xMouseAntigo){
	            contexto.direcaoMovimentoMouse = "direita"
	        } 
            contexto.xMouseAntigo = evento.pageX;

	        if(evento.pageY > contexto.yMouseAntigo){
	            contexto.direcaoMovimentoMouse = "baixo"
	        }else if(evento.pageY < contexto.yMouseAntigo){
	            contexto.direcaoMovimentoMouse = "cima"
	        }
	        contexto.yMouseAntigo = evento.pageY;

	        contexto.ultimaDirecaoDoMouse = contexto.direcaoMovimentoMouse;

	        if(!contexto.movimentoGraficondoGraficoComTeclado)
	        {
		        if(contexto.movimentoGraficondoGraficoComMouse)
		        {
		        	if( contexto.ultimaDirecaoDoMouse == 'cima' ){
						contexto.movimentoGrafico.cima = true;
					}else if( contexto.ultimaDirecaoDoMouse == 'esquerda' ){
						contexto.movimentoGrafico.esquerda = true;
					}else if( contexto.ultimaDirecaoDoMouse == 'direita' ){
						contexto.movimentoGrafico.direita = true;
					}else if( contexto.ultimaDirecaoDoMouse == 'baixo' ){
						contexto.movimentoGrafico.baixo = true;
					}

		        }else{
		        	contexto.movimentoGrafico.cima = false;
					contexto.movimentoGrafico.baixo = false;
					contexto.movimentoGrafico.esquerda = false;
					contexto.movimentoGrafico.direita = false;
		        }
		    }

		}, false);

		window.addEventListener('mousedown', function(evento) {
			contexto.movimentoGraficondoGraficoComMouse = true;
		}, false);

		window.addEventListener('mouseup', function(evento) {
			contexto.movimentoGraficondoGraficoComMouse = false;
			contexto.movimentoGrafico.cima = false;
			contexto.movimentoGrafico.baixo = false;
			contexto.movimentoGrafico.esquerda = false;
			contexto.movimentoGrafico.direita = false;
		}, false);
    }

    //Ordem decrescente
    arraySortDescending = function(a)
    {
        return a.sort( function(n1, n2){
            return n1 - n2;
        });
    }

    numberRange = function(inicio, fim, inc=1)
    {
        let arr = [];
        for( let i = inicio ; i < fim ; i += inc ){
            arr.push(i);
        }

        return arr;
    }

    numberRangeWhileNotEnd = function(inicio, fim, fimLength, inc=1)
    {
        let arr = [];
        let passouMax = false;
        let i = inicio;
        
        while( arr.length < fimLength ){
            if( i > fim-inc ){
                passouMax = true;
            }

            arr.push( i );
            
            if( !passouMax ){
                i += inc;
            }else{
                i++;
            }
        }

        return arr;
    }

    getTime = function()
    {
        return new Date().getTime();
    }

    removeEmptyDivs = function()
    {
        const divs = document.querySelectorAll('div');

        divs.forEach(div => {
            if (div.innerHTML === '') {
                div.remove();
            }
        });
    }

    copyArgs = function(args){
        let keys = Object.keys(args);
        for( let i = 0 ; i < keys.length ; i++ ){
            const key = keys[i];
            const value = args[key];

            this[key] = value;
            this.elemento ? this.elemento.setAttribute(String(key), value) : null;
        }
    }

    getCanvas(){
		return this.canvas;
	}

	getBase64(){
		return this.getCanvas().toDataURL();
	}

	async getImagem(){
		const contexto = this;

		return new Promise(resolve => {
			let imagemHtml = document.createElement('img');
			imagemHtml.src = contexto.getBase64();
			imagemHtml.crossOrigin = "anonymous";
			imagemHtml.setAttribute("crossOrigin", "");
			imagemHtml.onload = async function(){
				resolve(this);
			}
		});
	}

    async baixarImagem(nomeArquivo='grafico.jpeg'){
        const imagem = (await this.getImagem());
        const linkImagem = document.createElement('a');
        document.body.prepend(linkImagem);
        linkImagem.setAttribute('href', imagem.src);
        linkImagem.download = nomeArquivo;
        linkImagem.click();
        document.body.removeChild(linkImagem);
    }

    getValorMaximo(vetor) {
        return vetor.reduce(function(maximo, numero){
            if( maximo >= numero ){
                return maximo;
            }else{
                return numero;
            }

        }, -Infinity);
    }

    getValorMinimo(vetor) {
        return vetor.reduce(function(ponto, numero){
            if( ponto < numero ){
                return ponto;

            }else{
                return numero;
            }
        });
    }

    mediaVetor(vetor){
        const quantidade = vetor.length;

        let soma = 0;
        for (let i = 0; i < quantidade; i++){
            soma = soma + vetor[i];
        }

        return soma / quantidade;
    }

    varianciaVetor(vetor) {
        //Calcula a média do array
        const media = this.mediaVetor(vetor);

        //Tira a diferença entre o elemento do vetor e a média do vetor
        const vetorDiferencasAoQuadrado = [];
        for( let i = 0 ; i < vetor.length ; i++ ){
            vetorDiferencasAoQuadrado.push( (vetor[i] - media) ** 2 );
        }

        const variancia = this.mediaVetor(vetorDiferencasAoQuadrado);
        return variancia;
    }

    desvioPadraoVetor(vetor) {
        const variancia = this.varianciaVetor(vetor);
        return Math.sqrt( variancia );
    }
}