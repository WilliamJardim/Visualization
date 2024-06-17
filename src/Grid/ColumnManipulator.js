/*
 * File Name: ColumnManipulator.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: WilliamJardim/Visualization © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/

if( !globalThis.MyGrid ){
    globalThis.MyGrid = {};
}

MyGrid.ColumnManipulator = function(attributes={}){
    const context = AbstractClass(attributes);
    context.objectName = 'ColumnManipulator';
    context.globalClassSelector = `MyGrid-global-column-${context.name}`;

    //Cria os getters e setters
    context.createGettersFromOriginalProperties();
    context.createSettersFromOriginalProperties();

    context.setStyle = function(style){
        if( !context.style || !context.selfGrid ){ return };
        Object.keys(style).forEach( (item)=>{
            context.style[ item ] = style[ item ];
        } );
        context.selfGrid.redraw();
    }

    context.overrideStyle = function(style){
        context.style = style;
        context.selfGrid.redraw();
    }

    context.drop = function(){
        context.selfGrid.dropColumn(context.name);
    }

    context.hide = function(){
        [...document.getElementsByClassName(context.globalClassSelector)].forEach( function(element){
            element.style.visibility = 'hidden';
            element.style.display = 'none';
        } );
    }

    context.show = function(){
        if( !context.style || !context.selfGrid ){ return };
        [...document.getElementsByClassName(context.globalClassSelector)].forEach( function(element){
            element.style.visibility = 'visible';
            element.style.display = 'block';
        } );
        context.selfGrid.redraw();
    }

    return context;
}