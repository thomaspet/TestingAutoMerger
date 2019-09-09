import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { UserService, ErrorService, ImportCentralService } from '@app/services/services';
import { Subject } from 'rxjs';
import { User } from '@uni-entities';
import *  as moment from 'moment';

@Component({
    selector: 'disclaimer-modal',
    templateUrl: './disclaimer-modal.html',
    styleUrls: ['./disclaimer-modal.sass']
})

export class DisclaimerModal implements OnInit, IUniModal {

    @Input() options: IModalOptions = {};

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    isSelected: boolean = false;
    loading$: Subject<any> = new Subject();
    user: User;
    hasAgreed: boolean = false;
    approvedDate: string;
    busy: boolean = true;

    constructor(
        private userService: UserService,
        private importCentralService: ImportCentralService,
        private errorService: ErrorService) {
        this.userService.getCurrentUser().subscribe(res => {
            if (res) {
                this.user = res;
                this.hasAgreed = res.HasAgreedToImportDisclaimer;
                this.busy = false;
                if (this.hasAgreed) {
                    this.busy = true;
                    this.importCentralService.getDiclaimerAudit(this.user.ID).subscribe(audit => {
                        if (audit) {
                            this.busy = false;
                            this.approvedDate = moment(audit.pop().CreatedAt).format('DD.MM.YY');
                        }
                    })
                }
            }
        }, err => {
            this.busy = false;
            this.errorService.handle('En feil oppstod, vennligst prøv igjen senere')
        });
    }

    public ngOnInit() { }

    public proceed() {
        this.loading$.next(true);
        this.user.HasAgreedToImportDisclaimer = this.isSelected;
        this.userService.Put(this.user.ID, this.user).subscribe(res => {
            if (res.HasAgreedToImportDisclaimer) {
                this.onClose.emit(true);
            } else {
                this.errorService.handle('En feil oppstod, vennligst prøv igjen senere');
            }
            this.loading$.next(false);
        }, err => {
            this.errorService.handle('En feil oppstod, vennligst prøv igjen senere');
            this.loading$.next(false);
        })
    }

    public close() {
        this.onClose.emit();
    }

}

