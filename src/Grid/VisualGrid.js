/*
 * File Name: VisualGrid.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: WilliamJardim/Visualization © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/

if( !globalThis.MyGrid ){
    globalThis.MyGrid = {};
}

/*
* Cria uma Grid visual
* @param {object} config - configuracoes internas
*
* Exemplo de uso:
*
*   var grid = MyGrid.VisualGrid({
*       id: 'mygrid',
*       title: 'A Grid',
*       columns: ['Nome', 'Idade'],
*       writeTo: 'mygrid-el',
*       samples: [
*           { Nome: 'William', Idade: 20 },
*           { Nome: 'Rafael', Idade: 24 },
*           { Nome: 'Ana', Idade: 35 },
*           { Nome: 'Gustavo', Idade: 33 }
*       ],
*       autoRender: true
*   });
*
*/
MyGrid.VisualGrid = function(config={}){
    const context = MyGrid.GridComponent(config);
    context.extendedFrom = 'GridComponent';
    context.objectName = 'VisualGrid';
    context._isVisualGrid = true;
    context._writeTo = config['writeTo'] || null;
    context._columnNameMap = {};
    context._colunasHtml = ``;
    context._renderedHtmlLines = ``;
    context._autoRender = config['autoRender'] || false;
    context._elementId = config['id'] || String( new Date().getTime() );
    context._emptyColumnValue = config['emptyColumnValue'] || '';
    context._customGridCSS = config['css'];

    //Metadados de cada coluna
    context.columnsConfig = {};

    context.getColumnConfig = function( columnName ){
        return context.columnsConfig[columnName];
    };

    context._columnAliases = {};
    
    context.addColumnAlias = function(columnName, altName){
        context._columnAliases[altName] = columnName;
    }

    context.getColumnByAlias = function(columnName){
        return context._columnAliases[columnName];
    }

    /**
     * @property {array} _columnNames - um array que contem os nomes das colunas que serão desenhadas na grid.
     * 
     * Voce poder criar um assim(simplismente passando uma lista de strings)
     * Exemplo:
     *    columns: ['Nome', 'Idade, etc...]
     * 
     * Ou voce também pode especificar melhor
     * Exemplo:
     *  columns: [
            {
                name: 'Tipo',
                altname: 'tipo',
                style: {
                    ...
                }
            },
            {
                name: 'Nome',
                altname: 'nome',
                style: {
                    ...
                }
            },
            ...
        ],     
     * 
     * Note que também é possivel passar um atributo de estilo para cada coluna:
     * Exemplo:
     *     style: {
                applies: ['header', 'body'],
                textColor: 'black',
                fontSize: '22px',
                backgroundColor: 'red',
                bold: false,
                italic: true,
                width: 50,
                cssClass: 'mycustomclass'
            }
    */

    //cria/recria as colunas do array _columnNames e do columnsConfig, que vão ser usadas para desenhar a grid depois
    context._updateColumnsInstances = function(){
        //Se o columns da grid for um array de objetos, ele vai preencher o columnsConfig
        if( config['columns'][0] instanceof Object ){
            context._columnNames = [];
            config['columns'].forEach(function( columnDict ){
                if( !columnDict.name ){ throw '"columnDict" precisa ter o atributo name!' };

                context.columnsConfig[ columnDict.name ] = MyGrid.ColumnManipulator({... columnDict});
                context._columnNames.push( columnDict.name );
            });

        //Se columns for um simples array
        }else{
            context._columnNames = config['columns'] || null;
            config['columns'].forEach(function( columnName ){
                context.columnsConfig[ columnName ] = MyGrid.ColumnManipulator({});
            });
        }
    }

    context._updateColumnsInstances();

    /*
    * Aplica um grupo de estilos a todos os elementos de uma determinada classe
    * @param {string} targetClass - a classe em questao
    * @param {object} propsDict - os estilos de OBJECT.STYLE
    */
    context._applyStyleDirectly = function(targetClass, propsDict){
        const query = document.getElementsByClassName(targetClass);
       
        //Para cada elemento da query acima
        for( let i = 0 ; i < query.length ; i++ ){
            const currentElement = query[i];
            const keys = Object.keys( propsDict );

            //Aplica todos os estilos dentro do propsDict
            for( let j = 0 ; j < keys.length ; j++ ){
                const key = keys[j]; 
                currentElement.style[ key ] = propsDict[ key ];
            }

            //Se tiver cssClass, tenta aplicar
            if( propsDict['cssClass'] && !currentElement.className.includes( propsDict['cssClass'] ) ){
                currentElement.className += ` ${propsDict['cssClass']}`;
            }

            if( propsDict['width'] ){
                currentElement.style.width = (typeof propsDict['width'] == 'number' ? String(propsDict['width'])+'px' : propsDict['width']);
            }

            if( propsDict['height'] ){
                currentElement.style.height = (typeof propsDict['height'] == 'number' ? String(propsDict['height'])+'px' : propsDict['height']);
            }
        }
    }

    /*
    * Função especifica para aplicar o estilo padrao para uma determinada coluna(em todas as linhas), em sentido vertical
    * @param {string} columnClass - a classe da coluna.
    * @param {string} retriveFrom - qual o grupo de estilo(titulo, cabecalho, geral, etc...)
    */
    context.applyStyleToAllRowsInColumn = function(columnClass, retriveFrom){
        if( context._directStyle && context._directStyle[retriveFrom] ){
            if( context._directStyle[retriveFrom].bold || context._directStyle[retriveFrom].italic ){
                context._applyStyleDirectly( columnClass, {
                    fontWeight: (context._directStyle[retriveFrom].bold == true) ? 'bold' : 'normal',
                    fontStyle: (context._directStyle[retriveFrom].italic == true) ? 'italic' : 'normal'
                });
            }
            context._applyStyleDirectly( columnClass, context._directStyle[retriveFrom]);
        }
    }

    /**
    * Similar a função anterior. Isso é uma função especifica para aplicar o estilo padrao para uma determinada coluna(em todas as linhas), em sentido vertical
    * @param {string} columnClass - a classe da coluna.
    * @param {string} propsDict - os estilos de OBJECT.STYLE
    */
    context.applyStyleToAllRowsInColumnCustomProps = function(columnClass, propsDict){
        if( propsDict.bold || propsDict.italic ){
            context._applyStyleDirectly( columnClass, {
                fontWeight: propsDict.bold == true ? 'bold' : 'normal',
                fontStyle: propsDict.italic == true ? 'italic' : 'normal'
            });
        }
        context._applyStyleDirectly( columnClass, propsDict);
    }

    /**
    * @property {object} _customStyle - estilos CSS personalizados a serem aplicados sobre a grid.
    * Exemplo:
        css: {
            header: {
                row: 'myheadrow',
                column: 'myheadcol'
            },
            all: {
                row: 'myrow',
                column: 'mycol'
            }
        }
    */
    context._customStyle = (config['css'] || context._customGridCSS) ? (config['css'] || context._customGridCSS) : {
        table: '',
        title: '',
        header: {
            column: '',
            row: ''
        },
        all: {
            firstColumn: '',
            column: '',
            row: ''
        }
    };

    /**
     * @property {object} _directStyle - Permite aplicar estilos CSS diretamente a cada elemento da Grid, de maneira mais direta
     * Essa abordagem elimina a necessidade de criar classes CSS
     * 
     * Exemplo:
        * style: {
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
                    Nome: {
                        applies: ['header', 'body'],
                        textColor: 'black',
                        fontSize: '22px',
                        backgroundColor: 'blue',
                        bold: false,
                        italic: false,
                        cssClass: 'classepersonalizada'
                    }
                }
            }
    */
    context._directStyle = config['style'] || null;

    /**
    * @property {object} _columnsStyle - Sub-propriedade do context._directStyle(citada sutilmente acima), porém especifica para as colunas.
    * Isso permite aplicar um estilo personalizado para cada coluna. 
    * 
    * Exemplo de uso:
    *   //Aplica um estilo especifico para determinadas colunas
        columns: {
            '*': {
                applies: ['header'],
                textColor: 'black',
                fontSize: '22px',
                backgroundColor: 'blue',
                bold: true,
                italic: true
            },
            Nome: {
                applies: ['header', 'body'],
                textColor: 'black',
                fontSize: '22px',
                backgroundColor: 'white',
                bold: false,
                italic: false,
                cssClass: 'classepersonalizada'
            }
        }

        È possivel escolher se determinada regra de estilo vai ser aplicar somente ao body da tabela, ou somente no header, ou em ambos
        Pra isso usamos a propriedade 'applies', que é um array.
        
        O caracter '*' permite aplicar estilos todas as colunas de uma só vez

        Também é possivel aplicar estilos css de outra forma, usando arrays de objetos

        columns: [
            {
                tocolumn: '*',
                applies: ['header'],
                textColor: 'black',
                fontSize: '22px',
                backgroundColor: 'blue',
                bold: true,
                italic: true
            },
            {
                tocolumn: 'Tipo',
                applies: ['body', 'header'],
                textColor: 'black',
                fontSize: '22px',
                backgroundColor: 'red',
                bold: true,
                italic: true
            }
        ]

        Isso permite que estilos sejam mais profundos, bem mais especificos.
    */
    context.buildLayout = function(){
        context._colunasHtml = ``;
        context._renderedHtmlLines = ``;
        context._columnsStyle = (config['style'] || context._config['style']) ? (config['style']['columns'] || context._config['style']['columns']) ? (config['style']['columns'] || context._config['style']['columns']) : {} : {};

        context._title = (config['title'] || context._config['title']) ? `
            <h2 class='MyGrid-title${(context._customStyle.title || null) ? (' ' + context._customStyle.title) : ''}'> ${ (config['title'] || context._config['title']) } </h2>
        ` : '';
    
    
        //Cria as colunas TD
        for( let i = 0 ; i < context._columnNames.length ; i++ )
        {   
            context._colunasHtml += `
                <td class='MyGrid-justheader-column MyGrid-header-column ${(context._customStyle.header && context._customStyle.header.column || null) ? (context._customStyle.header.column + ' ') : ''}MyGrid-column ${ i == 0 ? 'MyGrid-first-column' : '' }${ i == 0 && (context._customStyle.body && context._customStyle.body.firstColumn || null) ? ' '+context._customStyle.body.firstColumn : ''} MyGrid-header-column-${context._columnNames[i]} MyGrid-global-column-${context._columnNames[i]}'> ${ context._columnNames[i] } </td>
            `;
            context._columnNameMap[ i ] = context._columnNames[i];
        }
    
        //Adiciona as amostras
        for( let i = 0 ; i < context.samples.length ; i++ )
        {   
            const sample = context.samples[i];
            const rowUniqueId = `row-${(new Date().getTime())}`;
            let sampleColunasTD = ``;
    
            for( let j = 0 ; j < context._columnNames.length ; j++ )
            {
                const colUniqueId = `col-${(new Date().getTime())}`;
    
                sampleColunasTD += `
                    <td class='MyGrid-index-${i}-${j} MyGrid-columnid-${colUniqueId} MyGrid-justcolumn ${(context._customStyle.body && context._customStyle.body.column || null) ? (context._customStyle.body.column + ' ') : ''}MyGrid-column ${ j == 0 ? 'MyGrid-first-column' : '' } MyGrid-column-${context._columnNames[j]} MyGrid-global-column-${context._columnNames[j]}' > ${ sample.getColumnValue( context._columnNames[j] ) || context._emptyColumnValue } </td>
                `
            }   
    
            context._renderedHtmlLines += `
                <tr class='MyGrid-row-${i} MyGrid-rowid-${rowUniqueId} ${(context._customStyle.body && context._customStyle.body.row || null) ? (context._customStyle.body.row+' ') : '' }MyGrid-row'>
                    ${ sampleColunasTD }
                </tr>
            `;
        }
    
        //Concatena tudo em um unico template em forma de string
        context._htmlTemplate = `
            <div class='MyGrid-container'>
                ${ context._title ? context._title : '' }
                <table class='MyGrid-table${(context._customStyle.table || null) ? (' ') + context._customStyle.table : '' }' id='${ context._elementId }'>
                    <tr class='MyGrid-header-row${(context._customStyle.header && context._customStyle.header.row || null) ? (' '+context._customStyle.header.row) : ''} MyGrid-row'>
                        ${context._colunasHtml}
                    </tr>
                    ${context._renderedHtmlLines}
                </table>
            </div>
        `;
    }
    
    context.buildLayout();

    //Renderiza a grid no html
    context.drawHtml = function(){
        if( context._writeTo )
        {
            document.getElementById( context._writeTo ).innerHTML = context._htmlTemplate;
        }else{
            console.warn('Impossible to render grid, without "writeTo" prop.');
        }

        //Aplica estilos
        if( context._directStyle ){
            setTimeout( ()=>{
                //Title Style
                context.applyStyleToAllRowsInColumn('MyGrid-title', 'title');
                //Body Style
                context.applyStyleToAllRowsInColumn('MyGrid-column', 'body');
                //Header Style
                context.applyStyleToAllRowsInColumn('MyGrid-header-column', 'header');

                //Aplica estilos especificos para as colunas
                if( context._columnsStyle ){
                    const stylesIterator = context._columnsStyle instanceof Array ? context._columnsStyle : Object.keys(context._columnsStyle);
                    const styleIsObject = context._columnsStyle instanceof Array == false && context._columnsStyle instanceof Object;

                    (stylesIterator).forEach(function(columnNameIterating){

                        const columnName = styleIsObject ? columnNameIterating : columnNameIterating.tocolumn;
                        if( !styleIsObject && !columnNameIterating.tocolumn ){
                            throw '"tocolumn" esta faltando dentro do objeto do array.';
                        }
                        
                        const appliesToHeader = ( (!styleIsObject && (columnNameIterating != undefined) && (columnNameIterating.tocolumn != undefined) ) == true ? (columnNameIterating.applies && columnNameIterating.applies.includes('header') == true) : false ) || 
                                                styleIsObject == true && context._columnsStyle[columnName].applies && context._columnsStyle[columnName].applies.includes('header') == true;
                        
                        const appliesToBody = ( (!styleIsObject && (columnNameIterating != undefined) && (columnNameIterating.tocolumn != undefined) ) == true ? (columnNameIterating.applies && columnNameIterating.applies.includes('body') == true) : false ) || 
                                                styleIsObject == true && context._columnsStyle[columnName].applies && context._columnsStyle[columnName].applies.includes('body') == true;
                        
                        const defaultApplies = ( (!styleIsObject && (columnNameIterating != undefined) && (columnNameIterating.tocolumn != undefined) ) == true ? ( columnNameIterating.applies == undefined ) : false ) ||
                                                styleIsObject == true && context._columnsStyle[columnName].applies == undefined;

                        //Se for um estilo para todas, usando asterisco
                        if( columnName == '*' || columnName == '**' ){
                            //Se isso se aplica somente a tal parte da grid
                            if( appliesToHeader || defaultApplies){
                                context.applyStyleToAllRowsInColumnCustomProps(`MyGrid-justheader-column`, styleIsObject == true ? context._columnsStyle[columnName] : columnNameIterating);
                            }

                            if( appliesToBody || defaultApplies){
                                context.applyStyleToAllRowsInColumnCustomProps(`MyGrid-justcolumn`, styleIsObject == true ? context._columnsStyle[columnName] : columnNameIterating);
                            }

                        //Se for um estilo para uma coluna especifica
                        }else{
                            //Se isso se aplica somente a tal parte da grid
                            if( appliesToHeader || defaultApplies){
                                context.applyStyleToAllRowsInColumnCustomProps(`MyGrid-header-column-${columnName}`, styleIsObject == true ? context._columnsStyle[columnName] : columnNameIterating);
                            }

                            if( appliesToBody || defaultApplies){
                                context.applyStyleToAllRowsInColumnCustomProps(`MyGrid-column-${columnName}`, styleIsObject == true ? context._columnsStyle[columnName] : columnNameIterating);
                            }

                        }
                    
                    });
                }

            }, 100 );
        }
    }

    //Update geral desta classe, antes de desenhar a grid
    context._updateGrid = function(){

        if( !context._directStyle['columns'] ){
            context._directStyle['columns'] = {};
        }

        //Aplica estilos dentro das definições de coluna
        Object.values(context.columnsConfig).forEach(function( columnDict ){
            if( !(context._config['columns'] instanceof Array) && !columnDict.name ){ throw '"columnDict" precisa ter o atributo name!' };
            if( columnDict.style ){
                context._columnsStyle[ columnDict.name ] = columnDict.style;
                context._directStyle['columns'][ columnDict.name ] = columnDict.style;

                //Atualiza os getters do ColumnManipulator
                if( context._columnsStyle[ columnDict.name ].createGettersFromOriginalProperties ){
                    context._columnsStyle[ columnDict.name ].createGettersFromOriginalProperties();
                }
            }
        });

    }

    context._afterUpdateGrid = function(){

        //Vincula os elementos da grid ao suas colunas
        Object.keys(context.columnsConfig).forEach(function( columnName ){
            context.columnsConfig[ columnName ].selfGrid = context;
            context.columnsConfig[ columnName ].elements = document.getElementsByClassName(`MyGrid-column-${columnName}`);
            context.columnsConfig[ columnName ].values = [... context.columnsConfig[ columnName ].elements].map( ( element )=>{ return element.innerText } );
        });

    }

    //Define a propriedade samples. Note isso vai sobrescrever o samples da grid
    context.setSamples = function(newSamples){
        const collectionToSet = newSamples._isSampleColletion ? newSamples : MyGrid.SampleCollection(newSamples);
        context.sampleCollection.setSamples(collectionToSet.samples);
        context.samples = context.sampleCollection.samples;
        context.redraw();
    }

    //Similar ao setSamples, porém não sobrescreve nada, apenas acrescenta
    context.addSamples = function(newSamples){
        const newSampleCollection = newSamples._isSampleColletion ? newSamples : MyGrid.SampleCollection(newSamples);
        context.sampleCollection.addSamples(newSampleCollection.samples);
        context.samples = context.sampleCollection.samples;

        //atualiza a grid
        context.redraw();
    }

    //Atualiza a Grid, redesenha
    context.redraw = function(){
        context._updateColumnsInstances();
        context._updateGrid();
        context.buildLayout();
        context.drawHtml();
        context._afterUpdateGrid();
    }

    context.getTitle = function(){
        return document.getElementById(context._writeTo).querySelector('.MyGrid-title').innerHTML.trim();
    }

    context.setTitle = function(newTitle){
        document.getElementById(context._writeTo).querySelector('.MyGrid-title').innerHTML = newTitle.trim();
        context._config.title = newTitle;
    }

    context.show = function(){
        document.getElementById(context._writeTo).style.visibility = 'visible';
        document.getElementById(context._writeTo).style.display = 'block';
    }

    context.hide = function(){
        document.getElementById(context._writeTo).style.visibility = 'hidden';
        document.getElementById(context._writeTo).style.display = 'none';
    }

    context.destroy = function(){
        document.getElementById( context._writeTo ).innerHTML = '';
    }

    context.getColumn = function(columnName){
        return context.columnsConfig[ columnName ];
    }

    context.getColumnElementAt = function(rowNumber, colNumber){
        return document.getElementsByClassName(`MyGrid-index-${rowNumber}-${colNumber}`)[0];
    }

    context.getRowElement = function(rowNumber){
        return document.getElementsByClassName(`MyGrid-row-${rowNumber}`)[0];
    }

    /**
    * Apaga uma coluna visualmente(não apaga da Collection, apenas da grid)
    * @property {object} columnName - nome da coluna a ser apagada
    */
    context.dropColumn = function(columnName){
        delete context.columnsConfig[ columnName ];

        if( context.columns[0] instanceof Object ){
            context.columns = context.columns.filter( (col)=>{ if(col.name != columnName) return col } );
        }else{
            context.columns = context.columns.filter( (col)=>{ if(col != columnName) return col } );
        }

        if( context._config['columns'][0] instanceof Object ){
            context._config['columns'] = context._config['columns'].filter( (col)=>{ if(col.name != columnName) return col } );
        }else{
            context._config['columns'] = context._config['columns'].filter( (col)=>{ if(col != columnName) return col } );
        }

        context.redraw(); 
    }

    if(context._autoRender){ 
        context.drawHtml();
    }

    context._updateGrid();
    context._afterUpdateGrid();

    return context;
}