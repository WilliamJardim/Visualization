/*
 * File Name: SampleCollection.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: WilliamJardim/Visualization © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/

if( !globalThis.MyGrid ){
    globalThis.MyGrid = {};
}

/*
* Coleção de amostras
* @param {array} sampleArray - contem a lista de amostras(classe Sample)
* @param {object} config - configuracoes internas
*
* Exemplo de uso:
*   var vector = MyGrid.SampleCollection([ {x:10, y:15}, {x:22, y:44} ])
*
*/
MyGrid.SampleCollection = function(sampleArray=[], config={}){
    const context = AbstractClass(config);
    context._isSampleColletion = true;
    context._sampleArray = sampleArray;
    context.objectName = 'SampleCollection';
    context.samples = [];

    //Transforma os registros do sampleArray em objetos manipulaveis MyGrid.Sample
    for( let i = 0 ; i < sampleArray.length ; i++ )
    {   
        context.samples.push( sampleArray[i]._isSample ? sampleArray[i] : MyGrid.Sample( sampleArray[i], {} ) );
    }

    //Métodos
    context.getSamples = function(){
        return context.samples;
    }

    //Sobrescreve a propriedade samples
    context.setSamples = function(newSamples){
        context.samples = newSamples;
    }

    //Adiciona uma nova amostra ao sample collection
    context.addSample = function(newSample){
        const sampleToAdd = newSample._isSample ? newSample : MyGrid.Sample( newSample );
        context.samples.push( sampleToAdd )
    }

    //Adiciona N novas amostras ao SampleCollection
    context.addSamples = function(newSamples){
        const addList = newSamples._isSampleColletion ? newSamples.samples : MyGrid.SampleCollection( newSamples );

        for( let i = 0 ; i < addList.samples.length ; i++ ){
            context.samples.push( addList.samples[i] )
        }
    }

    return context;
}