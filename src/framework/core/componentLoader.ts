import {Component,DynamicComponentLoader, ElementRef, ComponentRef, Input, Type} from 'angular2/core';


/**
 * Component Loader
 *
 * It loads a component dinamically
 *
 * @Inputs
 *
 * type?: Type => Type (Class) of the element we want to load
 * loader?: (component:ComponentRef) => any|Promise<any> = function that manages the component once is loaded
 * config?: any => Configuration object for the component
 */
@Component({
    selector: 'uni-component-loader',
    inputs: ['type', 'loader', 'config'],
    template: '<div #content></div>',
})
export class UniComponentLoader {

    @Input()
    type: Type;

    @Input()
    loader: (cmp: ComponentRef)=>any|Promise<any>|void;

    @Input()
    config: any;

    constructor(public element: ElementRef, public dcl: DynamicComponentLoader) {

    }

    /**
     * Inits the object if parameters are passed
     * Nothing if component has no parameters
     */
    ngOnInit() {
        var self = this;
        if (this.type && this.loader) {
            this.load(this.type).then(this.loader);
        } else if (this.type && this.config) {
            this.dcl.loadIntoLocation(this.type, this.element, 'content').then((cmp: ComponentRef) => {
                cmp.instance.config = self.config;
                return cmp;
            });
        } else if (this.type) {
            this.dcl.loadIntoLocation(this.type, this.element, 'content');
        }
    }


    /**
     * It returns a promise with the component we want to load
     *
     * @param type Element we want to load
     * @param loader Function that can manage the component loaded
     * @returns {any} (optional) it can return nothing or a promise
     */
    load(type: Type) {
        return this.dcl.loadIntoLocation(type, this.element, 'content');
    }
}
