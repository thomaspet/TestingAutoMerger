import {Component, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {Contact, BusinessRelation} from '@uni-entities';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig, IContextMenuItem
} from '@uni-framework/ui/unitable';
import { GuidService } from '@app/services/services';

@Component({
    selector: 'contacts',
    templateUrl: './contacts.html',
    styleUrls: ['./contacts.sass']
})
export class Contacts {
    @Input() parentBusinessRelation: BusinessRelation;
    @Output() parentBusinessRelationChange: EventEmitter<BusinessRelation> = new EventEmitter();

    public contactTableConfig: UniTableConfig;
    public contacts: Contact[];

    constructor(
        private router: Router,
        private toastService: ToastService,
        private guidService: GuidService
    ) {}

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['parentBusinessRelation'] && changes['parentBusinessRelation'].currentValue) {
            this.contacts = this.parentBusinessRelation.Contacts;
            this.setupTable();
        }
    }

    onDataChange() {
        this.contacts.forEach(contact => {
            if (!contact.ID && !contact['_createguid']) {
                contact['_createguid'] = this.guidService.guid();
            }

            if (!contact.Info.ID && !contact.Info['_createguid']) {
                contact.Info['_createguid'] = this.guidService.guid();
            }

            if (!contact.Info.DefaultEmail.ID && !contact.Info.DefaultEmail['_createguid']) {
                contact.Info.DefaultEmail['_createguid'] = this.guidService.guid();
            }

            if (!contact.Info.DefaultPhone.ID && !contact.Info.DefaultPhone['_createguid']) {
                contact.Info.DefaultPhone['_createguid'] = this.guidService.guid();
            }
        });

        this.parentBusinessRelation.Contacts = this.contacts;
        this.parentBusinessRelationChange.emit(this.parentBusinessRelation);
    }

    private setupTable() {
        const nameCol = new UniTableColumn('Info.Name', 'Navn',  UniTableColumnType.Text).setWidth('200px');
        const titleCol = new UniTableColumn('Role', 'Rolle',  UniTableColumnType.Text);
        const phoneCol = new UniTableColumn('Info.DefaultPhone.Number', 'Telefon',  UniTableColumnType.Text);
        const emailCol = new UniTableColumn('Info.DefaultEmail.EmailAddress', 'E-postadresse',  UniTableColumnType.Text);

        const isMainContactCol = new UniTableColumn('_maincontact', 'Hovedkontakt', UniTableColumnType.Text, false)
            .setTemplate((item) => {
                if (typeof item._maincontact === 'boolean' && item._maincontact ) {
                    return 'Ja';
                }
                return '';
            });

        const defaultRowModel = {
            Role: '',
            Info: {
                Name: '',
                ParentBusinessRelationID: this.parentBusinessRelation.ID,
                DefaultEmail: { EmailAddress: null },
                DefaultPhone: { Number: null }
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
            action: row => {
                if (row.ID) {
                    this.parentBusinessRelation.DefaultContactID = row.ID;
                    this.contacts = this.contacts.map(contact => {
                        contact['_maincontact'] = contact.ID === row.ID;
                        return contact;
                    });

                    this.onDataChange();
                } else {
                    this.toastService.addToast(
                        'Lagre endringene dine først',
                        ToastType.warn, 10,
                        'Du må lagre endringene før du setter hovedkontakten'
                    );
                }
            },
        });

        this.contactTableConfig = new UniTableConfig('common.contacts', true)
            .setDeleteButton(true)
            .setContextMenu(contextMenuItems)
            .setDefaultRowData(defaultRowModel)
            .setColumns([nameCol, titleCol, isMainContactCol, phoneCol, emailCol]);
    }
}
