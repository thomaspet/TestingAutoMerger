import {Component, AfterViewInit, ElementRef} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';

import {HamburgerMenu} from '../hamburgerMenu/hamburgerMenu';
import 'rxjs/add/observable/fromEvent';

declare var jQuery;

@Component({
    selector: 'uni-navbar-search',
    templateUrl: 'app/components/layout/navbar/search/search.html',
})
export class NavbarSearch implements AfterViewInit {
    private ctrlKeyHold: boolean;
    private autocompleteConfig: kendo.ui.AutoCompleteOptions;
    private autocompleteElement: any;

    private componentLookupSource: {componentName: string, componentUrl: string}[] = [];

    constructor(private elementRef: ElementRef, public router: Router) {
        let componentSections = HamburgerMenu.getAvailableComponents();
        componentSections.forEach((section) => {
            this.componentLookupSource.push(...section.componentList);
        });

        this.autocompleteConfig = {
            dataTextField: 'componentName',
            placeholder: 'Søk etter tema eller funksjon',
            highlightFirst: true,
            dataSource: this.componentLookupSource,
            select: (event: kendo.ui.AutoCompleteSelectEvent) => {
                var item: any = event.item;
                var dataItem = event.sender.dataItem(item.index());
                this.onComponentSelected(dataItem);
            },
            change: (event: kendo.ui.AutoCompleteChangeEvent) => {
                event.sender.value('');
            }
        };

        Observable.fromEvent(document, 'keydown')
            .subscribe((event: any) => {
                if (event.keyCode === 17) {
                    this.ctrlKeyHold = true;
                }
                if (event.keyCode === 32 && this.ctrlKeyHold) {
                    event.preventDefault();
                    jQuery(this.autocompleteElement).focus();
                }
            });

        Observable.fromEvent(document, 'keyup')
            .subscribe((event: any) => {
                if (event.keyCode === 17) {
                    this.ctrlKeyHold = false;
                }
            });

    }

    public ngAfterViewInit() {
        var element = jQuery(this.elementRef.nativeElement).find('input').first();
        this.autocompleteElement = element.kendoAutoComplete(this.autocompleteConfig).data('kendoAutoComplete');
    }


    private onComponentSelected(selectedComponent: any) {
        this.router.navigateByUrl(selectedComponent.componentUrl);
    }

}
