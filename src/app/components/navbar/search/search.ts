import {Component, AfterViewInit, ElementRef} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import {Autocomplete, AutocompleteConfig} from '../../../../framework/controls/autocomplete/autocomplete';
import {Router} from 'angular2/router';
declare var jQuery;

@Component({
    selector: 'uni-navbar-search',
    templateUrl: 'app/components/navbar/search/search.html',
    directives: [Autocomplete]
})
export class NavbarSearch implements AfterViewInit {
    ctrlKeyHold: boolean;
    autocompleteConfig: AutocompleteConfig;

    mockData = [
        { id: "1", name: 'Dashboard', url: '/' },
        { id: "2", name: 'Kitchensink', url: '/kitchensink' },
        { id: "3", name: 'LoginRoute', url: '/login' },
        { id: "4", name: 'UniFormDemo', url: '/uniformdemo' }

    ];

    constructor(private elementRef: ElementRef, public router: Router) {

        this.autocompleteConfig = {
            onSelect: (event, value) => {
                this.onAutoCompleteSelected(value);
            },
            clearOnSelect: true,
            kOptions: {
                dataTextField: 'name',
                placeholder: 'Søk etter tema eller funksjon',
                dataSource: new kendo.data.DataSource({
                    data: this.mockData
                })
            }
        }

        Observable.fromEvent(document, 'keydown')
            .subscribe((event: any) => {
                if (event.keyCode === 17)
                    this.ctrlKeyHold = true;

                if (event.keyCode === 32 && this.ctrlKeyHold) {
                    event.preventDefault();
                    jQuery("#navbar_search_field").focus();
                }
            });

        Observable.fromEvent(document, 'keyup')
            .subscribe((event: any) => {
                if (event.keyCode === 17)
                    this.ctrlKeyHold = false;
            });

    }

    onAutoCompleteSelected(value) {
        jQuery("#navbar_search_field").val("");
        this.router.navigateByUrl(value.url);
    }
	
	ngAfterViewInit() {
		console.log(this.elementRef.nativeElement);		
		
	}
	
}