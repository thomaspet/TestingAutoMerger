import {Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../../uniWidget';
import {AuthService} from '../../../../authService';
import {WidgetDataService} from '../../widgetDataService';
import {UniModalService} from '@uni-framework/uni-modal';
import * as moment from 'moment';

@Component({
    selector: 'public-duedates-widget',
    templateUrl: './public-duedates.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PublicDueDatesWidget {

    @ViewChild('canvas')
    private canvas: ElementRef;

    widget: IUniWidget;
    dataLoaded: boolean = false;
    middleHeight: number = 0;
    middleWidth: number = 0;
    width: number = 0;
    numberXValues: any[] = [];
    pointsXValues: number[] = [];

    dataHolder: any[] = [];

    constructor(
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private widgetDataService: WidgetDataService,
        private modalService: UniModalService
    ) { }

    public ngAfterViewInit() {
        this.dataHolder = this.getDummyData();
        const canvas = this.canvas.nativeElement;

        canvas.style.width = '100%';
        canvas.style.height = '100%';

        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        this.middleHeight = this.canvas.nativeElement.height / 2;
        this.middleWidth = this.canvas.nativeElement.width / 2;
        this.width = this.canvas.nativeElement.width - 40;

        for (let i = 0; i < 7; i++) {
            this.numberXValues.push({
                label: i * 5,
                position: (i * (this.width / 6)) + 20
            });
        }

        for (let i = 0; i < 30; i++) {
            this.pointsXValues.push((i * (this.width / 29)) + 20);
        }
        this.getDataAndLoadList();

    }

    getDataAndLoadList() {
        this.dataHolder.map((item) => {
            item.duedays = moment().diff(moment(item.Date), 'days') * -1;
            console.log(moment().diff(moment(item.Date), 'days') * -1);
            return item;
        });

        this.drawBaseLine();
    }

    drawBaseLine() {
        const ctx = this.canvas.nativeElement.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(20, this.middleHeight);
        ctx.lineTo((this.canvas.nativeElement.width - 20), this.middleHeight);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#007B00';
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.font = 'normal bold 13px MuseoSans, arial, sans-serif';
        ctx.fillStyle = '#262626';
        ctx.fillText('DAGER', this.middleWidth - 30, this.middleHeight + 50);

        ctx.font = 'normal normal 13px MuseoSans, arial, sans-serif';
        ctx.textAlign = 'center';
        this.numberXValues.forEach((xValue) => {
            ctx.fillText(xValue.label, xValue.position, this.middleHeight + 20);
        });

        this.drawPoints();
    }

    drawPoints() {
        const ctx = this.canvas.nativeElement.getContext('2d');
        ctx.lineWidth = 2;
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#0071CD';

        this.dataHolder.forEach((item) => {
            ctx.beginPath();
            ctx.arc(this.pointsXValues[item.duedays], this.middleHeight, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        });

        this.drawPointLines();
    }

    drawPointLines() {
        const ctx = this.canvas.nativeElement.getContext('2d');
        ctx.font = 'normal bold 13px MuseoSans, arial, sans-serif';
        ctx.fillStyle = '#262626';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#0071CD';
        ctx.lineCap = 'butt';
        ctx.lineWidth = 2;

        this.dataHolder.forEach((item, index) => {
            // Make sure every other item goes up and down
            const y = index % 2 === 0 ? this.canvas.nativeElement.height * 0.2 : this.canvas.nativeElement.height * 0.8;
            // Tweak to place text
            const textAlignmentValue = index % 2 === 0 ? -8 : 12;
            ctx.beginPath();
            ctx.moveTo(this.pointsXValues[item.duedays], this.middleHeight + (index % 2 === 0 ? -4 : 4));
            ctx.lineTo(this.pointsXValues[item.duedays], y);
            ctx.stroke();

            ctx.fillText(this.dataHolder[index].Label, this.pointsXValues[item.duedays], y + textAlignmentValue);
        });

        // ctx.fillStyle = '#0071CD';
        // ctx.font = 'normal bold 10px MuseoSans, arial, sans-serif';

        // // Calculate circle 1 placement
        // let xValue = 100 + (ctx.measureText(this.dataHolder[0].Label).width / 2);
        // let yValue = (this.canvas.nativeElement.height * 0.2) - 12;

        // // Draw info circle 1
        // ctx.beginPath();
        // ctx.arc(xValue, yValue, 6, 0, 2 * Math.PI);
        // ctx.fill();
        // ctx.fillStyle = '#FFF';
        // ctx.fillText('i', xValue, yValue + 4);
        // ctx.fillStyle = '#0071CD';

        // // Calculate circle 2 placement
        // xValue = 170 + (ctx.measureText(this.dataHolder[1].Label).width / 2);
        // yValue = (this.canvas.nativeElement.height * 0.8) + 8;

        // // Draw circle 2
        // ctx.beginPath();
        // ctx.arc(xValue, yValue, 6, 0, 2 * Math.PI);
        // ctx.fill();
        // ctx.fillStyle = '#FFF';
        // ctx.fillText('i', xValue, yValue + 4);
        // ctx.fillStyle = '#0071CD';

        // // Calculate circle 3 placement
        // xValue = 320 + (ctx.measureText(this.dataHolder[2].Label).width / 2);
        // yValue = (this.canvas.nativeElement.height * 0.2) - 12;

        // // Draw info circle 3
        // ctx.beginPath();
        // ctx.arc(xValue, yValue, 6, 0, 2 * Math.PI);
        // ctx.fill();
        // ctx.fillStyle = '#FFF';
        // ctx.fillText('i', xValue, yValue + 4);
        // ctx.fillStyle = '#0071CD';
    }

    getDummyData() {
        return [
            { Label: 'A-Melding', InfoText: 'A-melding for september', Date: moment('20191007') },
            { Label: 'Mva', InfoText: 'Mva-melding for alminnelig næring', Date: moment('20191010') },
            { Label: 'Aksjonæravtale', InfoText: 'Merverdiavgift, kompensasjonsmelding – frist for levering', Date: moment('20191018') },
            { Label: 'Skattemelding', InfoText: 'Skatteoppgjør - siste pulje er klar', Date: moment('20191023') }
        ];
    }
}
