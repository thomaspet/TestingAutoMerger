import {Component,DynamicComponentLoader, ElementRef, Input} from 'angular2/core';

@Component({
    selector:'uni-component-loader',
    template: '<div #content></div>',
})
export class UniComponentLoader {
    constructor(public element: ElementRef, public dcl: DynamicComponentLoader) {

    }

    load(type,loader) {
        this.dcl.loadIntoLocation(type,this.element,'content').then(loader);
    }
}
