import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import * as moment from 'moment';

@Component({
    selector: 'public-duedate-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign public-duedate-modal">
            <header>Offentlige frister</header>
            <article>
                <div class="section-div">
                    <span class="date-section"> {{ duedateItem._date }} </span>
                    <div class="info-section">
                        <label> {{ duedateItem.Name }} </label>
                        <span> {{ duedateItem.AdditionalInfo }} </span>
                        <a href="https://www.skatteetaten.no/bedrift-og-organisasjon/starte-og-drive/frister-gebyrer-og-tilleggsskatt/frister-og-oppgaver/" target="_blank">Gå til skatteetaten for mer info</a>
                    </div>
                </div>
            </article>

            <footer class="center">
                <button (click)="close()">Lukk</button>
            </footer>
        </section>
    `,
    styleUrls: ['./public-duedates.sass']
})

export class PublicDuedatesModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    duedateItem: any;

    constructor( ) { }

    public ngOnInit() {
        this.duedateItem = this.options && this.options.data;
        this.duedateItem._date = moment(this.duedateItem.Deadline).format('DD MMM');
    }

    close(emitValue?: boolean) {
        this.onClose.emit(emitValue);
    }
}
