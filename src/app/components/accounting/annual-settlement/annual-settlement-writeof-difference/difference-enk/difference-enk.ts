import {ChangeDetectorRef, Component} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorService, StatisticsService } from '@app/services/services';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AnnualSettlementService } from '../../annual-settlement.service';

@Component({
    selector: 'writeof-difference-enk',
    templateUrl: './difference-enk.html',
    styleUrls: ['../annual-settlement-writeof-difference.sass']
})

export class AnnualSettlementWriteofDifferenceEnkStep {

    stepContentArray = [
		{
			title: 'Eiendeler',
			text: ` <p>
                For at vi skal kunne fylle ut korrekte opplysninger til Skatteetaten må du registrere alle dine anleggsmidler i Eiendeler i systemet. Under får du en oversikt over dine eiendeler.
                Eiendeler i saldogruppe A-D summeres per gruppe. Avskrivninger på dine eiendeler må bokføres før du kan gå videre til neste steg. </p> `,
			diff: 0,
            step: 0,
            buttonText: 'Gå videre'
		},
		{
			title: 'Fast eiendom',
			text: ` <p>
				Her finner du en oversikt over dine faste eiendommer som er registrert i systemet. Fyll inn riktig kommunenummer, gårdsnummer og bruksnummer, disse opplysningene innrapporteres via årsavslutning til Skatteetaten. </p> `,
			diff: 0,
            step: 1,
            buttonText: 'Lagre og gå videre'
		},
		{
			title: 'Foretningsbygg anskaffet før 01.01.1985',
			text: ` <p>
                Her finner du en oversikt over dine foretningsbygg som er anskaffet før 01.01.1984. Du må fylle ut historisk kostpris, nedskrevet verdi pr. 01.01.1984 og nedre grense for avskrivning på disse
                foretningsbyggene. Du finner tallene i RF-1084 (post 113, 114 og 115) som du leverte ifjor. </p> `,
			diff: 0,
            step: 2,
            buttonText: 'Lagre og gå videre'
		},
		{
			title: 'Transportmiddel næring',
			text: ` <p>
                Du må velge "Ja" og fylle ut informasjon i feltene på dette trinnet dersom du har transportmidler (bil, lastebil, buss og lignende) i firmaet. Dersom du eide transportmiddelet i fjor, kan du 
                finne opplysninger i fjorårets innsendte skjema RF-1125. </p> `,
			diff: 0,
			step: 3,
            summaryTitle: 'Sum inngående balanse gevinst og tap',
            buttonText: 'Lagre og gå videre'
		},
		{
			title: 'Elektronisk kommunikasjon',
			text: ` <p> Privat bruk av telefon og bredbånd til eier av firmaet. </p> `,
			diff: 0,
            step: 4,
            buttonText: 'Lagre og fullfør'
		},
	];

    infoContent: any = this.stepContentArray[0];
    showInfo = true;
    busy = false;
    step = 0;
    onDestroy$ = new Subject();
    annualSettlement: any;

    constructor (
        private router: Router,
        private route: ActivatedRoute,
		private statisticsService: StatisticsService,
        private annualSettlementService: AnnualSettlementService,
        private changeDetector: ChangeDetectorRef,
		private errorService: ErrorService,
		private toastService: ToastService,
    ) { }

    ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            Observable.forkJoin([
                this.annualSettlementService.getAnnualSettlement(id)
            ]).subscribe(([settlement]) => {
                this.annualSettlement = settlement;
            });
            
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
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

        if (this.infoContent.step === 4 && direction > 0) {
            this.goBack();
			// this.annualSettlementService.moveFromStep3ToStep4(this.annualSettlement).subscribe(() => {
			// 	this.toastService.addToast('Informasjon lagret', ToastType.good, 6, 'Oppdatert informasjon på avskrivninger og forskjeller er lagret');
			// 	this.goBack();
			// 	return;
			// }, err => {
			// 	this.toastService.addToast('Informasjon lagret, men noe gikk galt', ToastType.bad, 6, 'Klarte ikke fullføre steg 3. Se gjennom data og prøv igjen');
			// 	this.goBack();
			// 	return;
			// });
        } else {
            this.step += direction;
            this.setStepInfoContent();
            this.busy = false;
            // Continue here
        }
    }

    setStepInfoContent() {
		this.infoContent = this.stepContentArray[this.step];
	}

    goBack() {
		this.router.navigateByUrl('/accounting/annual-settlement');
	}
}