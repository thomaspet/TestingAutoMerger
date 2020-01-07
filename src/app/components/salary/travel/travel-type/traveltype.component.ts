import { Component, OnInit, ViewChild } from '@angular/core';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType, UniTable} from '@uni-framework/ui/unitable';
import { TravelType, WageType  } from '@uni-entities';

// import {TravelTypeService, WageTypeService} from '../../../../services/services';

import {ReplaySubject} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {TravelTypeService, WageTypeService } from '@app/services/salaryServicesModule';
import {ErrorService } from '@app/services/common/errorService';
import {UniView } from '@uni-framework/core/uniView';
import {Router, ActivatedRoute } from '@angular/router';
import {UniCacheService } from '@app/services/services';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { IUniSaveAction } from '@uni-framework/save/save';
import { Observable } from 'rxjs';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'uni-traveltype',
  templateUrl: './traveltype.component.html',
  styleUrls: ['./traveltype.component.sass']
})
export class TraveltypeComponent /* extends UniView { */ implements OnInit  {
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
    private modalService: UniModalService
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
    this.travelTable = new UniTableConfig('traveltype.combine.wagetype')
    .setColumns([
      new UniTableColumn('ForeignTypeID', 'ReiseType', UniTableColumnType.Text).setWidth('10rem').setEditable(false),
      new UniTableColumn('ForeignDescription', 'Beskrivelse',  UniTableColumnType.Text).setEditable(false),
      new UniTableColumn('_WageTypeNumber', 'Lønnsart', UniTableColumnType.Lookup)
        .setTemplate((rm) => {
          let wtnumber = rm['_WageTypeNumber'];
          if (rm['WageTypeNumber']) {
              wtnumber = this.wagetypes.find(wt => wt.WageTypeNumber === rm.WageTypeNumber);
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
          }}).setWidth('50rem')
    ])
    .setSearchable(true)
    .setEditable(true)
    .setPageSize(20)
    .setChangeCallback((event) => {
      if (event.field === '_WageTypeNumber') {
        event.rowModel.WageTypeNumber = event.newValue ? event.newValue.WageTypeNumber : null;
        event.rowModel['_isDirty'] = true;
        this.saveActions[0].disabled = false;
    }
    });
  }

  public hasChanges() {
      return this.table.getTableData().some(trans => trans['_isDirty']);
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
    this.saveActions[0].disabled = !this.table.getTableData().some(trans => trans['_isDirty']);
}

  private save(done: (message: string) => void) {
      this.table.getTableData()
        .filter(dt => dt['_isDirty'])
        .forEach((tr: TravelType) => {
          this.travelService.Put(tr.ID, tr)
          .finally(() => {
            done('Reisetyper lagret');
            this.toggleSave();
          })
          .subscribe(saved => {
            tr['_isDirty'] = false;
          }, err => {
            this.errorService.handle(err);
            done('Lagring feilet');
          });
        });
  }

}
