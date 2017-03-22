import {Component, Input} from '@angular/core';

@Component({
    selector: 'uni-widget-2',
    template: `widget2`
})
export class Widget2 {
    @Input()
    public config: any;

    constructor() {

    }

    public dummyWidgetInitFunction() {
        console.log('hello from widget init function!');
    }

}
