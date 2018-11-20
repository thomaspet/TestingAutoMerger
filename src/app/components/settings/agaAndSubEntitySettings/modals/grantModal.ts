import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {
    UniTable,
    UniTableConfig,
    UniTableColumn,
    UniTableColumnType
} from '../../../../../framework/ui/unitable/index';
import {GrantService, SubEntityService, ErrorService} from '../../../../services/services';
import {Grant, SubEntity} from '../../../../unientities';
import {Observable} from 'rxjs';

@Component({
    selector: 'grant-modal',
    templateUrl: './grantModal.html'
})

export class GrantModal implements OnInit, IUniModal {
    @ViewChild(UniTable) private table: UniTable;

    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();

    public grantTableConfig: UniTableConfig;
    public grantData: any[] = [];
    public infoText: string;

    private allSubEntities: SubEntity[];

    constructor(
        private _grantService: GrantService,
        private _subentityService: SubEntityService,
        private errorService: ErrorService
    ) { }

    public ngOnInit() {
        Observable.forkJoin(
            this._grantService.GetAll(''),
            this._subentityService.GetAll(
                'filter=SuperiorOrganizationID gt 0', ['BusinessRelationInfo.InvoiceAddress']
            )
        ).subscribe((response: any) => {
            let [grants, subs] = response;
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
            let saver = (grant.ID > 0) ? this._grantService.Put(grant.ID, grant) : this._grantService.Post(grant);
            saver.subscribe((savedGrant: Grant) => {
                this.done('Tilskudd lagret');
            },
            (err) => {
                this.errorService.handle(err);
                this.done(`Feil ved lagring av tilskudd: ${err}`);
            });
        });
    }

    private done(infotext: string) {
        this.infoText = infotext;
    }

    private setTableConfig() {
        let yesNo: any[] =
        [
            {Text: 'Ja', Value: true},
            {Text: 'Nei', Value: false}
        ];

        let subentCol = new UniTableColumn('_Subentity', 'Virksomhet', UniTableColumnType.Lookup)
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
        let dateCol = new UniTableColumn('FromDate', 'Dato', UniTableColumnType.LocalDate);
        let descCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);
        let amountCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money);
        let agaCol = new UniTableColumn('AffectsAGA', 'Påvirker aga', UniTableColumnType.Lookup)
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
                    let text = (affect.Text || '').toLowerCase();
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
                        return this._grantService.delete(rowModel.ID);
                    }
                })
            .setColumns([subentCol, dateCol, descCol, amountCol, agaCol])
            .setChangeCallback((event) => {
                let row = event.rowModel;
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

    public saveAndClose() {
        this.saveData();
        this.close();
    }
}
