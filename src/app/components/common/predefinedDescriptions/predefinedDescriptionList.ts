import {Component} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable/index';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {IUniSaveAction} from '@uni-framework/save/save';
import {PredefinedDescription} from '@uni-entities';
import {Observable, forkJoin} from 'rxjs';
import {UniModalService} from '@uni-framework/uni-modal';
import {PredefinedDescriptionService, ErrorService} from '@app/services/services';

@Component({
    selector: 'predefined-description-list',
    templateUrl: './predefinedDescriptionList.html'
})
export class PredefinedDescriptionList {
    private hasUnsavedChanges: boolean;
    public predefinedDescriptionTypes: Array<any> =  [ {ID: 1, Name: 'Bilagsføring'} ];
    public predefinedDescriptions: PredefinedDescription [] = [];
    private selectedTypeID: number = 0;
    public predefinedDescriptionTypeTableConfig: UniTableConfig;
    public predefinedDescriptionsConfig: UniTableConfig;

    public toolbarConfig: IToolbarConfig;
    public saveActions: IUniSaveAction[];

    constructor(
        private predefinedDescriptionService: PredefinedDescriptionService,
        private errorService: ErrorService,
        private tabService: TabService,
        private modalService: UniModalService
    ) {
        this.tabService.addTab({
            name: 'Faste tekster',
            url: 'predefined-descriptions',
            moduleID: UniModules.PredefinedDescription,
            active: true
        });

        this.initToolbar();
        this.initTableConfigs();
    }

    public onDescriptionTypeSelected(type) {
        if (!type) {
            return;
        }

        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.selectedTypeID = type.ID;
                this.loadData();
            }
        });
    }

    public loadData() {
        this.setHasUnsavedChanges(false);
        this.predefinedDescriptionService.GetAll('filter=Type eq ' + this.selectedTypeID).subscribe(
                res => this.predefinedDescriptions = res,
                err => this.errorService.handle(err)
        );
    }

    setHasUnsavedChanges(hasUnsaved: boolean) {
        this.hasUnsavedChanges = hasUnsaved;
        this.initToolbar();
    }

    public canDeactivate(): Observable<boolean> {
        if (!this.hasUnsavedChanges) {
            return Observable.of(true);
        }

        return this.modalService.deprecated_openUnsavedChangesModal().onClose;
    }


    private initToolbar() {
        this.toolbarConfig = { title: 'Faste tekster' };

        this.saveActions = [{
            label: 'Lagre',
            main: true,
            disabled: !this.hasUnsavedChanges,
            action: (done) => {
                const changedRows = this.predefinedDescriptions.filter(item => item['_isDirty']);
                if (!changedRows.length) {
                    done();
                    this.setHasUnsavedChanges(false);
                    return;
                }

                const requests = changedRows.map(row => {
                    row.Type = this.selectedTypeID;
                    return row.ID > 0
                        ? this.predefinedDescriptionService.Put(row.ID, row)
                        : this.predefinedDescriptionService.Post(row);
                });

                forkJoin(requests).subscribe(
                    () => {
                        this.setHasUnsavedChanges(false);
                        this.loadData();
                        done();
                    },
                    err => {
                        this.errorService.handle(err);
                        done();
                    }
                );
            }
        }];
    }


    private initTableConfigs() {
        const storageKey1 = 'common.predefinedDescriptions.types';
        this.predefinedDescriptionTypeTableConfig = new UniTableConfig(storageKey1, false, true, 15)
            .setSearchable(false)
            .setAutofocus(true)
            .setColumnMenuVisible(false)
            .setColumns([new UniTableColumn('Name')]);

        const storageKey2 = 'common.predefinedDescriptions.descriptions';
        this.predefinedDescriptionsConfig = new UniTableConfig(storageKey2, true)
            .setDeleteButton(true)
            .setColumns([
                new UniTableColumn('Code', 'Kode', UniTableColumnType.Text).setWidth('100px'),
                new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
            ]);

    }
}
