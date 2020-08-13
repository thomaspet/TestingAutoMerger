import { Component, OnInit, ViewChild } from '@angular/core';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { TravelType, WageType, Account  } from '@uni-entities';

import { WageTypeService } from '@app/services/salaryServicesModule';
import { ErrorService } from '@app/services/common/errorService';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { IUniSaveAction } from '@uni-framework/save/save';
import { Observable, forkJoin, BehaviorSubject } from 'rxjs';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { StatisticsService } from '@app/services/services';
import { TravelTypeService } from '@app/components/salary/travel/shared/service/travel-type.service';

const INVOICE_ACCOUNT_FIELD = '_InvoiceAccount';
const WAGETYPE_FIELD = '_WageTypeNumber';
const DIRTY_FIELD = '_isDirty';

@Component({
  selector: 'uni-traveltype',
  templateUrl: './travel-type.component.html',
  styleUrls: ['./travel-type.component.sass']
})
export class TravelTypeComponent implements OnInit  {
  public busy: boolean;
  @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;
  public model$: BehaviorSubject<TravelType[]> = new BehaviorSubject([]);
  public travelTable: UniTableConfig;
  public saveActions: IUniSaveAction[] = [{
    action: this.save.bind(this),
    disabled: true,
    label: 'Lagre',
    main: true
}];
  private wagetypes: WageType[] = [];
  public traveltypes: TravelType[] = [];

  constructor(
    private errorService: ErrorService,
    private tabService: TabService,
    private travelService: TravelTypeService,
    private wagetypeService: WageTypeService,
    private modalService: UniModalService,
    private statisticsService: StatisticsService,
  ) {
  }

  ngOnInit() {
    this.tabService.addTab({
      moduleID: UniModules.TravelType,
      url: 'salary/traveltypes',
      name: 'Reisetyper'
    });


    forkJoin(
        this.wagetypeService.getOrderByWageTypeNumber(),
        this.travelService.GetAll('')
    )
    .finally(() => this.busy = false)
    .catch((err, obser) => this.errorService.handleRxCatch(err, obser))
    .subscribe(([wt, tt]) => {
      this.wagetypes = wt;
      this.traveltypes = tt;
    });

    this.createConfig();
  }

  private getModel() {
    this.busy = true;
    this.travelService.invalidateCache();
    this.travelService.GetAll('TravelType')
    .finally(() => this.busy = false)
    .catch((err, obser) => this.errorService.handleRxCatch(err, obser))
    .subscribe(rec => this.model$.next(rec));
}

    createConfig() {
        const foreignTypeColumn = new UniTableColumn('ForeignTypeID', 'ReiseType', UniTableColumnType.Text)
            .setWidth('10rem')
            .setEditable(false);

        const foreignDescriptionColumn = new UniTableColumn('ForeignDescription', 'Beskrivelse',  UniTableColumnType.Text)
            .setEditable(false);

        const wageTypeColumn = new UniTableColumn(WAGETYPE_FIELD, 'Lønnsart', UniTableColumnType.Lookup)
            .setTemplate((row) => {
                let wtnumber = row[WAGETYPE_FIELD];
                if (row['WageTypeNumber']) {
                    wtnumber = this.wagetypes.find(wt => wt.WageTypeNumber === row.WageTypeNumber);
                } else { return ''; }
                return (wtnumber) ? wtnumber.WageTypeNumber + ' - ' + wtnumber.WageTypeName : '';
            })
            .setDisplayField('WageTypeNumber')
            .setOptions({
            itemTemplate: (selectedItem: WageType) => {
                return (selectedItem.WageTypeNumber + ' - ' + selectedItem.WageTypeName);
            },
            lookupFunction: (searchVal) => {
                return this.wagetypes.filter((wagetype) => {
                if (isNaN(searchVal)) {
                    return (wagetype.WageTypeName.toLowerCase().indexOf(searchVal) > -1);
                }   else {
                    return wagetype.WageTypeNumber.toString().startsWith(searchVal.toString()); }
                });
            }});
            // .setWidth('50rem');

        const invoiceAccountColumn = new UniTableColumn(INVOICE_ACCOUNT_FIELD, 'Hovedbokskonto(utlegg)', UniTableColumnType.Lookup)
            .setDisplayField('InvoiceAccount')
            .setOptions({
                itemTemplate: ((item: Account) => (item ? `${item.AccountNumber} - ${item.AccountName}` : '')),
                lookupFunction: (query) => this.statisticsService
                    .GetAllUnwrapped(
                        'select=AccountNumber as AccountNumber,AccountName as AccountName'
                        + '&model=Account'
                        + `&filter=contains(AccountName,'${query}') `
                        + `or startswith(AccountNumber,'${query}')`
                        + `&top=50`
                    )
            });

        this.travelTable = new UniTableConfig('traveltype.combine.wagetype')
        .setColumns([
            foreignTypeColumn,
            foreignDescriptionColumn,
            wageTypeColumn,
            invoiceAccountColumn,
        ])
        .setSearchable(true)
        .setEditable(true)
        .setPageSize(20)
        .setChangeCallback((event) => {
            const row: TravelType = event.rowModel;
            const saveFields = [INVOICE_ACCOUNT_FIELD, WAGETYPE_FIELD];
            if (event.field === INVOICE_ACCOUNT_FIELD) {
                row.InvoiceAccount = event.newValue && event.newValue.AccountNumber;
            }
            if (event.field === WAGETYPE_FIELD) {
                row.WageTypeNumber = event.newValue ? event.newValue.WageTypeNumber : null;
            }
            if (saveFields.some(field => field === event.field)) {
                row[DIRTY_FIELD] = true;
                this.saveActions[0].disabled = false;
            }
            return row;
        });
    }

  public hasChanges() {
      return this.table.getTableData().some(trans => trans[DIRTY_FIELD]);
  }

  public canDeactivate(): Observable<boolean> {
      if (!this.hasChanges()) { return Observable.of(true); }

      return this.modalService
            .openUnsavedChangesModal()
            .onClose
            .map(result => {
                if (result === ConfirmActions.ACCEPT) {
                   this.save(m => {});
                }
                return result !== ConfirmActions.CANCEL;
            })
            .map(canDeactivate => {
                return canDeactivate;
            });
  }

  private toggleSave() {
    this.saveActions[0].disabled = !this.table.getTableData().some(trans => trans[DIRTY_FIELD]);
}

  private save(done: (message: string) => void) {
      this.table.getTableData()
        .filter(dt => dt[DIRTY_FIELD])
        .forEach((tr: TravelType) => {
          this.travelService.Put(tr.ID, tr)
          .finally(() => {
            done('Reisetyper lagret');
            this.toggleSave();
          })
          .subscribe(saved => {
            tr[DIRTY_FIELD] = false;
          }, err => {
            this.errorService.handle(err);
            done('Lagring feilet');
          });
        });
  }

}
