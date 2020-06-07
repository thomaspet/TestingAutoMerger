// tslint:disable: indent
import {Injectable} from '@angular/core';
import {JournalEntryService} from '@app/services/services';
import { Observable, observable } from 'rxjs';

export interface ISmartBookingResult {
	message?: string;
	account?: Account;
	error?: Error;
	visible?: boolean;
}

@Injectable()
export class SmartBookingHelperClass {

	LIMIT_PERCENTAGE = 65;

	constructor ( private journalEntryService: JournalEntryService ) {}

	runSmartBooking(orgNumber: string): Observable<ISmartBookingResult> {

		const response: ISmartBookingResult = {
			message: '',
			account: null,
			error: null,
			visible: false
		};

		return new Observable(observer => {

			let accountNumber: string;
			this.journalEntryService.getLedgerSuggestions(orgNumber).switchMap(result => {
				if (!result?.Suggestion || !result.Suggestion?.AccountNumber) {
					response.message = 'Smart bokføring fant ingen kontoforslag.';
					return Observable.of([]);
				}

				let percent = result.Suggestion.PercentWeight || 0;
				const counter = result.Suggestion.Counter;

				if ((counter < 15 && result.Source === 3) || (counter < 20 && result.Source === 2)) {
					percent = percent > 45 ? 45 : percent;
				}

				// If the suggestion does not meet limit criteria, dont do anything, just return..
				if (result.Source > 1 && percent < this.LIMIT_PERCENTAGE) {
					// Found account but not good enough..
					response.message = 'Klarte ikke finne god nok match til å foreslå en konto.';
					return Observable.of([]);
				}

				accountNumber = result.Suggestion.AccountNumber;
				response.message = result.Source === 1
					? 'Kontoforslag basert på ditt firmas tidligere bokføringer på fakturaer fra denne leverandøren.'
					: result.Source === 2
					? 'Kontoforslag basert på bokføringer gjort på denne leverandøren i UniEconomy'
					: 'Kontoforslag basert på bokføringer gjort i UniEconomy på levernadører i samme bransje som valgt leverandør på din faktura.';

				return this.journalEntryService.getAccountsFromSuggeestions(result.Suggestion.AccountNumber.toString().substr(0, 3));
			}).subscribe(accounts => {
				if (accounts.length) {
					response.account = accounts.find(acc => acc.AccountNumber === accountNumber) || accounts[0];
				} else if (!!accountNumber) {
					response.message = `Smart bokføring foreslo konto ${accountNumber}, men denne kontoen (og nærliggende kontoer) mangler i din kontoplan.`;
				}
				observer.next(response);
			}, err => {
				response.message = `Noe gikk galt da smart bokføring prøvde å hente bokføringsforslag. Prøv å start den manuelt igjen i menyen oppe til høyre.`;
				response.error = err;
				observer.next(response);
			});
		});
	}
}
