import {Component, ViewChildren, Input, Output, SimpleChange, EventEmitter} from 'angular2/core';
import {UniHttp} from '../../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";
import {BusinessRelationService} from "../../../services/services";

@Component({
    selector: 'external-search',
    templateUrl: 'app/components/common/externalSearch/externalSearch.html',
    providers: [BusinessRelationService]
})
export class ExternalSearch {
    @Input() searchText;
    @Input() useInternalSearchBox: Boolean;
    @Output() onSelect = new EventEmitter<any>();
    
    lastClickedName: string;
    showAllResults: boolean;
    
    private searchResult: any[];    
    private fullSearchResult: any[];
       
    constructor(private http: UniHttp, private businessRelationService: BusinessRelationService) {
        
    }    
    
    ngOnInit() {
        if (!this.useInternalSearchBox) {
            this.useInternalSearchBox = false;
        }
        
        this.showAllResults = false;        
        this.searchResult = [];
        this.fullSearchResult = [];
    }   
    
    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
                
        if (changes['searchText'] != null && this.lastClickedName != this.searchText && this.searchText !== '') {            
            this.businessRelationService
                    .search(this.searchText)
                    .subscribe(
                        (result) => {
                            this.fullSearchResult = result.Data.entries;
                            
                            if (this.showAllResults) {
                                this.searchResult = this.fullSearchResult;
                            } else {
                                //default display only first 4 searchresults
                                this.searchResult = this.fullSearchResult.slice(0, 4);
                            }                                                        
                        },
                        (err) => console.log('Feil ved søk:', err)
                    );               
        }        
    }
    
    selectItem(item: any) {
        this.lastClickedName = item.navn;
        
        this.onSelect.emit(item);
    }   
}

export class SearchResultItem {
    navn: string;
    orgnr: string;
    forretningsadr: string;
    forradrpostnr: string;
    forradrpoststed: string;    
    tlf: string;
    url: string;
}