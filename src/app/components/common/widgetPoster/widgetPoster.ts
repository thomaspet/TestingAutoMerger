import {Component, Input} from 'angular2/core';

@Component({
	selector: 'uni-widget-poster',
	templateUrl: 'app/components/common/widgetPoster/widgetPoster.html'
})
export class WidgetPoster {
	@Input() model: any;
	
	constructor() {	}
}
