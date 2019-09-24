import {NgModule, ModuleWithProviders} from '@angular/core';

import {BankStatementService} from './bank/bankStatementService';
import {BankStatementEntryService} from './bank/bankStatementEntryService';
import {BankStatementSession} from './bank/bankstatementsession';
import {BankJournalSession} from './bank/bankJournalSession';

export * from './bank/bankStatementService';
export * from './bank/bankStatementEntryService';
export * from './bank/bankstatementsession';
export * from './bank/bankJournalSession';

@NgModule()
export class BankServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: BankServicesModule,
            providers: [
                BankStatementService,
                BankStatementEntryService,
                BankStatementSession,
                BankJournalSession
            ]
        };
    }
}
