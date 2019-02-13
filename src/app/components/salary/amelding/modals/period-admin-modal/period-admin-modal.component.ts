import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { IUniTab } from '@app/components/layout/uniTabs/uniTabs';

@Component({
  selector: 'uni-period-admin-modal',
  templateUrl: './period-admin-modal.component.html',
  styleUrls: ['./period-admin-modal.component.sass']
})
export class PeriodAdminModalComponent implements OnInit, IUniModal {
  @Input() public options: IModalOptions;
  @Output() public onClose: EventEmitter<any> = new EventEmitter();
  public tabs: IUniTab[];
  public activeTabIndex: number = 0;

  constructor() {
    this.tabs = [
      {name: 'A-meldinger', tooltip: 'Viser oversikt over a-meldinger i perioden'},
      {name: 'Lønnsavregninger', tooltip: 'Viser liste over alle lønnsavregninger med utbetalingsdato i gitt periode'}
    ];
   }

  public ngOnInit() {
  }

  public closeModal() {
    this.onClose.next({});
  }

}
