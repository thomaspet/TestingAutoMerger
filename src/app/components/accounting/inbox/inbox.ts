import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {SupplierInvoiceService, FileService} from '@app/services/services';
import {NewOutgoingWizardModal} from './new-outgoing-wizard-modal';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import * as moment from 'moment';
import {
    UniModalService,
    EntityForFileUpload,
    UniFileUploadModal,
    ConfirmActions,
} from '@uni-framework/uni-modal';
import { File } from '@uni-entities';

@Component({
    selector: 'uni-inbox',
    templateUrl: './inbox.html',
    styleUrls: ['./inbox.sass']
})

export class UniInbox {

    TAG_NAMES = ['IncomingMail', 'IncomingEHF', 'IncomingTravel', 'IncomingExpense'];
    inboxList: any[] = [];
    draftList: any[] = [];
    fileIds: number[] = [];
    currentFileID: number = 0;
    showPreview: boolean = false;
    dataLoaded: boolean = false;
    toolbarConfig = {
        title: 'NAVBAR.INBOX',
        buttons: [{
            label: 'Last opp',
            class: 'inbox-upload-button',
            icon: 'cloud_upload',
            action: () => this.uploadFile()
        }]
    };

    constructor (
        private supplierInvoiceService: SupplierInvoiceService,
        private modalService: UniModalService,
        private fileService: FileService,
        private toast: ToastService,
        private tabService: TabService,
        private router: Router
    ) { }

    ngOnInit() {
        this.getDataAndLoadList();

        this.tabService.addTab({
            name: 'NAVBAR.INBOX',
            url: '/accounting/inbox',
            moduleID: UniModules.Inbox,
            active: true
        });
    }

    getDataAndLoadList() {
        this.supplierInvoiceService.fetch('filetags/' + this.TAG_NAMES.join('|') + '/0?action=get-supplierInvoice-inbox')
        .subscribe((reponse) => {
            this.inboxList = reponse.map((item) => {
                item._date = moment(item.CreatedAt).format('DD.MMM YYYY');
                return item;
            });

            // Open first document by default
            if (this.inboxList.length) {
                this.onDocumentClick(this.inboxList[0]);
            }
            this.dataLoaded = true;
        });
    }

    onDocumentClick(item) {
        this.fileIds = [item.ID];
        this.currentFileID = item.ID;
        this.showPreview = true;
    }

    registerBuy(item, event) {
        event.stopPropagation();
        this.modalService.open(NewOutgoingWizardModal).onClose.subscribe((res) => {
            if (res) {
                this.router.navigateByUrl(res.route + item.ID);
            }
        });
    }

    deleteDocument(item: File, event: MouseEvent) {
        event.stopPropagation();

        // Check if file is already linked to an entity
        this.fileService.getLinkedEntityID(item.ID).subscribe(links => {
            let modalMessage = 'Vennligst bekreft sletting av fil';

            if (links.length) {
                modalMessage = 'ACCOUNTING.SUPPLIER_INVOICE.FILE_IN_USE_MSG';
            }

            this.modalService.confirm({
                header: 'Slett fil',
                message: modalMessage
            }).onClose.subscribe(res => {
                if (res === ConfirmActions.ACCEPT) {
                    if (item.ID === this.currentFileID) {
                        this.closePreview();
                    }
                    this.supplierInvoiceService.send('files/' + item.ID, undefined, 'DELETE').subscribe(
                        () => {
                            this.toast.addToast('Fil slettet', ToastType.good, 5);
                            this.getDataAndLoadList();
                        }, error => {
                            this.fileService.tag(item.ID, item.FileTags[0].TagName, 90000).subscribe(() => {
                                this.toast.addToast('Fil fjernet fra innboks', ToastType.good, 2);
                            }, err => {
                                console.error(err);
                            });
                        }
                    );
                }
            });
        });
    }

    closePreview() {
        this.showPreview = false;
        this.currentFileID = 0;
        this.fileIds = [];
    }

    uploadFile() {
        this.modalService.open(
            UniFileUploadModal,
            {closeOnClickOutside: false, buttonLabels: { accept: 'Legg i innboks' }, data: { entity: EntityForFileUpload.EXPENSE }} )
        .onClose.subscribe((response) => {
            console.log(response);
            if (!!response) {
                this.getDataAndLoadList();
            }
        });
    }
}
