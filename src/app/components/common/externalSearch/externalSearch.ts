import {Component, ViewChildren, Input, Output, EventEmitter} from 'angular2/core';
import {UniHttp} from '../../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'external-search',
    templateUrl: 'app/components/common/externalSearch/externalSearch.html'
})
export class ExternalSearch {
    @Input() searchText;
    @Input() useInternalSearchBox: Boolean;
    @Output() onSelect = new EventEmitter<any>();
    
    private searchResult: any[];    
       
    constructor(private http: UniHttp) {
        
    }    
    
    ngOnInit() {
        if (!this.useInternalSearchBox) {
            this.useInternalSearchBox = false;
        }
        
        this.searchResult = [{Name: "Kjetils testfirma", OrgNo: "123456789", ZipCode: "5518", City: "Haugesund"}, {Name: "Tronds testfirma", OrgNo: "234567890", ZipCode: "5545", City: "Vormedal"}];
    }      
}

export class SearchResultItem {
    Name: string;
    OrgNo: string;
    Address: string;
    ZipCode: string;
    City: string;
    Email: string;
    Phone: string;
}