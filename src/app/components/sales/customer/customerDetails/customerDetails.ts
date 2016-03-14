import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

@Component({
    selector: "customer-details",
    templateUrl: "app/components/sales/customer/customerDetails/customerDetails.html"
})
export class CustomerDetails {
        
    constructor() {
    }
    
    ngOnInit() {
    }           
}