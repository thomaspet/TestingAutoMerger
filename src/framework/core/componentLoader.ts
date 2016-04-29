import {
    Component, 
    EventEmitter, 
    DynamicComponentLoader, 
    ViewContainerRef, 
    ComponentRef, 
    Input,
    Output, 
    Type
} from 'angular2/core';

@Component({
    selector: 'uni-component-loader',
    template: '<div></div>',
})
export class UniComponentLoader {

    @Input()
    public type: Type;
    
    @Output()
    public onLoad: EventEmitter<any> = new EventEmitter<any>();
    
    public component: any;
    
    constructor(public container: ViewContainerRef , public dcl: DynamicComponentLoader) {

    }

    /**
     * Inits the object if parameters are passed
     * Nothing if component has no parameters
     */
    public ngOnInit() {
        if (this.type) {
            this.load(this.type);
        }
    }
    
    public load(type: Type) {
        var self = this;
        return this.dcl.loadNextToLocation(type, this.container).then((value: ComponentRef) => {    
            self.onLoad.emit(value.instance);
            self.component = value.instance;
            return value;
        });
    }
}
