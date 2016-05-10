import {Component, Input} from "@angular/core";

@Component({
    selector: "uni-widget-poster",
    templateUrl: "framework/widgetPoster/widgetPoster.html"
})
export class WidgetPoster {
    @Input()
    model: any;

    constructor() {
    }
}
