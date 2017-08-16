import {Component, ViewChildren, QueryList} from '@angular/core';
import {UniTableConfig, UniTableColumn, UniTable, UniTableColumnType} from '../../../../framework/ui/unitable/index';
import {UniHttp} from '../../../../framework/core/http/http';
import {ErrorService, GuidService} from '../../../services/services';
import {Terms, TermsType} from '../../../unientities';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniModalService, ConfirmActions} from '../../../../framework/uniModal/barrel';

@Component({
    selector: 'uni-terms',
    templateUrl: './terms.html'
})
export class UniTerms {
    @ViewChildren(UniTable)
    private uniTables: QueryList<UniTable>;

    private termsTypes: any[] = [
        {TermsType: TermsType.PaymentTerms, Name: 'Betalingsbetingelser'},
        {TermsType: TermsType.DeliveryTerms, Name: 'Leveringsbetingelser'}
    ];
    private currentTermType: any = this.termsTypes.find(
        x => x.TermsType === TermsType.PaymentTerms
    ); // Valgt TermsTypes, betaling forhåndsvalgt
    private currentTerms: Terms[] = []; // terms filtrert etter valgt TermsTypes
    private deletables: Array<Terms> = []; // Tabellrader som blir slettet
    
    public terms: Terms[] = []; // Alle terms, begge typer
    public hasUnsavedChanges: boolean = false;
    public busy: boolean = false;

    public termsTypeTableConfig: UniTableConfig;
    public termsTableConfig: UniTableConfig;
    public saveactions: IUniSaveAction[] = [];
    
    constructor(
        private http: UniHttp,
        private errorService: ErrorService,
        private guidService: GuidService,
        private modalService: UniModalService
    ) {
        this.initTermsTypeTableConfig(); 
        this.initPaymentTermsTableConfig(); 
        this.updateSaveActions();
        this.getTerms(); 
        setTimeout(x => {
            this.uniTables.first.focusRow(0);
        }, 500); // Forhåndsvelger TermsTypes betaling
    }

    public onTermSelected(event) {
        if (!event || !event.rowModel) {
            return;
        }

        this.checkSave(true).then(ok => {
            if (ok) {
                this.setCurrent(event.rowModel);
            }
        });
    }

    public updateSaveActions() {
        this.saveactions = [{
            label: 'Lagre',
            action: (done) => this.onSaveClicked(done),
            main: true,
            disabled: !this.hasUnsavedChanges
        }];
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
            this.uniTables.last.blur();
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
        this.updateSaveActions();
    }

    public onTermDeleted(event) {
        var row = event.rowModel;
        var index = row['_originalIndex'];
        if (index >= 0) {
            var item = this.currentTerms[index];
            this.currentTerms.splice(index, 1);
            if (item && item.ID) {
                item.Deleted = true;
                this.hasUnsavedChanges = true;
                this.updateSaveActions();
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
    private onEditChange(event) {
        var rowIndex = event.originalIndex;
        var value = event.rowModel[event.field];

        if (value === null) {value = 0; }

        if (!value && value !== '') {
            return event.rowModel;
        }

        this.hasUnsavedChanges = true;
        this.updateSaveActions();

        if (rowIndex >= this.currentTerms.length) {
            if (this.currentTermType.TermsType === TermsType.PaymentTerms) {
                this.currentTerms.push(this.newPaymentTerm());   
            } else if (this.currentTermType.TermsType === TermsType.DeliveryTerms) {
                this.currentTerms.push(this.newDeliveryTerm());   
            }
        }

        let localItem = <any>this.currentTerms[rowIndex];
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
            this.currentTerms.forEach(term => {
                var ht = term.ID ? this.http.asPUT() : this.http.asPOST();
                var route = term.ID ? 'terms/' + term.ID : 'terms';
                ht.usingBusinessDomain()
                    .withBody(term)
                    .withEndPoint(route)
                    .send().map(response => response.json())
                    .subscribe(
                        result => {
                            this.hasUnsavedChanges = false;
                            this.updateSaveActions();
                            this.getTerms();
                            resolve(true);
                        },
                        error => {
                            resolve(false);
                            this.errorService.handle(error);
                        }
                       
                    );
            });
        });
    }

    private initTermsTypeTableConfig() {
        this.termsTypeTableConfig = new UniTableConfig(false, true, 15)
            .setSearchable(false)
            .setSortable(false)
            .setColumns([
                new UniTableColumn('Name', '', UniTableColumnType.Text)
            ]);
    }

    private initPaymentTermsTableConfig() {
        this.termsTableConfig = new UniTableConfig(true, true, 15)
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
        this.termsTableConfig = new UniTableConfig(true, true, 15)
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
            .send().map(response => response.json())
            .subscribe(
                result => {
                    this.terms = result;
                    this.setCurrent(this.currentTermType);
                },
                error => this.errorService.handle(error)
        );
    }

}

