import {Component, ViewChildren, QueryList} from '@angular/core';
import {SettingsService} from '../settings-service';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '../../../../framework/ui/unitable/index';
import {UniHttp} from '../../../../framework/core/http/http';
import {ErrorService, GuidService} from '../../../services/services';
import {Terms, TermsType} from '../../../unientities';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { IUniSaveAction } from '@uni-framework/save/save';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';

@Component({
    selector: 'uni-terms',
    templateUrl: './terms.html'
})

export class UniTerms {
    @ViewChildren(AgGridWrapper)
    private uniTables: QueryList<AgGridWrapper>;

    public termsTypes: any[] = [
        { TermsType: TermsType.PaymentTerms, Name: 'Betalingsbetingelser' },
        { TermsType: TermsType.DeliveryTerms, Name: 'Leveringsbetingelser' }
    ];
    public currentTermType: any = this.termsTypes.find(x => x.TermsType === TermsType.PaymentTerms);
    public currentTerms: Terms[] = []; // terms filtrert etter valgt TermsTypes
    private deletables: Array<Terms> = []; // Tabellrader som blir slettet

    public terms: Terms[] = []; // Alle terms, begge typer
    public hasUnsavedChanges: boolean = false;
    public busy: boolean = false;

    public termsTypeTableConfig: UniTableConfig;
    public termsTableConfig: UniTableConfig;
    saveactions: IUniSaveAction[] = [{
        label: 'Lagre betingelser',
        action: (done) => this.onSaveClicked(done),
        main: true,
        disabled: false
    }];

    constructor(
        private settingsService: SettingsService,
        private http: UniHttp,
        private errorService: ErrorService,
        private guidService: GuidService,
        private modalService: UniModalService,
        private tabService: TabService,
    ) {
        this.tabService.addTab({
            name: 'Betingelser',
            url: '/settings/terms',
            moduleID: UniModules.Settings,
            active: true
       });

        this.initTermsTypeTableConfig();
        this.initPaymentTermsTableConfig();
        this.getTerms();
        setTimeout(x => {
            this.uniTables.first.focusRow(0);
        }, 500); // Forhåndsvelger TermsTypes betaling
    }

    public onTermSelected(event) {
        if (!event) {
            return;
        }

        this.checkSave(true).then(ok => {
            if (ok) {
                this.setCurrent(event);
            }
        });
    }

    public onSaveClicked(done) {
        setTimeout( () => { // Allow the annoying editors to update
            this.busy = true;
            this.save().then(x => {
                this.busy = false;
                done('Lagret');
            }).catch(reason => done(reason));
        }, 50);
    }

    // Filtrerer terms etter valgt TermsTypes
    private setCurrent(t: any) {
        if (this.uniTables) {
            this.uniTables.last.finishEdit();
        }
        this.deletables = [];

        if (t.TermsType === TermsType.PaymentTerms) {
            this.currentTermType.TermsType = TermsType.PaymentTerms;
            this.currentTerms = this.terms.filter(x => x.TermsType === TermsType.PaymentTerms);
            this.initPaymentTermsTableConfig();
        } else if (t.TermsType === TermsType.DeliveryTerms) {
            this.currentTermType.TermsType = TermsType.DeliveryTerms;
            this.currentTerms = this.terms.filter(x => x.TermsType === TermsType.DeliveryTerms);
            this.initDeliveryTermsTableConfig();
        }
        this.uniTables.last.refreshTableData();
        this.hasUnsavedChanges = false;
    }

    public onTermDeleted(event) {
        const index = event['_originalIndex'];
        if (index >= 0) {
            const item = this.currentTerms[index];
            this.currentTerms.splice(index, 1);
            if (item && item.ID) {
                item.Deleted = true;
                this.hasUnsavedChanges = true;
                this.deletables.push(item);
                this.uniTables.last.refreshTableData();
            }
        }
    }

    private newPaymentTerm(): Terms {
        return <any>{
                TermsType: TermsType.PaymentTerms,
                _createguid: this.guidService.guid()
            };
    }

    private newDeliveryTerm(): Terms {
        return <any>{
                TermsType: TermsType.DeliveryTerms,
                _createguid: this.guidService.guid()
            };
    }

    // Oppdaterer data ved endring i tabellen (men ikke lagrer, lagres i save())
    public onEditChange(event) {
        const rowIndex = event.originalIndex;
        let value = event.rowModel[event.field];

        if (value === null) {value = 0; }

        if (!value && value !== '') {
            return event.rowModel;
        }

        this.hasUnsavedChanges = true;

        if (rowIndex >= this.currentTerms.length) {
            if (this.currentTermType.TermsType === TermsType.PaymentTerms) {
                this.currentTerms.push(this.newPaymentTerm());
            } else if (this.currentTermType.TermsType === TermsType.DeliveryTerms) {
                this.currentTerms.push(this.newDeliveryTerm());
            }
        }

        const localItem = <any>this.currentTerms[rowIndex];
        switch (event.field) {
            case 'Name':
                this.currentTerms[rowIndex].Name = value.ID;
                this.currentTerms[rowIndex]['Name'] = value;
                break;
            case 'CreditDays':
                this.currentTerms[rowIndex].CreditDays = value.ID;
                this.currentTerms[rowIndex]['CreditDays'] = value;
                break;
            case 'Description':
                this.currentTerms[rowIndex].Description = value.ID;
                this.currentTerms[rowIndex]['Description'] = value;
                break;
        }
        this.currentTerms[rowIndex].TermsType = this.currentTerms[rowIndex].TermsType || this.currentTermType.TermsType;
        localItem._originalIndex = rowIndex;
        return localItem;
    }

    public canDeactivate() {
        return new Promise((resolve, reject) => {
            this.checkSave(true).then( ok => resolve(ok) );
        });
    }

    private checkSave(askBeforeSave: boolean): Promise<boolean> {
        return new Promise( (resolve, reject) => {
            setTimeout(() => {
                if (!this.hasUnsavedChanges) {
                    resolve(true);
                    return;
                }

                if (!askBeforeSave) {
                    this.save().then(
                        success => resolve(success),
                        failure => resolve(false)
                    );
                }

                this.modalService.confirm({
                    header: 'Lagre endringer?',
                    message: 'Ønsker du å lagre endringer før vi fortsetter?',
                    buttonLabels: {
                        accept: 'Lagre',
                        reject: 'Forkast',
                        cancel: 'Avbryt'
                    },
                    activateClickOutside: false
                }).onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.save().then(saveResult => resolve(saveResult));
                    } else if (response === ConfirmActions.REJECT) {
                        resolve(true); // reject = discard changes
                    } else {
                        resolve(false);
                    }
                });
            });
        });
    }

    private save(): Promise<boolean> {
        return new Promise( (resolve, reject) => {
            if (this.deletables) {
                this.deletables.forEach( item => this.currentTerms.push(item) );
            }

            this.currentTerms.filter(t => !t['_isEmpty']).forEach(term => {
                const ht = term.ID ? this.http.asPUT() : this.http.asPOST();
                const route = term.ID ? 'terms/' + term.ID : 'terms';
                ht.usingBusinessDomain()
                    .withBody(term)
                    .withEndPoint(route)
                    .send().map(response => response.body)
                    .subscribe(result => {
                        this.hasUnsavedChanges = false;
                        this.getTerms();
                        resolve(true);
                    }, error => {
                        resolve(false);
                        this.errorService.handle(error);
                    });
            });
        });
    }

    private initTermsTypeTableConfig() {
        this.termsTypeTableConfig = new UniTableConfig('settings.terms.termType', false, true, 15)
            .setSearchable(false)
            .setSortable(false)
            .setColumnMenuVisible(false)
            .setColumns([
                new UniTableColumn('Name', 'Betingelse', UniTableColumnType.Text)
            ]);
    }

    private initPaymentTermsTableConfig() {
        this.termsTableConfig = new UniTableConfig('settings.terms.payment', true, true, 15)
            .setColumns([
                new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
                    .setWidth('18rem'),
                new UniTableColumn('CreditDays', 'Kredittdager', UniTableColumnType.Number)
                    .setWidth('9rem'),
                new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
            ])
            .setChangeCallback(event => this.onEditChange(event));
        this.termsTableConfig.deleteButton = true;
    }

    private initDeliveryTermsTableConfig() {
        this.termsTableConfig = new UniTableConfig('settings.terms.delivery', true, true, 15)
            .setColumns([
                new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
                    .setWidth('18rem'),
                new UniTableColumn('CreditDays', 'Leveringsdager', UniTableColumnType.Number)
                    .setWidth('9rem'),
                new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
            ])
            .setChangeCallback(event => this.onEditChange(event));
        this.termsTableConfig.deleteButton = true;
    }

    private getTerms() {
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('terms?hateoas=false&orderby=name')
            .send().map(response => response.body)
            .subscribe(
                result => {
                    this.terms = result;
                    this.setCurrent(this.currentTermType);
                },
                error => this.errorService.handle(error)
        );
    }

}

