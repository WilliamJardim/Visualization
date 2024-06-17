/*
 * File Name: GridComponent.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: WilliamJardim/Visualization © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/
if( !globalThis.MyGrid ){
    globalThis.MyGrid = {};
}

/*
* Cria a grid interna, ou seja, a classe que manipula as linhas e colunas, porém não cria uma representacao visual
* @param {object} config - configuracoes internas
*/
MyGrid.GridComponent = function(config={}){
    const context = AbstractClass(config);
    context._isGrid = true;
    context.objectName = 'GridComponent';
    context.sampleCollection = (config['samples'] || {})._isSampleColletion ? config['samples'] : MyGrid.SampleCollection(config['samples']);
    
    context.samples = context.sampleCollection.samples || [];

    return context;
}