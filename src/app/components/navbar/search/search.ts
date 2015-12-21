import {Component, AfterViewInit, ElementRef} from 'angular2/core';
import {Router} from 'angular2/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

declare var jQuery;

@Component({
    selector: 'uni-navbar-search',
    templateUrl: 'app/components/navbar/search/search.html',
})
export class NavbarSearch implements AfterViewInit {
    ctrlKeyHold: boolean;
    autocompleteConfig: kendo.ui.AutoCompleteOptions;
    
    mockData = [
        { id: "1", name: 'Dashboard', url: '/' },
        { id: "2", name: 'Kitchensink', url: '/kitchensink' },
        { id: "3", name: 'LoginRoute', url: '/login' },
        { id: "4", name: 'UniFormDemo', url: '/uniformdemo' }
    ];

    constructor(private elementRef: ElementRef, public router: Router) {
        this.autocompleteConfig = {
            dataTextField: 'name',
            placeholder: 'Søk etter tema eller funksjon',
            highlightFirst: true,
            dataSource: this.mockData,
            select: (event: kendo.ui.AutoCompleteSelectEvent) => {
                var item: any = event.item;
                var dataItem = event.sender.dataItem(item.index());
                this.onAutoCompleteSelected(dataItem);
            },
            change: (event: kendo.ui.AutoCompleteChangeEvent) => {
                event.sender.value('');
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
        this.router.navigateByUrl(value.url);
    }
	
	ngAfterViewInit() {
        var element = jQuery(this.elementRef.nativeElement).find('input').first();
	    element.kendoAutoComplete(this.autocompleteConfig).data('kendoAutoComplete');
    }
	
}