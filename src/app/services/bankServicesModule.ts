import {NgModule, ModuleWithProviders} from '@angular/core';

import {BankStatementService} from './bank/bankStatementService';
import {BankStatementEntryService} from './bank/bankStatementEntryService';
import {BankStatementSession} from './bank/bankstatementsession';
import {BankJournalSession} from './bank/bankJournalSession';
import {BankStatementRuleService} from './bank/bankStatementRuleService';
import {BrunoOnboardingService} from './bank/BrunoOnboardingService';
import {ZDataPaymentService} from './bank/ZDataPaymentService';

export * from './bank/bankStatementService';
export * from './bank/bankStatementEntryService';
export * from './bank/bankstatementsession';
export * from './bank/bankJournalSession';
export * from './bank/bankStatementRuleService';
export * from './bank/BrunoOnboardingService';
export * from './bank/ZDataPaymentService';

@NgModule()
export class BankServicesModule {
    static forRoot(): ModuleWithProviders<BankServicesModule> {
        return {
            ngModule: BankServicesModule,
            providers: [
                BankStatementService,
                BankStatementEntryService,
                BankStatementRuleService,
                BankStatementSession,
                BankJournalSession,
                BrunoOnboardingService,
                ZDataPaymentService
            ]
        };
    }
}
