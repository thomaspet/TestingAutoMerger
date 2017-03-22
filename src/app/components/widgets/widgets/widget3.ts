import {Component, Input} from '@angular/core';

@Component({
    selector: 'uni-widget-3',
    template: `widget3`
})
export class Widget3 {
    @Input()
    public config: any;

    constructor() {

    }

    public dummyWidgetInitFunction() {
        console.log('hello from widget init function!');
    }

}
