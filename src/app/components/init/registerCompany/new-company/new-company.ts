import {Component, Input, ViewChild, ElementRef} from '@angular/core';

@Component({
    selector: 'init-new-company',
    templateUrl: './new-company.html',
    styleUrls: ['./new-company.sass']
})
export class NewCompany {
    @Input() contractID: number;
    @Input() isTest: boolean;

    orgNumber: string;
    contractActivated: boolean;

    onContractActivated(orgNumber: string) {
        this.orgNumber = orgNumber;
        this.contractActivated = true;
    }
}
