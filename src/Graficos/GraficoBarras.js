/*
 * File Name: GraficoBarras.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: WilliamJardim/Visualization © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/
/* 
	grafico = new GraficoBarra({
		title: 'Grafico de barras',
		description: 'Veja os niveis abaixo.',
		writeTo: 'grafico-analise', 
		maxScale: 100, 
		minScale: 0, 
		scaleInc: 'auto',
		percentPrefix: 'pixels',

		data: [
			['eu', 1],
			['ela', 25],
			['fulano', 50],
			['cibrano', 80],
			['mediano', 60],
			['reola', 100]
		],

		colors: {
			"1": 'red',
			"20": 'darkorange',
			"30": 'orange',
			"50": 'yellow',
			"80": '#f4fc03',
			"100": 'lime'
		},

		onClassInit    : function(contexto){},
		onGraphCreate  : function(contexto){},
		onAfterRender  : function(contexto){},
		onEachRender   : function(contexto, texto, valor){},
		onEachLine     : function(contexto, linha){},
		onLineClick    : function(contexto, linha){},
		onBeforeRender : function(contexto){},
		onDestroy      : function(contexto){},
		onHide         : function(contexto){},
		onShow         : function(contexto){},
		onRedraw       : function(contexto){}
	});

 */
class GraficoBarra extends GraficoBase{
    constructor(config){
        super(config);
        if( config.onClassInit ){
            config.onClassInit(this);
        }

        this.idGrafico = 'gra' + String( new Date().getTime() );
        this.minScale = 0;
        this.maxScale = 100;
        this.scaleInc = 5;

        this.midleScale = this.maxScale/2;
        this.percentPrefix = '';

        this.scaleIndicadorSize = 50;

        this.title = 'Grafico de barras';
        this.description = 'Veja os niveis abaixo.';
        this.width = window.innerWidth;
        this.stageWidth = 20;

        //Vai ser atrituido depois de montar o grafico
        this.isRendered = false;
        this.elemento = null;

        this.data = [
            ['eu', 1],
            ['ela', 25],
            ['fulano', 50],
            ['cibrano', 80],
            ['mediano', 60],
            ['reola', 100]
        ]

        this.colors = {
            "1": 'red',
            "20": 'darkorange',
            "30": 'orange',
            "50": 'yellow',
            "60": '#f4fc03',
            "100": 'green'
        };

        this.copyArgs(config);
        this.idElemento = `grafico-${this.idGrafico}`;

        this.createGrafico();

        this.elemento.style.height = String( parseInt( this.elemento.offsetHeight ) + (5/100) * this.elemento.offsetHeight ) + 'px';

        if( this.onGraphCreate ){
            this.onGraphCreate(this);
        }
    }

    //Obtem dados a partir de um array
    setDataFromArray( arr )
    {
        this.data = arr;
    }

    //Obtem dados a partir de um JSON
    //o x é o label, e o y é o valor
    setDataFromJson( jsonArray, x, y )
    {
        this.data = [];

        for( let i in jsonArray )
        {
            const json  = jsonArray[i];
            const label = json[x];
            const value = json[y];

            this.data.push( [ label, value ] );
        }
    }

    appendSampleFromJson(jsonArray, x, y)
    {
        for( let i in jsonArray )
        {
            const json  = jsonArray[i];
            const label = json[x];
            const value = json[y];

            this.data.push( [ label, value ] );
        }
    }

    destroy()
    {
        document.getElementById(this.writeTo).removeChild( this.elemento );

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

    //Pega a cor da linha de acordo com o percetual
    getColorOf(percent)
    {
        const keys = Object.keys(this.colors);
        
        for( let i = 0 ; i < keys.length ; i++ ){

            const porcentoCor = Number(keys[i]),
                    cor = this.colors[ porcentoCor ];

            if( Number(porcentoCor) >= Number(percent) ){
                return cor;
            }
        }
    }

    getPercent(value)
    {
        return (value * 100) / this.maxScale; 
    }

    createGrafico()
    {
        const contexto = this;

        //Se tiver o callback onBeforeRender
        if( this.onBeforeRender ){
            this.onBeforeRender( this );
        }

        let htmlGrafico = `
            <div class="grafico" id="${this.idElemento}">`;

        htmlGrafico += '<div class="cabecalho-grafico">';
        htmlGrafico += `<h2 class="h2-titulo-grafico">${this.title}</h2>`;
        htmlGrafico += `<p class="p-descricao-grafico"> ${this.description} </p>`;
        htmlGrafico += '</div>';

        htmlGrafico += '<div class="dados-grafico">';
        
        //Para cada registro
        for( let i = 0 ; i < this.data.length ; i++ ){
            const text = this.data[i][0],
                    value = this.data[i][1];

            if( value > this.maxScale ){
                console.warn( `AVISO. O valor de Y(dos dados, valor: ${value}) é maior do que a escala ${this.maxScale}`);
            }

            const porcentagemEstagio = this.getPercent(value);
            const quantEstagiosCabem = Math.floor( this.width / this.stageWidth ) - (window.innerWidth <= 700 ? 16 : 21);
            
            htmlGrafico += `
                <div class="linha-grafico">
                    <p>
                        <table>
                        <tr>
                            <td> <span class="label-linha-grafico"> ${text} </span> </td>
                        </tr>
                    
            `;

            //Para cada um dos estagios de acordo com o valor
            let quantEstagios = (quantEstagiosCabem * porcentagemEstagio) / 100;

            htmlGrafico += '<tr><td>'

            for( let e = 0 ; e < quantEstagios ; e++ ){

                htmlGrafico += `
                    <span class="estagio" id="est-${porcentagemEstagio}-${this.idGrafico}"> &nbsp </span>
                `;

            }

            let classificacaoNivel = '*';
            if( value < this.midleScale ){
                classificacaoNivel = 'baixo';
            }else if( value >= this.midleScale-1 ){
                classificacaoNivel = 'medio';
            }else if( value > this.midleScale ){
                classificacaoNivel = 'alto';
            }


            htmlGrafico += `<span class="displayValor"> ${value} ${this.percentPrefix} (${porcentagemEstagio}%) </span> </td></tr></table>`;

            htmlGrafico += `</p>`;
            htmlGrafico += `</div>`;

            if( this.onEachRender ){
                this.onEachRender( this, text, value, porcentagemEstagio );
            }
        }

        //Fecha os dados do grafico
        htmlGrafico += `</div>`;

        //Cria o rodape(footer)
        htmlGrafico += `
            <div class="grafico-rodape">
                <div class="grafico-escalas-div">
                    <span class="grafico-escala-inicio grafico-escala"> ${this.minScale} </span>
        `;

        //Renderiza as escalas DO INICIO
        const quantEscalasCabem = Math.floor( this.width / this.scaleIndicadorSize ) - 2 - 1;
        const metadeEscalasCabem = Math.floor(quantEscalasCabem / 2);

        const scaleRangeInc = this.scaleInc == 'auto' ? (( (window.innerWidth >= 600 ? 4 : 11) /100) * this.maxScale) : this.scaleInc;
        const scaleRange = this.numberRangeWhileNotEnd( this.minScale + scaleRangeInc, this.midleScale-1 , metadeEscalasCabem, scaleRangeInc );
        
        for( let i = 1 ; i < scaleRange.length ; i++ ){
            htmlGrafico += `
                <span class="grafico-escala"> ${scaleRange[i]} </span>
            `;
        }

        htmlGrafico += `
            <span class="grafico-escala-meio grafico-escala"> ${this.midleScale} </span>
        `
        
        //ESCALA DO FINAL
        const scaleRangeEND = this.numberRangeWhileNotEnd( this.midleScale + 1, this.maxScale, metadeEscalasCabem, scaleRangeInc );
        
        for( let i = 1 ; i < scaleRangeEND.length ; i++ ){
            htmlGrafico += `
                <span class="grafico-escala"> ${scaleRangeEND[i]} </span>
            `;
        }

        htmlGrafico += `
            <span class="grafico-escala-fim grafico-escala"> ${this.maxScale} </span>
        `

        //Fecha o rodape do grafico
        htmlGrafico += '</div>';
        htmlGrafico += '</div>';

        //Fecha o container do grafico
        htmlGrafico += '</div>';



        document.getElementById( this['writeTo'] ).innerHTML += htmlGrafico;

        //Cria a referencia interna
        this.elemento = document.getElementById(this.idElemento);

        //Define o tamanho dos elmentos
        const estagios = document.querySelectorAll(`#${this.idElemento} .estagio`);

        estagios.forEach( (estagio, index)=>{
            estagio.style.width = `${contexto.stageWidth}px`;
        } )

        for( let i = 0 ; i < estagios.length ; i++ ){

            const estagio = estagios[i];

            const porcentagemEstagioAtual = parseInt(estagio.id.split('est-')[1]);
            
            const cor = this.getColorOf(porcentagemEstagioAtual);
            estagio.style.backgroundColor = cor;
        }

        //Se tiver o callback onClick
        if( this.onEachLine ){
            const linhasGrafico = document.querySelectorAll(`#${this.idElemento} .linha-grafico`);

            for( let i = 0 ; i < linhasGrafico.length ; i++ ){

                const linha = linhasGrafico[i];
                this.onEachLine( this, linha );

                if( this.onLineClick ){
                    linha.addEventListener('click', function(e){
                        contexto.onLineClick.bind(contexto)(contexto, linha);
                    })
                }
            }

        }

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