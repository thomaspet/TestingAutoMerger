import {Component, ViewChild, Input, Output, EventEmitter, AfterViewInit, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {Contact, BusinessRelation, Address, Phone, Email} from '../../../unientities';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {ToastService, ToastTime, ToastType} from '../../../../framework/uniToast/toastService';
import {
    ErrorService,
    ContactService
} from '../../../services/services';

import * as moment from 'moment';
declare const _;

@Component({
    selector: 'contacts',
    templateUrl: './contacts.html',
})
export class Contacts implements AfterViewInit {
    @ViewChild(UniTable) private table: UniTable;

    @Input() public parentBusinessRelation: BusinessRelation;
    @Output() public contactChanged: EventEmitter<Contact> = new EventEmitter<Contact>();
    @Output() public selected: EventEmitter<Contact> = new EventEmitter<Contact>();
    @Output() public deleted: EventEmitter<Contact> = new EventEmitter<Contact>();
    @Output() public mainContactSet: EventEmitter<Contact> = new EventEmitter<Contact>();

    private contactTableConfig: UniTableConfig;
    private contacts: Array<Contact>;
    private selectedContact: Contact;

    constructor(private router: Router,
                private contactService: ContactService,
                private errorService: ErrorService,
                private toastService: ToastService) {
    }

    public ngOnInit() {
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['parentBusinessRelation'] && changes['parentBusinessRelation'].currentValue) {
            this.contacts = this.parentBusinessRelation.Contacts;
            this.setupTable();
        }
    }

    private onRowSelected(event) {
        this.selectedContact = event.rowModel;
        this.selected.emit(this.selectedContact);
    }

    private onRowChanged(event) {
        let contact = event.rowModel;
        this.parentBusinessRelation.Contacts[contact._originalIndex] = contact;

        this.contactChanged.emit(contact);
    }

    public ngAfterViewInit() {
        this.focusRow(0);
    }

    public focusRow(index = undefined) {
        if (this.table && index) {
            this.table.focusRow(index);
        }
    }

    public onRowDelete(event) {
        var contact = event.rowModel;
        if (!contact) { return; }

        contact.Deleted = true;
        this.parentBusinessRelation.Contacts[contact._originalIndex] = contact;

        this.deleted.emit(contact);
    }

    private changeCallback(event) {
        var rowModel = event.rowModel;

        if (event.field === 'Info.Name') {
            rowModel.Info.Name = rowModel[event.field];
        } else if (event.field === 'Info.DefaultPhone.Number') {
            rowModel.Info.DefaultPhone.Number = rowModel[event.field];
        } else if (event.field === 'Info.DefaultEmail.EmailAddress') {
            rowModel.Info.DefaultEmail.EmailAddress = rowModel[event.field];
        }

        return rowModel;
    }

    private setupTable() {
        // Define columns to use in the table
        let nameCol = new UniTableColumn('Info.Name', 'Navn',  UniTableColumnType.Text).setWidth('200px');
        let titleCol = new UniTableColumn('Role', 'Rolle',  UniTableColumnType.Text);
        let phoneCol = new UniTableColumn('Info.DefaultPhone.Number', 'Telefon',  UniTableColumnType.Text);
        let emailCol = new UniTableColumn('Info.DefaultEmail.EmailAddress', 'Epost',  UniTableColumnType.Text);

        let isMainContactCol =
            new UniTableColumn('_maincontact', 'Hovedkontakt',  UniTableColumnType.Text)
                .setTemplate((item) => {
                    if (typeof item._maincontact === 'boolean' && item._maincontact ) {
                        return 'Ja';
                    }
                    return '';
                })
                .setEditable(false);


        let defaultRowModel = {
            Role: '',
            Info: {
                Name: '',
                ParentBusinessRelationID: this.parentBusinessRelation.ID,
                DefaultEmail: {
                    EmailAddress: null
                },
                DefaultPhone: {
                    Number: null
                }
            }
        };

        let contextMenuItems: IContextMenuItem[] = [];

        contextMenuItems.push({
            label: 'Vis kontaktdetaljer',
            action: (rowModel) => {
                this.router.navigateByUrl('/contacts/' + rowModel.ID)
            },
            disabled: (rowModel) => {
                if (!rowModel || !rowModel.ID || rowModel.ID === 0) {
                    return true;
                }

                return false;
            }
        },
        {
            label: 'Sett som hovedkontakt',
            action: (rowModel) => {
                if (!rowModel.ID || rowModel.ID === 0) {
                    this.toastService.addToast(
                        'Lagre endringene dine først',
                        ToastType.warn,
                        ToastTime.medium,
                        'Du må lagre endringene før du setter hovedkontakten'
                    );
                } else {
                    // set main contact on parent model
                    this.parentBusinessRelation.DefaultContactID = rowModel.ID;
                    this.contacts.forEach(x => {
                        if (x.ID === this.parentBusinessRelation.DefaultContactID && !x['_maincontact']) {
                            x['_maincontact'] = true;
                            this.table.updateRow(x['_originalIndex'], x);
                        } else if (x['_maincontact']) {
                            x['_maincontact'] = false;
                            this.table.updateRow(x['_originalIndex'], x);
                        }
                    });

                    this.mainContactSet.emit(rowModel);
                }
            },
            disabled: (rowModel) => {
                return false;
            }
        });

        // Setup table
        this.contactTableConfig = new UniTableConfig(true, true, 15)
            .setSearchable(false)
            .setSortable(false)
            .setDeleteButton(true)
            .setContextMenu(contextMenuItems)
            .setDefaultRowData(defaultRowModel)
            .setChangeCallback(event => this.changeCallback(event))
            .setColumns([nameCol, titleCol, isMainContactCol, phoneCol, emailCol]);
    }
}
