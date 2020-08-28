import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { AmeldingData, PayrollRunInAmeldingPeriod } from '@uni-entities';
import { AltinnAuthenticationData } from '@app/models/AltinnAuthenticationData';

@Injectable()
export class AMeldingService extends BizHttp<AmeldingData> {

    private alleAvvikNoder: any[] = [];
    private mottattLeveranserIPerioden: any[] = [];
    private identificationObject: any = {};
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
                helpText = `Her vises status for aktuell valgt a-melding.
                            Merk at det kan være sendt flere a-meldinger for samme periode.
                            Denne viser kun valgt a-melding.
                            Oppsummering viser innhold i a-melding sendt fra systemet, ikke tilbakemelding.`;
                break;
            case 'aga':
                helpText = 'Her vises aga beregnet av systemet fordelt på virksomheter og spesifisering for pensjon og refusjon fra nav.';
                break;
            case 'receipt':
                helpText = `Her vises oppsummert innholdet for alle tilbakemeldinger for gjeldende periode.
                            Inneholder tilbakemeldingen avvik vil det vises her.
                            Inneholder tilbakemeldingen flere perioder vises det også her.
                            I listen vises en id for hver a-melding og status for a-meldingene, om de er erstattet, slettet osv.`;
                break;
            case 'period':
                helpText = `Her vises både beløp fra a-melding sendt fra systemet og tilbakemelding.
                            Er det sendt flere a-meldinger så vises det i listen.
                            Merk at summen som vises her er for 1 periode, og at ved terminbetaling må en slå sammen 2 perioder.
                            Rapport for terminperioder med summerte beløp finnes under rapporter.
                            Der finnes også kontonummer og kidnr.`;
                break;
            case 'generate':
                helpText = `For å få fram data i dette bildet må du generere a-melding.
                            Du kan generere så mange a-meldinger du vil før du sender inn til altinn.
                            Generer a-melding for å kontrollere dataene dine.
                            Genereres ny a-melding uten å ha sendt inn, så erstattes den du har fra før.
                            Det er alltid siste a-melding som er generert som sendes ved innsending til altinn.
                            Har du sendt inn a-melding og vil generere en ny så går det fint.
                            Den nye a-meldingen vil da bli merket med 2-tall eller høyere,
                            alt etter hvor mange ganger a-meldingen er sendt inn.
                            Valg for generering av ny a-melding etter innsending finnes i den grønne knappen,
                            bruk pil for å finne andre valg enn det som systemet foreslår.`;
                break;
            case 'send':
                helpText = `Viser info om aktuell a-melding.
                            Merk at denne statusen vises for den a-meldingen som er aktiv i bildet.
                            En velger hvilken a-melding en vil vise i statusbar der det står et lite tall, 2 eller høyere.
                            Finnes det ikke tall i statusbaren så er det kun sendt 1 a-melding for perioden.`;
                break;
            case 'getreceipt':
                helpText = `Er a-melding sendt inn og denne fortsatt er rød, må tilbakemelding hentes.
                            Innholdet i tilbakemeldingen vises under valget Tilbakemelding og Periodeoppsummering.
                            Systemet vil også oppdatere feltene for aga og forskuddstrekk i Statusbaren når a-melding er hentet.
                            Husk å kontroller at tilbakemelding har status "Mottatt",
                            og at det ikke er differanser på aga og forskuddstrekk fra system.`;
                break;
            default:
                break;
        }

        return helpText;
    }

    public getAMeldingWithFeedback(id: number | string, validate: boolean = false): Observable<any> {
        if (id !== 0) {
            if (validate) {
                return this.http
                    .asGET()
                    .usingBusinessDomain()
                    .withEndPoint(this.relativeURL + `/${id}?validate=true`)
                    .send()
                    .map(response => response.body);
            }
            return this.Get(id);
        }
    }

    public getPayrollrunsInAmeldingPeriod(period: number): Observable<PayrollRunInAmeldingPeriod[]> {
        return super.GetAction(null, 'payrollruns-in-amelding-period', `period=${period}`);
    }

    public getAMeldingForPeriod(periode: number, currentYear: number): Observable<AmeldingData[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL)
            .send({filter: 'period eq ' + periode + ' and year eq ' + currentYear})
            .map(response => response.body);
    }

    public getAMeldingFile(id: number): Observable<string> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=get-amelding`)
            .withHeader('accept', 'application/zip')
            .send({responseType: 'text'})
            .map(response => response.body);
    }

    public getAmeldingFeedbackFile(id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=get-feedback`)
            .withHeader('accept', 'application/zip')
            .send({responseType: 'text'})
            .map(response => response.body);
    }

    public sendAMelding(id: number) {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=send`)
            .send()
            .map(response => response.body);
    }

    public postAMelding(period: number, amldType: number, currYear: number, runID: number = null, replacesID = 0) {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody( {
                'period': period,
                'year': currYear,
                'type': amldType,
                'PayrollRunID': runID,
                'replacesID': replacesID,
            })
            .withEndPoint(this.relativeURL)
            .send()
            .map(response => response.body);
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
            .map(response => response.body);
    }

    public getAmeldingSumUp(id: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`ameldingsums/${id}?action=get-sumup`)
            .send()
            .map(response => response.body);
    }

    public getValidations(entity: any): string[] {
        if (entity && entity.employees) {
            return entity
            .employees
            .map(emp => emp.arbeidsforhold)
            .reduce((acc, curr) => [...acc, ...curr], [])
            .map(empl => empl.validations)
            .reduce((acc, curr) => [...acc, ...curr], []);
        }
        return [];
    }

    public getAvvikIAmeldingen(amelding: any): any[] {
        this.alleAvvikNoder = [];
        this.mottattLeveranserIPerioden = [];
        if (amelding.hasOwnProperty('feedBack')) {
            const feedback = amelding.feedBack;
            if (feedback !== null) {
                const alleMottak = amelding.feedBack.melding.Mottak;
                if (alleMottak instanceof Array) {
                    alleMottak.forEach(mottak => {
                        const pr = mottak.kalendermaaned;
                        const period = parseInt(pr.split('-').pop(), 10);
                        this.setMottattLeveranser(mottak.mottattLeveranse, period);
                        if (parseInt(pr.substring(0, pr.indexOf('-')), 10) === amelding.year) {
                            this.getAvvikRec(mottak, period);
                        }
                    });
                } else {
                    if (alleMottak.hasOwnProperty('kalendermaaned')) {
                        const pr = alleMottak.kalendermaaned;
                        const period = parseInt(pr.split('-').pop(), 10);
                        this.setMottattLeveranser(alleMottak.mottattLeveranse, period);
                        if (parseInt(pr.substring(0, pr.indexOf('-')), 10) === amelding.year) {
                            this.getAvvikRec(alleMottak, period);
                        }
                    } else {
                        // When altinn would not accept sent amelding, check for avvik
                        this.getAvvikRec(alleMottak, amelding.period);
                    }
                }
            }
        }
        return this.alleAvvikNoder;
    }

    public getLeveranserIAmeldingen(): any[] {
        return this.mottattLeveranserIPerioden.sort((curr, next) => {
            const periodDiff = curr.periode - next.periode;
            if (periodDiff) {
                return periodDiff < 0 ? -1 : 1;
            }
            const timediff = new Date(next.tidsstempelFraAltinn).getTime() - new Date(curr.tidsstempelFraAltinn).getTime();
            return timediff < 0 ? -1 : 1;
        });
    }

    public attachMessageIDsToLeveranser(leveranser: any[], ameldinger: AmeldingData[] = []): Observable<any[]> {
        const missingMessageIDs = leveranser
            .map(leveranse => [leveranse.meldingsId, leveranse.erstatterMeldingsId])
            .reduce((acc, lev) => [...acc, ...lev], [])
            .filter(id => !ameldinger.some(amld => amld.messageID === id))
            .filter((id, index, arr) => index === arr.findIndex(arrID => arrID === id));

        const obs = missingMessageIDs
            ? this.GetAll(`filter=${missingMessageIDs.map(id => `messageID eq '${id}'`).join(' or ')}`)
            : of([]);
        return obs
            .pipe(
                map(amld => [...amld, ...ameldinger]),
                map(amld => this.getLeveranserWithErstattMessageID(
                    this.getLeveranserWithMessageID(leveranser, amld),
                    amld))
            );
    }

    private getLeveranserWithMessageID(leveranser: any[], ameldinger: AmeldingData[]): any[] {
        return leveranser.map(leveranse => {
            let mldID = 0;
            ameldinger.forEach(amelding => {
                if (leveranse.meldingsId === amelding.messageID) {
                    mldID = amelding.ID;
                    return;
                }
            });
            leveranse['_messageID'] = mldID ? mldID : leveranse.meldingsId;
            return leveranse;
        });
    }

    private getLeveranserWithErstattMessageID(leveranser: any[], ameldinger: AmeldingData[]): any[] {
        return leveranser.map(leveranse => {
            let mldID = 0;
            ameldinger.forEach(amelding => {
                if (leveranse.erstatterMeldingsId === amelding.messageID) {
                    mldID = amelding.ID;
                    return;
                }
            });
            leveranse['_replaceMessageID'] = mldID ? mldID : leveranse.erstatterMeldingsId;
            return leveranse;
        });
    }

    private getAvvikRec(obj, period: number) {
        for (const propname in obj) {
            if (propname === 'avvik') {
                if (obj[propname] instanceof Array) {
                    obj[propname].forEach(avvik => {
                        this.buildAvvik(obj, avvik, period, ['arbeidsforholdId', 'yrke', 'beloep', 'fordel', 'alvorlighetsgrad']);
                        this.alleAvvikNoder.push(avvik);
                    });
                } else {
                    const avvik = obj[propname];
                    this.buildAvvik(obj, avvik, period, ['arbeidsforholdId', 'beloep', 'fordel', 'alvorlighetsgrad']);
                    this.alleAvvikNoder.push(avvik);
                }
            } else {
                if (typeof obj[propname] === 'object' && obj[propname] !== null) {
                    if (propname === 'inntektsmottaker') {
                        if (obj[propname].hasOwnProperty('identifiserendeInformasjon')) {
                            this.identificationObject = obj[propname]['identifiserendeInformasjon'];
                        }
                        this.getAvvikWithAncestorInfoRec(obj[propname], period);
                        this.identificationObject = {};
                    } else {
                        this.getAvvikRec(obj[propname], period);
                    }
                }
            }
        }
    }

    private getAvvikWithAncestorInfoRec(obj, period: number) {
        for (const propname in obj) {
            if (propname === 'avvik') {
                if (obj[propname] instanceof Array) {
                    obj[propname].forEach(avvik => {
                        this.buildAvvik(obj, avvik, period, ['arbeidsforholdId', 'yrke', 'beloep', 'fordel']);
                        this.alleAvvikNoder.push(avvik);
                    });
                } else {
                    const avvik = obj[propname];
                    this.buildAvvik(obj, avvik, period, ['arbeidsforholdId', 'beloep', 'fordel']);
                    this.alleAvvikNoder.push(avvik);
                }
            } else {
                if (typeof obj[propname] === 'object' && obj[propname] !== null) {
                    this.getAvvikWithAncestorInfoRec(obj[propname], period);
                }
            }
        }
    }

    private buildAvvik(obj, avvik, period: number, props: string[]) {
        props.forEach(prop => {
            if (obj.hasOwnProperty(prop)) {
                avvik[prop] = obj[prop];
            }
        });
        if (obj.hasOwnProperty('loennsinntekt')) {
            const loennObj = obj['loennsinntekt'];
            if (loennObj.hasOwnProperty('beskrivelse')) {
                avvik.loennsinntektBeskrivelse = loennObj['beskrivelse'];
            }
        }
        avvik.belongsToPeriod = period;
        if (this.identificationObject) {
            avvik.ansattnummer = this.identificationObject.ansattnummer;
            avvik.foedselsdato = this.identificationObject.foedselsdato;
            avvik.ansattnavn = this.identificationObject.navn;
        }
    }

    private setMottattLeveranser(leveranser, period) {
        if (leveranser instanceof Array) {
            leveranser.forEach(leveranse => {
                leveranse.periode = period;
                this.mottattLeveranserIPerioden.push(leveranse);
            });
        } else {
            leveranser.periode = period;
            this.mottattLeveranserIPerioden.push(leveranser);
        }
    }
}
