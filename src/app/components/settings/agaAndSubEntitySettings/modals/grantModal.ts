import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {
    UniTableConfig,
    UniTableColumn,
    UniTableColumnType
} from '../../../../../framework/ui/unitable/index';
import {GrantService, SubEntityService, ErrorService} from '../../../../services/services';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {ToastService} from '@uni-framework/uniToast/toastService';
import {Grant, SubEntity} from '../../../../unientities';
import {Observable} from 'rxjs';

@Component({
    selector: 'grant-modal',
    templateUrl: './grantModal.html'
})

export class GrantModal implements OnInit, IUniModal {

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild(AgGridWrapper, { static: true })
    public table: AgGridWrapper;

    public grantTableConfig: UniTableConfig;
    public grantData: any[] = [];

    private allSubEntities: SubEntity[];

    constructor(
        private _grantService: GrantService,
        private _subentityService: SubEntityService,
        private errorService: ErrorService,
        private toast: ToastService
    ) { }

    public ngOnInit() {
        Observable.forkJoin(
            this._grantService.GetAll(''),
            this._subentityService.GetAll(
                'filter=SuperiorOrganizationID gt 0', ['BusinessRelationInfo.InvoiceAddress']
            )
        ).subscribe((response: any) => {
            const [grants, subs] = response;
            this.grantData = grants;
            subs.forEach(subentity => {
                subentity['_Name'] = subentity.BusinessRelationInfo
                    ? subentity.BusinessRelationInfo.Name
                    : '';
            });
            this.allSubEntities = subs;
            this.setTableConfig();
        }, err => this.errorService.handle(err));
    }

    public saveData() {
        this.grantData = this.table.getTableData();

        this.grantData.forEach(grant => {
            const saver = (grant.ID > 0) ? this._grantService.Put(grant.ID, grant) : this._grantService.Post(grant);
            saver.subscribe((savedGrant: Grant) => {
                this.toast.addToast('Tilskudd lagret..', 2, 5);
                this.close();
            },
            (err) => {
                this.errorService.handle(err);
                this.toast.addToast('Lagring feilet', 1, 5, 'Lagring av tilskudd feilet. Sjekk at data er rett.');
            });
        });
    }

    private setTableConfig() {
        const yesNo: any[] =
        [
            {Text: 'Ja', Value: true},
            {Text: 'Nei', Value: false}
        ];

        const subentCol = new UniTableColumn('_Subentity', 'Virksomhet', UniTableColumnType.Lookup)
        .setTemplate((rowModel) => {
            let subEntity = rowModel['_Subentity'];
            if (rowModel['SubentityID']) {
                subEntity = this.allSubEntities.find(sub => sub.ID === rowModel.SubentityID);
            }
            return (subEntity) ? `${subEntity.OrgNumber} - ${subEntity._Name}` : '';

        })
        .setOptions({
            itemTemplate: (selectedItem) => {
                return (selectedItem.ID + ' - ' + selectedItem._Name);
            },
            lookupFunction: (searchValue) => {
                return this.allSubEntities.filter((subentity) => {
                    if (isNaN(searchValue)) {
                        return (subentity.BusinessRelationInfo.Name.toLowerCase().indexOf(searchValue) > -1);
                    } else {
                        return subentity.ID.toString().startsWith(searchValue.toString());
                    }
                });
            }
        });
        const dateCol = new UniTableColumn('FromDate', 'Dato', UniTableColumnType.LocalDate);
        const descCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);
        const amountCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money);
        const agaCol = new UniTableColumn('AffectsAGA', 'Påvirker aga', UniTableColumnType.Lookup)
        .setTemplate((rowModel) => {
            if (rowModel['AffectsAGA'] !== null) {
                if (rowModel['AffectsAGA'] === true) {
                    return 'Ja';
                } else {
                    return 'Nei';
                }
            }
            return '';
        })
        .setOptions({
            lookupFunction: (searchValue: string) => {
                return yesNo.filter((affect) => {
                    const text = (affect.Text || '').toLowerCase();
                    return (text.indexOf(searchValue.toLowerCase()) > - 1);
                });
            },
            itemTemplate: (selectedItem) => {
                return selectedItem ? selectedItem.Text : '';
            }
        });

        const configStoreKey = 'settings.agaAndSubEntitySettings.grantsModal';
        this.grantTableConfig = new UniTableConfig(configStoreKey, true, true, 15)
            .setDeleteButton({
                    deleteHandler: (rowModel: Grant) => {
                        if (isNaN(rowModel.ID)) { return true; }
                        return this._grantService.Remove(rowModel.ID);
                    }
                })
            .setColumns([subentCol, dateCol, descCol, amountCol, agaCol])
            .setChangeCallback((event) => {
                const row = event.rowModel;
                if (event.field === '_Subentity') {
                    const subentity = row['_Subentity'];
                    row['SubentityID'] = (subentity) ? subentity.ID : null;
                    row['AffectsAGA'] = true;
                }

                if (event.field === 'AffectsAGA') {
                    const affAGA = row['AffectsAGA'];
                    row['AffectsAGA'] = affAGA ? row['AffectsAGA'].Value : false;
                }

                return row;
            });
    }

    public close() {
        this.onClose.next(true);
    }
}
