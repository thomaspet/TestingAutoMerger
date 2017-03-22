import {Component, Input} from '@angular/core';

@Component({
    selector: 'uni-widget-1',
    template: `widget1`
})
export class Widget1 {
    @Input()
    public config: any;

    constructor() {

    }

    public dummyWidgetInitFunction() {
        console.log('hello from widget init function!');
    }

}
