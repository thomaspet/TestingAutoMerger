import {Component, ViewChild} from '@angular/core';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../framework/ui/unitable/index';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';
import {PredefinedDescription} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {UniModalService} from '../../../../framework/uni-modal';

import {PredefinedDescriptionService, ErrorService} from '../../../services/services';


@Component({
    selector: 'predefined-description-list',
    templateUrl: './predefinedDescriptionList.html'
})

export class PredefinedDescriptionList {
    @ViewChild(UniTable)
    private table: UniTable;

    private hasUnsavedChanges: boolean;
    public predefinedDescriptionTypes: Array<any> =  [ {ID: 1, Name: 'Bilagsføring'} ];
    private predefinedDescriptions: PredefinedDescription [] = [];
    private selectedType: number = 0;
    private predefinedDescriptionTypeTableConfig: UniTableConfig;
    private predefinedDescriptionsConfig: UniTableConfig;

    private toolbarConfig: IToolbarConfig;
    private saveActions: IUniSaveAction[];
    private changedPreDefinedDescriptions: Array<PredefinedDescription> = [];

    constructor(
        private predefinedDescriptionService: PredefinedDescriptionService,
        private errorService: ErrorService,
        private tabService: TabService,
        private toastService: ToastService,
        private modalService: UniModalService
    ) {

        this.tabService.addTab({
            name: 'Faste tekster',
            url: '/predefinedDescriptions/predefineddescriptions',
            moduleID: UniModules.PredefinedDescription,
            active: true
        });

        this.initToolbar();
        this.initTableConfigs();
        setTimeout(() => {
            this.table.focusRow(0);
            this.selectedType = 1;
            this.loadData();

        });
    }

    public onRowSelectedType(event) {
        if (!event.rowModel) {
            return;
        }

        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.selectedType = event.rowModel['ID'];
                this.loadData();
            }
        });
    }

    public loadData() {
        this.setHasUnsavedChangeds(false);
        this.changedPreDefinedDescriptions = [];
        this.predefinedDescriptionService.GetAll('filter=Type eq ' + this.selectedType).subscribe(
                res => this.predefinedDescriptions = res,
                err => this.errorService.handle(err)
        );
    }


    public onChangePreDefinedDescription(event) {
        let row = event.rowModel;
        row['Type'] = this.selectedType;

        let index = this.changedPreDefinedDescriptions.findIndex(x => row['_guid'] === x['_guid']);
        if (index >= 0) {
            this.changedPreDefinedDescriptions[index] = row;
        } else {
            this.changedPreDefinedDescriptions.push(row);
        }

        this.setHasUnsavedChangeds(true);


    }

    private setHasUnsavedChangeds(hasUnsaved: boolean) {
        this.hasUnsavedChanges = hasUnsaved;
        this.initToolbar();
    }


   public onPredefinedDescriptionDeleted(event) {
        let row = event.rowModel;
        row.Deleted = true;

        let changesIndex = this.changedPreDefinedDescriptions.findIndex(x => x['_guid'] === row['_guid']);

        if (row['ID']) {
            if (changesIndex >= 0) {
                this.changedPreDefinedDescriptions[changesIndex] = row;
            } else {
                this.changedPreDefinedDescriptions.push(row);
            }
        } else {
            this.changedPreDefinedDescriptions.splice(changesIndex, 1);
        }

        this.setHasUnsavedChangeds(this.changedPreDefinedDescriptions.length > 0);
   }

    public canDeactivate(): Observable<boolean> {
        if (!this.hasUnsavedChanges) {
            return Observable.of(true);
        }

        return this.modalService.deprecated_openUnsavedChangesModal().onClose;
    }


    private initToolbar() {
        this.toolbarConfig = {
            title: 'Faste tekster'
        };

        this.saveActions = [{
            label: 'Lagre',
            main: true,
            disabled: !this.hasUnsavedChanges,
            action: (done) => {

                let requests = [];
                this.changedPreDefinedDescriptions.forEach(x => {
                    if (x['ID']) {
                        requests.push(this.predefinedDescriptionService.Put(x['ID'], x));
                    } else {
                        requests.push(this.predefinedDescriptionService.Post(x));
                    }
                });

                Observable.forkJoin(requests)
                    .subscribe(resp => {
                        this.toastService.addToast('Faste tekster ble lagret!', ToastType.good, 5);
                        done('Faste tekster ble lagret');
                        this.loadData();
                    }, (err) => {
                        done('Feil ved lagring av faste tekster');
                        this.errorService.handle(err);
                });
            }
        }];
    }


    private initTableConfigs() {
        const storageKey1 = 'common.predefinedDescriptions.types';
        this.predefinedDescriptionTypeTableConfig = new UniTableConfig(storageKey1, false, true, 15)
            .setSearchable(false)
            .setColumns([new UniTableColumn('Name')]);

        const storageKey2 = 'common.predefinedDescriptions.descriptions';
        this.predefinedDescriptionsConfig = new UniTableConfig(storageKey2, true, true, 15)
            .setSearchable(false)
            .setDeleteButton(true)
            .setChangeCallback(event => { return event.rowModel; })
            .setColumns(
                [
                    new UniTableColumn('Code', 'Kode', UniTableColumnType.Text)
                        .setWidth('100px'),
                    new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                ]
            );

    }
}
