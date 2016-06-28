import {Component, AfterViewInit, ElementRef, ViewChild, Renderer} from '@angular/core';
import {Control} from '@angular/common';
import {Router} from '@angular/router-deprecated';
import {UniHttp} from '../../../../../framework/core/http/http';
import {HamburgerMenu} from '../hamburgerMenu/hamburgerMenu';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

@Component({
    selector: 'uni-navbar-search',
    templateUrl: 'app/components/layout/navbar/search/search.html',
})
export class NavbarSearch implements AfterViewInit {
    @ViewChild('searchInput')
    private inputElement: ElementRef;

    @ViewChild('resultList')
    private listElement: ElementRef;

    private inputControl: Control = new Control('');
    private searchResults: any[] = [];
    private isExpanded: boolean = false;
    private selectedIndex: number;
    private focusPositionTop: number = 0;
    private componentLookupSource: {componentName: string, componentUrl: string}[] = [];

    constructor(private http: UniHttp, public router: Router, private renderer: Renderer) {
        let componentSections = HamburgerMenu.getAvailableComponents();
        componentSections.forEach((section) => {
            this.componentLookupSource.push(...section.componentList);
        });
    }

    public ngAfterViewInit() {        
        Observable.fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
            if (event.ctrlKey && (event.keyCode === 32 || event.keyCode === 36)) {
                event.preventDefault();
                this.renderer.invokeElementMethod(this.inputElement.nativeElement, 'focus', []);
            }
        });

        this.inputControl.valueChanges.subscribe((inputValue) => {
            this.isExpanded = false;
            this.selectedIndex = 0;
            let query = inputValue.toLowerCase();
            
            // TODO: This should be reworked after 30.6
            if (query.indexOf('faktura ') === 0) {
                //this.invoiceLookup(query.slice(8));
                this.TOFLookup(query.slice(8), 'invoice');
            } else if (query.indexOf('ordre ') === 0) {
                this.TOFLookup(query.slice(6), 'order');
            } else if (query.indexOf('tilbud ') === 0) {
                this.TOFLookup(query.slice(7), 'quote');
            } else {
                this.componentLookup(query);
            }
        });
    }

    private onMouseover(index) {
        if (index < this.selectedIndex) {
            for (let i = index; i < this.selectedIndex; i++) {
                this.focusPositionTop -= this.listElement.nativeElement.children[i].clientHeight; 
            }
        } else if (index > this.selectedIndex) {
            for (let i = this.selectedIndex; i < index; i++) {
                this.focusPositionTop += this.listElement.nativeElement.children[i].clientHeight;
            }
        }
        this.selectedIndex = index;
    }

    private onKeyDown(event) {
        var prevItem = undefined;
        var currItem = undefined;
        var overflow = 0;

        switch (event.keyCode) {
            case 13:
                this.confirmSelection();
            break;
            case 27:
                this.close();
            break;
            case 38:
                if (this.selectedIndex !== 0) {
                    this.selectedIndex--;

                    currItem = this.listElement.nativeElement.children[this.selectedIndex];
                    if (currItem) {
                        this.focusPositionTop -= currItem.clientHeight;
                        overflow = this.focusPositionTop - this.listElement.nativeElement.scrollTop;

                        if (overflow < 0) {
                            this.listElement.nativeElement.scrollTop += overflow;
                        }
                    }
                }
            break;
            case 40:
                if (this.selectedIndex !== (this.searchResults.length - 1)) {
                    this.selectedIndex++;
                }

                prevItem = this.listElement.nativeElement.children[this.selectedIndex - 1];
                currItem = this.listElement.nativeElement.children[this.selectedIndex];
                if (!currItem) { return; }
                overflow = (this.focusPositionTop + currItem.clientHeight)
                           - (this.listElement.nativeElement.clientHeight + this.listElement.nativeElement.scrollTop);
                        
                if (overflow > 0) {
                    this.listElement.nativeElement.scrollTop += overflow;
                }
            break;
        }
    }

    private confirmSelection() {
        if (!this.searchResults[this.selectedIndex]) { return; }
        const url = this.searchResults[this.selectedIndex].componentUrl;
        this.close();
        this.router.navigateByUrl(url);
    }

    private close() {
        setTimeout(() => {
            this.focusPositionTop = 0;
            this.searchResults = [];
            this.inputControl.updateValue('', { emitEvent: false });
            this.isExpanded = false;
            this.renderer.invokeElementMethod(this.inputElement.nativeElement, 'blur', []);
        }, 120)
                
    }

    private componentLookup(query: string) {
        let results = [];

        this.componentLookupSource.forEach((component) => {
            if (component.componentName.toLocaleLowerCase().indexOf(query) !== -1) {
                results.push(component);
            }
        });
        this.searchResults = results;
        this.isExpanded = true;
    }

    private invoiceLookup(query: string) {
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(`invoices?top=20&filter=contains(InvoiceNumber,'${query}') or contains(CustomerName,'${query}')`)
            .send()
            .subscribe((response) => {
                let results = [];
                response.forEach((invoice) => {
                    results.push({
                        componentName: invoice.InvoiceNumber + ' - ' + invoice.CustomerName,
                        componentUrl: '/sales/invoice/details/' + invoice.ID
                    });
                });
                this.searchResults = results;
                this.isExpanded = true;
            });
    }

    private TOFLookup(query: string, module: string) {
        var tofString = module.charAt(0).toUpperCase() + module.slice(1) + "Number";
        this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(module.toLowerCase() + `s?top=20&filter=contains(` + tofString + `,'${query}') or contains(CustomerName,'${query}')`)
            .send()
            .subscribe(
                (response) => {
                    let results = [];
                    
                    response.forEach((tof) => {
                        if (tof[tofString] === null) { tof[tofString] = 'Kladd ' + tof.ID }
                        results.push({
                            componentName: tof[tofString] + ' - ' + tof.CustomerName,
                            componentUrl: '/sales/' + module + '/details/' + tof.ID
                        });
                    });
                    this.searchResults = results;
                    this.isExpanded = true;
                },
                (error) => { }
            )
    }
}
