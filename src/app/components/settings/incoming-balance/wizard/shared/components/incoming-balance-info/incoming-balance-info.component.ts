import { Component, Input, OnInit } from '@angular/core';
import { IncomingBalanceNavigationService } from '@app/components/settings/incoming-balance/shared/services/incoming-balance-navigation.service';
import { BrowserStorageService } from '@app/services/services';
import { JournalEntry, JournalEntryLineDraft } from '@uni-entities';
import { take } from 'rxjs/operators';

@Component({
  selector: 'uni-incoming-balance-info',
  templateUrl: './incoming-balance-info.component.html',
  styleUrls: ['./incoming-balance-info.component.sass']
})
export class IncomingBalanceInfoComponent implements OnInit {
    @Input() noIcons: boolean;
    @Input() isBooked: boolean;
    @Input() journalEntry: JournalEntry;
    @Input() journalEntryDraftLines: JournalEntryLineDraft;
    isHidden: boolean;

    constructor(
        public navigationService: IncomingBalanceNavigationService,
        private browserStorageService: BrowserStorageService,
    ) { }

    ngOnInit(): void {
        this.navigationService
            .currentPath$
            .pipe(
                take(1)
            )
            .subscribe(path => this.isHidden = this.browserStorageService.getItemFromCompany(this.getStorageName(path)));
    }

    togleHidden() {
        this.isHidden = !this.isHidden;
        this.navigationService
            .currentPath$
            .pipe(
                take(1),
            )
            .subscribe(path => this.browserStorageService.setItemOnCompany(this.getStorageName(path), this.isHidden));
    }

    private getStorageName(path: string) {
        return `incoming-balance-info-${path}-hidden`;
    }

}
