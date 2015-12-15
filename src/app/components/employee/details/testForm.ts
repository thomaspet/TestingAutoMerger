import {Component, Input, Output, EventEmitter, NgModel} from 'angular2/core';

Component({
	selector: 'test-form',
	template: `
		<form (submit)="onSubmit()">
			<input type="text" [(ngModel)]="model.SocialSecurityNumber">
		</form>
	`,
	host: {
		'[value]': 'model',
		'(input)': 'modelChange.next($event.target.value)'
	}
})
export class TestForm {
	@Input() model: any;
	@Output() modelChange: EventEmitter<any>;
	
	constructor() {
		this.modelChange = new EventEmitter<any>();
	}
	
	onSubmit() {
		this.modelChange.next(this.model);
	}	
	
}