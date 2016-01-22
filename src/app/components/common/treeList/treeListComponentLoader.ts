import {Component, Input, DynamicComponentLoader, ElementRef, OnInit} from 'angular2/core';
import {UniTable} from '../../../../framework/uniTable';

@Component({
    selector: 'tree-list-component-loader',
    template: '<div #content></div>',
    directives: [UniTable]
})

export class TreeListComponentLoader implements OnInit {
    
    @Input() config;
    compRef;

    constructor(public dynamicComponentLoader: DynamicComponentLoader, public elementRef: ElementRef) { }

    ngOnInit() {
        this.dynamicComponentLoader.loadIntoLocation(UniTable, this.elementRef, 'content')
            .then((comp) => {
                comp.instance.config = this.config;
            this.compRef = comp;
        });
    }
}