import {Component, ComponentFactoryResolver, ComponentFactory, ViewContainerRef, ComponentRef, Input, Output, EventEmitter, Type} from '@angular/core';

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
    public type: Type<any>;

    @Input()
    public loader: (cmp: ComponentRef<any>) => any | Promise<any> | void;

    @Input()
    public config: any;

    @Output()
    public onLoad: EventEmitter<any> = new EventEmitter<any>(true);

    public component: any;

    constructor(public container: ViewContainerRef, public resolver: ComponentFactoryResolver) {

    }

    /**
     * Inits the object if parameters are passed
     * Nothing if component has no parameters
     */
    public ngOnInit() {
        let factory: ComponentFactory<any> = this.resolver.resolveComponentFactory(this.type);
        let component: ComponentRef<any> = this.container.createComponent(factory);
        component.instance.config = this.config || {};
        this.component = component.instance;
        this.onLoad.emit(component.instance);
    }

    load(component: Type<any>) {
        let factory: ComponentFactory<any> = this.resolver.resolveComponentFactory(component);
        let cmp: ComponentRef<any> = this.container.createComponent(factory);
        return cmp;
    }

}
