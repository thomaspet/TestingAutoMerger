import {Component, AfterViewInit, ViewChild, Type, Input} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniTable, UniTableConfig, UniTableColumn, UniTableColumnType} from 'unitable-ng2/main';
import {GrantService, SubEntityService} from '../../../../services/services';
import {Grant, SubEntity} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'grants-modal-content',
    templateUrl: 'app/components/settings/agaAndSubEntitySettings/modals/grantsModal.html'
})
export class GrantsModalContent {
    @Input() public config: any;
    private grantTableConfig: UniTableConfig;
    private grantData: any[] = [];
    private infoText: string;
    @ViewChild(UniTable) private table: UniTable;
    private allSubEntities: SubEntity[];

    constructor(
        private _grantService: GrantService, 
        private _subentityService: SubEntityService) {
    }

    public loadData() {
        Observable.forkJoin(
            this._grantService.GetAll(''),
            this._subentityService.GetAll('filter=SuperiorOrganizationID gt 0', ['BusinessRelationInfo.InvoiceAddress'])
        ).subscribe((response: any) => {
            let [grants, subs] = response;
            this.grantData = grants;
            subs.forEach(subentity => {
                subentity._Name = subentity.BusinessRelationInfo.Name;
            });
            this.allSubEntities = subs;
            this.setTableConfig();
        });
    }

    public saveData() {
        this.grantData = this.table.getTableData();
        this.grantData.forEach(grant => {
            let saver = (grant.ID > 0) ? this._grantService.Put(grant.ID, grant) : this._grantService.Post(grant);
            saver.subscribe((savedGrant: Grant) => {
                this.done('Tilskudd lagret');
            },
            (err) => {
                this.done(`Feil ved lagring av tilskudd: ${err}`);
            });
        });
    }

    private done(infotext: string) {
        this.infoText = infotext;
    }

    private setTableConfig() {
        let subentCol = new UniTableColumn('_Subentity', 'Virksomhet', UniTableColumnType.Lookup)
        .setTemplate((rowModel) => {
            let subEntity = rowModel['_Subentity'];
            if (rowModel['SubentityID']) {
                subEntity = this.allSubEntities.find(sub => sub.ID === rowModel.SubentityID);
            }
            return (subEntity) ? `${subEntity.OrgNumber} - ${subEntity._Name}` : '';
            
        })
        .setEditorOptions({
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
        let dateCol = new UniTableColumn('FromDate', 'Dato', UniTableColumnType.Date);
        let descCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);
        let amountCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money);
        let agaCol = new UniTableColumn('AffectsAGA', 'Påvirker aga', UniTableColumnType.Select)
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
        .setEditorOptions({
            resource: [
                {Text: 'Ja', Value: true},
                {Text: 'Nei', Value: false}
            ],
            displayField: 'Text'
        });

        this.grantTableConfig = new UniTableConfig(true, true, 15)
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
            }

            if (event.field === 'AffectsAGA') {
                const affAGA = row['AffectsAGA'];
                row['AffectsAGA'] = affAGA ? row['AffectsAGA'].Value : false;
            }

            return row;
        });
    }

}

@Component({
    selector: 'grants-modal',
    template: `<uni-modal [type]="type" [config]="grantsmodalConfig"></uni-modal>`
})
export class GrantsModal implements AfterViewInit {
    @ViewChild(UniModal) private modal: UniModal;
    public grantsmodalConfig: any = {};
    public type: Type<any> = GrantsModalContent;

    constructor() {
        this.grantsmodalConfig = {
            title: 'Tilskudd',
            hasCancelButton: true,
            cancel: () => {
                this.modal.close();
            },
            actions: [
                {
                    text: 'Lagre og lukk',
                    class: 'good',
                    method: () => {
                        this.modal.getContent().then((component) => {
                            component.saveData();
                            this.modal.close();
                        });
                    }
                }
            ]
        };
    }

    public ngAfterViewInit() {
        this.modal.createContent();
    }

    public openGrantsModal() {
        this.modal.open();
        this.modal.getContent().then((component: GrantsModalContent) => {
            component.loadData();
        });
    }
}
