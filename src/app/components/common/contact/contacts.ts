import {Component, ViewChild, Input, Output, EventEmitter, AfterViewInit, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {Contact, BusinessRelation} from '../../../unientities';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig, IContextMenuItem
} from '../../../../framework/ui/unitable/index';
import {ToastService, ToastTime, ToastType} from '../../../../framework/uniToast/toastService';

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

    public contactTableConfig: UniTableConfig;
    public contacts: Array<Contact>;
    public selectedContact: Contact;

    constructor(
        private router: Router,
        private toastService: ToastService
    ) {}


    public ngOnChanges(changes: SimpleChanges) {
        if (changes['parentBusinessRelation'] && changes['parentBusinessRelation'].currentValue) {
            this.contacts = this.parentBusinessRelation.Contacts;
            this.setupTable();
        }
    }

    public onRowSelected(event) {
        this.selectedContact = event.rowModel;
        this.selected.emit(this.selectedContact);
    }

    public onRowChanged(event) {
        const contact = event.rowModel;
        this.parentBusinessRelation.Contacts[contact._originalIndex] = contact;

        this.contactChanged.emit(contact);
    }

    public ngAfterViewInit() {
        this.focusRow(0);
    }

    public focusRow(index?) {
        if (this.table && index) {
            this.table.focusRow(index);
        }
    }

    public onRowDelete(event) {
        const contact = event.rowModel;
        if (!contact) { return; }
        if (!contact.ID) {
            this.contacts.splice(contact._originalIndex, 1);
        } else {
        contact.Deleted = true;
        this.parentBusinessRelation.Contacts[contact._originalIndex] = contact;

        this.deleted.emit(contact);
        }
    }

    private changeCallback(event) {
        const rowModel = event.rowModel;

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
        const nameCol = new UniTableColumn('Info.Name', 'Navn',  UniTableColumnType.Text).setWidth('200px');
        const titleCol = new UniTableColumn('Role', 'Rolle',  UniTableColumnType.Text);
        const phoneCol = new UniTableColumn('Info.DefaultPhone.Number', 'Telefon',  UniTableColumnType.Text);
        const emailCol = new UniTableColumn('Info.DefaultEmail.EmailAddress', 'E-postadresse',  UniTableColumnType.Text);

        const isMainContactCol =
            new UniTableColumn('_maincontact', 'Hovedkontakt',  UniTableColumnType.Text)
                .setTemplate((item) => {
                    if (typeof item._maincontact === 'boolean' && item._maincontact ) {
                        return 'Ja';
                    }
                    return '';
                })
                .setEditable(false);


        const defaultRowModel = {
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

        const contextMenuItems: IContextMenuItem[] = [];

        contextMenuItems.push({
            label: 'Vis kontaktdetaljer',
            action: (rowModel) => {
                this.router.navigateByUrl('/contacts/' + rowModel.ID);
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
                    this.contactChanged.emit(rowModel);
                }
            },
            disabled: () => {
                return false;
            }
        });

        // Setup table
        this.contactTableConfig = new UniTableConfig('common.contacts', true, true, 15)
            .setSearchable(false)
            .setSortable(false)
            .setDeleteButton(true)
            .setContextMenu(contextMenuItems)
            .setDefaultRowData(defaultRowModel)
            .setChangeCallback(event => this.changeCallback(event))
            .setColumns([nameCol, titleCol, isMainContactCol, phoneCol, emailCol]);
    }
}
