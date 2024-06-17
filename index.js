/*
 * File Name: index.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 *  
 * LICENSE: WilliamJardim/Visualization © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/

var grid = MyGrid.VisualGrid({
    id: 'mygrid',
    writeTo: 'mygrid-el',
    title: 'A Grid',
    
    columns: [
        {
            name: 'Tipo',
            altname: 'tipo',
            style: {
                applies: ['header', 'body'],
                textColor: 'black',
                fontSize: '22px',
                backgroundColor: 'blue',
                bold: false,
                italic: true,
                width: 50,
                cssClass: 'mycustomclass'
            }
        },
        {
            name: 'Nome',
            altname: 'nome',
            style: {
                applies: ['header', 'body'],
                textColor: 'black',
                fontSize: '22px',
                backgroundColor: 'green',
                bold: false,
                italic: true,
                width: 100,
                cssClass: 'mycustomclass'
            }
        },
        {
            name:  'Idade',
            antname: 'idade',
            style: {
                applies: ['header', 'body'],
                textColor: 'black',
                fontSize: '22px',
                backgroundColor: 'orange',
                bold: false,
                italic: true,
                width: 100,
                cssClass: 'mycustomclass'
            }
        }
    ],
    
    samples: [
        { Nome: 'William', Idade: 20, Tipo: 'Amigo' },
        { Nome: 'Rafael', Idade: 24, Tipo: 'Parente' },
        { Nome: 'Ana', Idade: 35, Tipo: 'Parente' },
        { Nome: 'Gustavo', Idade: 33, Tipo: 'Amigo' }
    ],
    emptyColumnValue: '',
    autoRender: true,
    
    /*Estilos aplicados diretamente*/
    style: {
        title: {
            textColor: 'black',
            fontSize: '30px',
            backgroundColor: 'orange',
            bold: true,
            italic: true
        },
        header: {
            textColor: 'black',
            fontSize: '22px',
            backgroundColor: '#a2cf63',
            bold: true,
            italic: true
        },
        body: {
            textColor: 'black',
            fontSize: '22px',
            backgroundColor: '#a0e342',
            bold: false
        },
        //Aplica um estilo especifico para determinadas colunas
        columns: {
            '*': {
                applies: ['header'],
                textColor: 'black',
                fontSize: '22px',
                backgroundColor: 'blue',
                bold: true,
                italic: true,
                width: 100,
                height: 20,
                textAlign: 'center'
            }
        }
    }
});

var graficoBarra = new GraficoBarra({
    title: 'Grafico de barras',
    description: 'Veja os niveis abaixo.',
    writeTo: 'mygraph-el', 
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

    onInit         : function(contexto){},
    onCreate       : function(contexto){},
    onAfterRender  : function(contexto){},
    onEachRender   : function(contexto, texto, valor){},
    onEachLine     : function(contexto, linha){},
    onLineClick    : function(contexto, linha){},
    onBeforeRender : function(contexto){},
    onDestroy      : function(contexto){},
    onHide         : function(contexto){},
    onShow         : function(contexto){},
    onReload       : function(contexto){}
});

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

var graficoHistograma = new GraficoHistograma({
    title: 'Histograma',
    textColor: 'red',
    titlePosition: 110,
    description: 'Veja a relação que existe entre os dados.',
    writeTo: 'mygraph-el3', 

    data: [1,2,3,3,3,3,2,1,10,10,10,20,20,20,30,30,30,30,30,30,30,30],
    baseRGB: [0,50,50],
    color: 'blue',
    backgroundColor: 'white',
    width: 500,
    height: 500
});