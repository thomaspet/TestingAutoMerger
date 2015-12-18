import {Component, AfterViewInit, ElementRef} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

@Component({
	selector: 'uni-navbar-search',
	templateUrl: 'app/components/navbar/search/search.html'
})
export class NavbarSearch implements AfterViewInit {
	ctrlKeyHold: boolean;
	
	constructor(private elementRef: ElementRef) {
		
		Observable.fromEvent(document, 'keydown')
		.subscribe((event: any) => {
			if (event.keyCode === 17)
				this.ctrlKeyHold = true;
				
			if (event.keyCode === 32 && this.ctrlKeyHold) {
				event.preventDefault();
				console.log('global search');
			}						
		});
		
		Observable.fromEvent(document, 'keyup')
		.subscribe((event: any) => {
			if (event.keyCode === 17) 
				this.ctrlKeyHold = false;
		});
	
	}
	
	ngAfterViewInit() {
		console.log(this.elementRef.nativeElement);		
		
	}
	
}