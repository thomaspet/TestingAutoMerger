import {ChangeDetectorRef, Component} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorService, StatisticsService } from '@app/services/services';
import { BusinessRelation } from '@uni-entities';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AnnualSettlementService } from '../annual-settlement.service';

@Component({
	selector: 'writeof-difference',
	templateUrl: './annual-settlement-writeof-difference.html',
	styleUrls: ['./annual-settlement-writeof-difference.sass']
})

// FremforbartUnderskudd - 	Akkumulert fremført skattemessig underskudd
// FinnesProsjekterKey - 	Bruker firma tilvirkningskontrakter

export class AnnualSettlementWriteofDifferenceStep {

	busy = true;
	onDestroy$ = new Subject();
	annualSettlement: any;
	step = 0;

	stepContentArray = [
		{
			title: 'Eiendeler',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 0
		},
		{
			title: 'Tilvirkningskontrakter',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 1
		},
		{
			title: 'Varelager',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 2
		},
		{
			title: 'Gevinst og tap',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 3
		},
		{
			title: 'Skattemessig verdi på aksjer',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 4
		},
		{
			title: 'Akkumulert fremført skattemessig underskudd',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 5
		},

		// This is removed if not valid for the current company
		{
			title: 'Coronapakke for firma med underskudd 2020',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 6
		},
		{
			title: 'Oppsummering av endringer i forskjeller',
			text: ``,
			diff: 0,
			step: 7,
			summaryTitle: 'Grunnlag for utsatt skatt/utsatt skattefordel'
		}
	];

	infoContent: any = this.stepContentArray[0];

	contractTypes = [
		{ value: 1, label: 'Løpende avregning' },
		{ value: 2, label: 'Fullført kontraktsmetode' }
	];

	ct = { value: 0, label: '' };

	runningSettlementIncommingProject = null;
	runningSettlementOutgoingProject = null;
	runningSettlementYearStart = null;
	runningSettlementYearEnd = null;

	incommingProjects = null;
	outgoingProjects = null;

	yearSelectConfig = {
		template: (item) => item.label,
		searchable: false,
		placeholder: 'Velg metode'
	};

	accountCount2Query = `model=JournalEntryLine&select=count(ID) as count&expand=Account`
	+ `&filter=( Account.Accountnumber ge '1300' and Account.AccountNumber le '1319') or `
	+ `( Account.Accountnumber ge '1350' and Account.AccountNumber le '1399') or `
	+ `( Account.Accountnumber ge '1800' and Account.AccountNumber le '1899') or `;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private statisticsService: StatisticsService,
		private annualSettlementService: AnnualSettlementService,
		private changeDetector: ChangeDetectorRef,
		private errorService: ErrorService,
		private toastService: ToastService
	) {	}

	ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
			Observable.forkJoin([
				this.annualSettlementService.getAnnualSettlement(id),
				this.statisticsService.GetAllUnwrapped(`model=Project&select=count(ID) as count`),
				this.annualSettlementService.getAccountBalanceForSet(1400, 1489, new Date().getFullYear() - 1),

				this.annualSettlementService.getAccountBalanceForSet(1300, 1319, new Date().getFullYear() - 1),
				this.annualSettlementService.getAccountBalanceForSet(1350, 1399, new Date().getFullYear() - 1),
				this.annualSettlementService.getAccountBalanceForSet(1800, 1899, new Date().getFullYear() - 1)
			]).subscribe(([as, projectCount, balance1, balance2, balance3, balance4]) => {
				this.annualSettlement = as;

				debugger

				this.annualSettlement.Fields.FinnesProsjekterKey =
					this.annualSettlement.Fields.FinnesProsjekterKey === 'true';
				this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLagerIFjor =
					this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLagerIFjor === 'true';
				this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLager =
					this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLager === 'true';

				if (this.annualSettlement.Fields.FinnesProsjekterKey) {
					if (!this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektSkattemessigFjoraret &&
						!this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektSkattemessig) {
							this.ct = this.contractTypes[1];
						} else {
							this.ct = this.contractTypes[0];
						}
				}

				if (projectCount[0].count <= 0) {
					const index = this.stepContentArray.findIndex(step => step.step === 1);
					this.stepContentArray.splice(index, 1);
				}

				if (!balance1) {
					const index = this.stepContentArray.findIndex(step => step.step === 2);
					this.stepContentArray.splice(index, 1);
				}

				if (!balance2 && !balance3 && balance4) {
					const index = this.stepContentArray.findIndex(step => step.step === 4);
					this.stepContentArray.splice(index, 1);
				}

				// Check if customer has valid data for Corona pack here.. For now, just remove it
				if (true) {
					const index = this.stepContentArray.findIndex(step => step.step === 6);
					this.stepContentArray.splice(index, 1);
				}

				this.changeDetector.markForCheck();
				this.busy = false;
			}, err => {
				this.errorService.handle(err);
				this.goBack();
			});
		});
	}

	onStep(direction: number) {
		if (direction > 0) {
			this.busy = true;
			this.checkSaveAndContinue(direction)
		} else {
			this.step += direction;
			this.setStepInfoContent();
		}
	}

	checkSaveAndContinue(direction: number) {

		if (this.step === this.stepContentArray.length && direction > 0) {
			this.annualSettlementService.moveFromStep3ToStep4(this.annualSettlement).subscribe(() => {
				this.toastService.addToast('Informasjon lagret', ToastType.good, 6, 'Oppdatert informasjon på avskrivninger og forskjeller er lagret');
				this.goBack();
				return;
			}, err => {
				this.toastService.addToast('Informasjon lagret, men noe gikk galt', ToastType.bad, 6, 'Klarte ikke fullføre steg 3. Se gjennom data og prøv igjen');
				this.goBack();
				return;
			});
		}

		if (this.infoContent.step === 2 && this.annualSettlement.Fields.FinnesProsjekterKey) {
			if (this.ct.value === 2) {
				this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektSkattemessigFjoraret = null;
				this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektSkattemessig = null;
			}
		}

		if (this.infoContent.step === 3) {
			if (!this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLager) {
				this.annualSettlement.Fields.LagerbeholdningRavarerHalvfabrikataNedskrivning = null;
				this.annualSettlement.Fields.LagerbeholdningVarerIArbeidNedskrivning = null;
				this.annualSettlement.Fields.LagerbeholdningFerdigEgentilvirkedeVarerNedskrivning = null;
				this.annualSettlement.Fields.LagerbeholdningInnkjopteVarerVideresalgNedskrivning = null;
			}

			if (!this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLagerIFjor) {
				this.annualSettlement.Fields.LagerbeholdningRavarerHalvfabrikataNedskrivningFjoraret = null;
				this.annualSettlement.Fields.LagerbeholdningVarerIArbeidNedskrivningFjoraret = null;
				this.annualSettlement.Fields.LagerbeholdningFerdigEgentilvirkedeVarerNedskrivningFjoraret = null;
				this.annualSettlement.Fields.LagerbeholdningInnkjopteVarerVideresalgNedskrivningFjoraret = null;
			}
		}

		this.annualSettlementService.updateAnnualSettlement(this.annualSettlement).subscribe(() => {
			this.step += direction;
			this.setStepInfoContent();
			this.recalc();
			this.busy = false;
		}, err => {
			this.busy = false;
		});
	}

	setStepInfoContent() {
		this.infoContent = this.stepContentArray[this.step];
	}

	// This is called when a value on step 2 is changed
	recalc(step: number = this.step) {
		this.infoContent.diff = 0;

		switch (this.infoContent.step) {
			case 1:
				if (this.ct.value === 1) {
					this.infoContent.diff = parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektFjoraret || 0)
					+ parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntekt || 0)
					+ parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektSkattemessigFjoraret  || 0)
					+ parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektSkattemessig  || 0);
				} else if (this.ct.value === 2) {
					this.infoContent.diff = parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektFjoraret || 0)
					+ parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntekt || 0);
				}
				break;

			case 2:
				const thisYear = parseFloat(this.annualSettlement.Fields.LagerbeholdningRavarerHalvfabrikataNedskrivning || 0)
					+ parseFloat(this.annualSettlement.Fields.LagerbeholdningVarerIArbeidNedskrivning || 0)
					+ parseFloat(this.annualSettlement.Fields.LagerbeholdningFerdigEgentilvirkedeVarerNedskrivning  || 0)
					+ parseFloat(this.annualSettlement.Fields.LagerbeholdningInnkjopteVarerVideresalgNedskrivning  || 0);

				const lastYear = parseFloat(this.annualSettlement.Fields.LagerbeholdningRavarerHalvfabrikataNedskrivningFjoraret || 0)
					+ parseFloat(this.annualSettlement.Fields.LagerbeholdningVarerIArbeidNedskrivningFjoraret || 0)
					+ parseFloat(this.annualSettlement.Fields.LagerbeholdningFerdigEgentilvirkedeVarerNedskrivningFjoraret  || 0)
					+ parseFloat(this.annualSettlement.Fields.LagerbeholdningInnkjopteVarerVideresalgNedskrivningFjoraret  || 0);

					this.infoContent.diff = 0
					+ parseFloat(this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLager ? thisYear + '' : '0')
					- parseFloat(this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLagerIFjor ? lastYear + '' : '0');

				break;
			
			case 3:
				this.infoContent.diff = parseFloat(this.annualSettlement.Fields.GevinstTapskontoSaldoFjoraret || 0);
				break;
			case 4:
				// NOT READY
				this.infoContent.diff = 0;
				break;
			case 5: 
				this.infoContent.diff = parseFloat(this.annualSettlement.Fields.FremforbartUnderskudd || 0);
				break;
		}

		this.stepContentArray[this.stepContentArray.length - 1].diff = this.stepContentArray
			.map((step) => {
				if (step.step !== 7) {
					return step.diff;
				} 
			}).reduce((accumulator, currentValue) => (accumulator || 0) + (currentValue || 0));
	}

	goBack() {
		this.router.navigateByUrl('/accounting/annual-settlement');
	}

}
