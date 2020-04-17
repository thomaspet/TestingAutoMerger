import {UniTableConfig} from '@uni-framework/ui/unitable';
import {Ticker} from '@app/services/services';

export const TickerTableConfigOverrides: {
    [tickerCode: string]: (tableConfig: UniTableConfig, ticker?: Ticker, isSubTicker?: boolean) => UniTableConfig
} = {
    journalentryline_list: (config, ticker, isSubTicker) => {
        if (isSubTicker) {
            return config;
        }

        return config.setQuickFilters([
            {
                field: 'Period.AccountYear',
                operator: 'eq',
                label: 'Regnskapsår',
                ignoreColumnVisibility: true,
                width: '10rem'
            },
            { field: 'Account.AccountNumber', width: '10rem' },
            { field: 'SubAccount.AccountNumber', width: '10rem' },
            { field: 'JournalEntryLine.Amount', width: '10rem' },
            {
                field: '_showCredited',
                type: 'checkbox',
                label: 'Vis krediterte',
                filterGenerator: isChecked => isChecked ? '' : 'isnull(StatusCode,0) ne 31004'
            }
        ]);
    },
    bank_list: (config, ticker) => {
        const activeFilter = ticker?.Filters?.find(f => f.IsActive);
        if (activeFilter?.Code === 'incomming_without_match') {
            return config.setQuickFilters([{
                field: 'show_hidden_payments',
                label: 'Vis skjulte betalinger',
                type: 'checkbox',
                filterGenerator: isChecked => isChecked ? '' : 'isnull(StatusCode,0) ne 44020'
            }]);
        }

        return config;
    }
};
