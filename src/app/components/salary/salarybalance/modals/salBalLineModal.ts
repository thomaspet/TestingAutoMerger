import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {SalarybalanceLine} from '../salarybalanceLine';

@Component({
    selector: 'salary-balance-line-modal',
    templateUrl: './salBalLineModal.html'
})

export class SalaryBalanceLineModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild(SalarybalanceLine, { static: true }) public salaryBalanceLine: SalarybalanceLine;
    constructor() { }

    public ngOnInit() { }

    public close(needsUpdate = false) {
        this.onClose.next(needsUpdate);
    }

    public saveSalaryBalanceLine() {
        this.salaryBalanceLine.saveSalaryBalanceLine();
    }
}
