import {Component, Input, AfterViewInit} from 'angular2/core';
import {CORE_DIRECTIVES, FormBuilder, Control, Validators} from 'angular2/common';

@Component({
	selector: 'test-form',
	template: `
		<form [ngFormModel]="form" (submit)="onSubmit()">
			<input ngControl="ssn" type="text"/>
			<button type="submit">Lagre</button>
		</form>
	`,
	directives: [CORE_DIRECTIVES]
})
export class TestForm implements AfterViewInit {
	@Input() model;
	@Input() onSubmit: Function;
	form;	
	
	constructor(public fb: FormBuilder) {}
	
	ngAfterViewInit() {
		this.form = this.fb.group({
			ssn: ["", Validators.required] //new Control(this.model.SocialSecurityNumber, Validators.required)
		});
	}
}