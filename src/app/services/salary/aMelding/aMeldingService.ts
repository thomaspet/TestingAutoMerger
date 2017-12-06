import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {AmeldingData} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {AltinnAuthenticationData} from '../../../models/AltinnAuthenticationData';

@Injectable()
export class AMeldingService extends BizHttp<AmeldingData> {

    public internalAmeldingStatus: Array<any> = [
        {Code: 1, Text: 'Generert'},
        {Code: 2, Text: 'Innsendt'},
        {Code: 3, Text: 'Tilbakemelding hentet'}
    ];

    public periodsInYear(): Array<any> {
        return [
            {period: 1, name: 'Januar'},
            {period: 2, name: 'Februar'},
            {period: 3, name: 'Mars'},
            {period: 4, name: 'April'},
            {period: 5, name: 'Mai'},
            {period: 6, name: 'Juni'},
            {period: 7, name: 'Juli'},
            {period: 8, name: 'August'},
            {period: 9, name: 'September'},
            {period: 10, name: 'Oktober'},
            {period: 11, name: 'November'},
            {period: 12, name: 'Desember'}
        ];
    }

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = AmeldingData.RelativeUrl;
        this.entityType = AmeldingData.EntityType;
    }

    public getHelptext(name: string) {
        let helpText: string = '';
        switch (name.toLowerCase()) {
            case 'summary':
                helpText = 'Her vises status for aktuell valgt a-melding.  Merk at det kan være sendt flere a-meldinger for samme periode.  Denne vises kun valgt a-melding.  Oppsummering her vises innhold i a-melding sendt fra systemet og ikke tilbakemelding.';
                break;
            case 'aga':
                helpText = 'Her vises aga beregnet av systemet fordelt på virksomheter og spesifisering for pensjon og refusjon fra nav.';
                break;
            case 'receipt':
                helpText = 'Her vises oppsummert innholdet for alle tilbakemeldinger for gjeldende periode.  Inneholder tilbakemeldingen avvik vil det vises her.  Inneholder tilbakemeldingen flere perioder vises det også her.  I listen vises en id for hver a-melding og status for a-meldingene, om de er erstattet, slettet osv.';
                break;
            case 'period':
                helpText = 'Her vises både beløp frå a-melding sendt fra systemet og tilbakemelding.  Er det sendt flere a-meldinger så vises det i listen.  Merk at summen som vises her er for 1 periode, og at ved terminbetaling må en slå sammen 2 perioder.  Rapport for terminperioder med summerte beløp finnes under rapporter.  Der finnes også kontonummer og kidnr.';
                break;
            case 'generate':
                helpText = 'For å få fram data i dette bildet må du generere a-melding.  Du kan generere så mange a-meldinger du vil før du sender inn til altinn. Generer a-melding for å kontrollere dataene dine.  Genereres ny a-melding uten å ha sendt inn, så skrives det over det du har fra før.  Det er alltid siste a-melding som er generert som sendes ved innsending til altinn.  Har du sendt inn a-melding og vil genrere en ny så går det fint an.  Den nye a-meldingen vil da bli merket med 2-tall eller høyere alt etter hvor mange ganger a-meldingen er sendt inn.  Valg for generering av ny a-melding etter innsending finnes i den grønne knappen, bruk pil for å finne andre valg enn det som systemet foreslår.';
                break;
            case 'send':
                helpText = 'Viser info om aktuell a-melding.  Merk at denne statusen vises for den a-meldingen som er aktiv i bildet.  En velger hvilken a-melding en vil vise i statusbar der det står et lite tall, 2 eller høyere.  Finnes det ikke tall i statusbaren så er det kun sendt 1 a-melding for perioden.';
                break;
            case 'getreceipt':
                helpText = 'Er a-melding sendt inn og denne fortsatt er rød, må tilbakemelding hentes.  Innholdet i tilbakemeldingen vises under valget Tilbakemelding og Periodeoppsummering.  Systemet vil også oppdatere feltene for aga og forskuddstrekk i Statusbaren når a-melding er hentet.  Husk å kontroller at tilbakemelding har status "Mottatt" og at det ikke er differanser på aga og forskuddstrekk fra system.';
                break;
            default:
                break;
        }

        return helpText;
    }

    public getAMeldingWithFeedback(id: number | string): Observable<any> {
        if (id !== 0) {
            return this.Get(id);
        }
    }

    public getAMeldingForPeriod(periode: number, currentYear: number): Observable<AmeldingData[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL)
            .send({filter: 'period eq ' + periode + ' and year eq ' + currentYear})
            .map(response => response.json());
    }

    public getAMeldingFile(id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=get-amelding`)
            .send()
            .map(response => response.json());
    }

    public getAmeldingFeedbackFile(id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=get-feedback`)
            .send()
            .map(response => response.json());
    }

    public sendAMelding(id: number) {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=send`)
            .send()
            .map(response => response.json());
    }

    public postAMelding(period: number, amldType: number, currYear: number) {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody( {
                'period': period,
                'year': currYear,
                'type': amldType,
                'replacesID': 0
            })
            .withEndPoint(this.relativeURL)
            .send()
            .map(response => response.json());
    }

    public getAmeldingFeedback(id: number, authData: AltinnAuthenticationData): Observable<AmeldingData> {
        const headers = {
            'x-altinn-userid': authData.userID,
            'x-altinn-password': authData.password,
            'x-altinn-pinmethod': authData.preferredLogin,
            'x-altinn-pin': authData.pin
        };

        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withHeaders(headers)
            .withEndPoint(this.relativeURL + `/${id}?action=feedback`)
            .send()
            .map(response => response.json());
    }

    public getAmeldingSumUp(id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`ameldingsums/${id}?action=get-sumup`)
            .send()
            .map(response => response.json());
    }
}
