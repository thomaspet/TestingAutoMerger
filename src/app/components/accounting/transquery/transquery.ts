import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {UniTabs} from '../../layout/uniTabs/uniTabs';

@Component({
    selector: 'transquery',
    templateUrl: 'app/components/accounting/transquery/transquery.html',
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
export class Transquery {
}
