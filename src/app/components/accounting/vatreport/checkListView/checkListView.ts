import {Component, OnInit} from '@angular/core';
import {RouteParams} from '@angular/router-deprecated';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Rx';

@Component({
    selector: 'vatreport-checklist-view',
    templateUrl: 'app/components/accounting/vatreport/checkListView/checkListView.html',
    directives: [],
    providers: []
})
export class VatCheckListView implements OnInit {

    constructor(private routeParams: RouteParams) {
    }

    public ngOnInit() {
    }
}
