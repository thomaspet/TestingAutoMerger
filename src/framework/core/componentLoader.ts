import {Component, DynamicComponentLoader, ViewContainerRef, ComponentRef, Input, Output, EventEmitter} from '@angular/core';

/**
 * Component Loader
 *
 * It loads a component dinamically
 *
 * @Inputs
 *
 * type?: Type => Type (Class) of the element we want to load
 * loader?: (component:ComponentRef<any>) => any|Promise<any>
 *      function that manages the component once is loaded
 * config?: any => Configuration object for the component
 */
@Component({
    selector: 'uni-component-loader',
    template: '<div></div>',
})
export class UniComponentLoader {

    @Input()
    public type: any;

    @Input()
    public loader: (cmp: ComponentRef<any>) => any | Promise<any> | void;

    @Input()
    public config: any;

    @Output()
    public onLoad: EventEmitter<any> = new EventEmitter<any>(true);

    public component: any;

    constructor(public container: ViewContainerRef, public dcl: DynamicComponentLoader) {

    }

    /**
     * Inits the object if parameters are passed
     * Nothing if component has no parameters
     */
    public ngOnInit() {
        var self = this;
        if (this.type && this.loader) {
            this.load(this.type).then(this.loader).then((cmp) => { this.onLoad.emit(cmp); });
        } else if (this.type && this.config) {
            this.dcl.loadNextToLocation(this.type, this.container)
                .then((cmp: ComponentRef<any>) => {
                    cmp.instance.config = self.config;
                    self.component = cmp.instance;
                    self.onLoad.emit(cmp.instance);
                    return cmp;
                });
        } else if (this.type) {
            this.dcl.loadNextToLocation(this.type, this.container).then((cmp: ComponentRef<any>) => {
                self.component = cmp.instance;
                self.onLoad.emit(cmp.instance);
                return cmp;
            });
        }
    }

    /**
     * It returns a promise with the component we want to load
     *
     * @param type Element we want to load
     * @param loader Function that can manage the component loaded
     * @returns {any} (optional) it can return nothing or a promise
     */
    public load(type: any) {
        var self = this;
        return this.dcl.loadNextToLocation(type, this.container).then((cmp: ComponentRef<any>) => {
            self.component = cmp.instance;
            self.onLoad.emit(cmp.instance);
            return cmp;
        });
    }
}
