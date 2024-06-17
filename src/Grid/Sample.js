/*
 * File Name: Sample.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: WilliamJardim/Visualization © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/

if( !globalThis.MyGrid ){
    globalThis.MyGrid = {};
}

/*
* Cria uma amostra da tabela
* @param {object} featuresDict - contem as features da amostra
* @param {object} config - configuracoes internas
*/
MyGrid.Sample = function(featuresDict={}, config={}){
    const context = AbstractClass(config);
    context._isSample = true;
    context.objectName = 'Sample';
    context.sampleData = featuresDict;

    //Métodos
    context.getColumnValue = function(columnName){
        return context.sampleData[columnName];
    }
    context.setColumnValue = function(columnName, columnNewValue){
        context.sampleData[columnName] = columnNewValue;
    }
    context.getData = function(){
        return this.sampleData;
    }

    return context;
}