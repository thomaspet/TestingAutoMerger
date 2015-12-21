import {Component, Input, AfterViewInit} from 'angular2/core';

@Component({
	selector: 'uni-widget-poster',
	templateUrl: 'app/components/common/widgetPoster/widgetPoster.html'
})
export class WidgetPoster implements AfterViewInit {
	@Input() model: any;
	
	constructor() {	}
	
	ngAfterViewInit() {
		console.log('===================');
		console.log('WidgetPoster model');
		console.log(this.model);
		console.log('===================');
	}
}
