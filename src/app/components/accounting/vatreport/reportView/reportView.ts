import {Component, OnInit} from '@angular/core';
import {RouteParams} from '@angular/router-deprecated';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Rx';

@Component({
    selector: 'vatreport-report-view',
    templateUrl: 'app/components/accounting/vatreport/reportView/reportView.html',
    directives: [],
    providers: []
})
export class VatReportView implements OnInit {

    constructor(private routeParams: RouteParams) {
    }

    public ngOnInit() {
    }
}
