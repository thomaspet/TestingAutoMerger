import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SalaryTransaction } from '@uni-entities';
import { UniModalService } from '@uni-framework/uni-modal';
import { NegativeSalaryModalComponent } from './negative-salary-modal/negative-salary-modal.component';

@Component({
  selector: 'uni-negative-salary',
  templateUrl: './negative-salary.component.html',
  styleUrls: ['./negative-salary.component.sass']
})
export class NegativeSalaryComponent implements OnInit {
    @Input() payrollRunID: Number;
    @Input() salaryTransactionCount: number;

    public salaryTransactions: SalaryTransaction[];

    public WARNINGTEXT: string = 'Det vil bli autogenererte forskudd';

    constructor(private modalService: UniModalService) { }

    ngOnInit() {
    }

    public openNegativeSalaryModal() {
        this.modalService.open(NegativeSalaryModalComponent, {
            data: this.payrollRunID,
            closeOnClickOutside: true,
        });
    }
}
