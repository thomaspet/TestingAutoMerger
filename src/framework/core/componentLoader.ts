import {Component,DynamicComponentLoader, ElementRef, ComponentRef, Input, Type} from 'angular2/core';

declare var _;

@Component({
    selector:'uni-component-loader',
    inputs: ['type','loader','config'],
    template: '<div #content></div>',
})
export class UniComponentLoader {
    @Input() type: Type;
    @Input() loader: any;
    @Input() config: any;
    constructor(public element: ElementRef, public dcl: DynamicComponentLoader) {

    }

    ngOnInit() {
        var self = this;
        if (this.type && this.loader) {
            this.load(this.type,this.loader)
        } else if (this.type && this.config) {
            this.dcl.loadIntoLocation(this.type,this.element,'content').then((cmp:ComponentRef) => {
                cmp.instance.config = self.config;
            });
        }
    }

    load(type: Type,loader?: any) {
        var p = this.dcl.loadIntoLocation(type,this.element,'content');
        if (loader) {
            return p.then(loader);
        }
        return p;
    }
}
