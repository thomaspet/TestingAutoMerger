import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { SalaryBalanceLineComponent } from '../salary-balance-line/salary-balance-line.component';

@Component({
  selector: 'uni-salary-balance-line-modal',
  templateUrl: './salary-balance-line-modal.component.html',
  styleUrls: ['./salary-balance-line-modal.component.sass']
})

export class SalaryBalanceLineModalComponent implements OnInit, IUniModal {
        @Input() public options: IModalOptions;
        @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
        @ViewChild(SalaryBalanceLineComponent, { static: true }) public salaryBalanceLine: SalaryBalanceLineComponent;
        constructor() { }

        public ngOnInit() { }

        public close(needsUpdate = false) {
            this.onClose.next(needsUpdate);
        }

        public saveSalaryBalanceLine() {
            this.salaryBalanceLine.saveSalaryBalanceLine();
        }
    }
