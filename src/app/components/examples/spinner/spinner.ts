import {Component, Attribute, OnInit, ViewChild} from "angular2/core";
import {Http} from "angular2/http";
import {UniSpinner} from "../../../../framework/spinner/spinner";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/merge";
import {EmployeeDS} from "../../../../framework/data/employee";

@Component({
    selector: "spinner-example",
    directives: [UniSpinner],
    providers: [EmployeeDS],
    template: `
        <uni-spinner [waitFor]="sharedObservable">
            <h1>hello, it's me!</h1>
            <button (click)="refresh()"></button>
        </uni-spinner>
    `
})
export class SpinnerExample implements OnInit {

    @ViewChild(UniSpinner)
    spinner: UniSpinner;

    sharedObservable: any;

    constructor(public employeeDS: EmployeeDS) {

    }

    ngOnInit() {
        this.sharedObservable = Observable.forkJoin(
            this.employeeDS.get(1),
            this.employeeDS.layout("EmployeePersonalDetailsForm")
        ).share();
        this.sharedObservable.subscribe((response: any) => {
            console.log(response);
        });
    }

    refresh() {
        this.ngOnInit();
        this.spinner.refresh();
    }
}

