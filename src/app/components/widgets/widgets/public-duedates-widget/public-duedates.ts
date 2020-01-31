import {Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../../uniWidget';
import {WidgetDataService} from '../../widgetDataService';
import {UniModalService} from '@uni-framework/uni-modal';
import {PublicDuedatesModal} from './public-duedate-modal';
import * as moment from 'moment';

@Component({
    selector: 'public-duedates-widget',
    templateUrl: './public-duedates.html',
    styleUrls: ['./public-duedates.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PublicDueDatesWidget {

    @ViewChild('canvas')
    private canvas: ElementRef;

    widget: IUniWidget;
    ctx: any;
    dataLoaded: boolean = false;
    middleHeight: number = 0;
    middleWidth: number = 0;
    width: number = 0;
    numberXValues: any[] = [];
    pointsXValues: number[] = [];
    dataHolder: any[] = [];

    infoPointPositions: any[] = [];

    constructor(
        private router: Router,
        private cdr: ChangeDetectorRef,
        private widgetDataService: WidgetDataService,
        private modalService: UniModalService
    ) { }

    public ngAfterViewInit() {
        this.widgetDataService.getData('/api/biz/deadlines?action=number-of-days-filtered&nrOfDays=30').subscribe((items) => {
            this.dataHolder = items.sort((a, b) => {
                return a.Deadline > b.Deadline ? -1 : 1;
            });
            this.dataLoaded = true;

            // Needs redraw on canvas size change  -- TODO --

            if (this.dataHolder.length) {
                const canvas = this.canvas.nativeElement;
                this.ctx = this.canvas.nativeElement.getContext('2d');

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
            } else {
                const canvas = this.canvas.nativeElement;
                canvas.style.width = '0';
                canvas.style.height = '0';
                this.cdr.markForCheck();
            }
        });
    }

    onClick(event) {
        this.infoPointPositions.forEach((pos) => {
            if (pos.x - event.layerX >= -5 && pos.x - event.layerX <= 5
            && pos.y - event.layerY >= 0 && pos.y - event.layerY <= 10) {
                this.modalService.open(PublicDuedatesModal, { data: pos.item });
            }
        });
    }

    getDataAndLoadList() {
        this.dataHolder.map((item) => {
            const now = moment().format('YYYYMMDD');
            item.duedays = moment(now).diff(moment(item.Deadline), 'days') * -1;
            return item;
        });
        this.drawBaseLine();
    }

    drawBaseLine() {
        let percent = 0;
        this.ctx.lineWidth = 8;
        this.ctx.strokeStyle = '#007B00';
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(20, this.middleHeight);
        this.ctx.lineTo(this.canvas.nativeElement.width - 20, this.middleHeight);
        this.ctx.stroke();
        this.drawBaseText();
    }

    drawBaseText() {
        this.ctx.font = 'normal bold 13px MuseoSans, arial, sans-serif';
        this.ctx.fillStyle = '#2b2b2b';
        this.ctx.fillText('DAGER', this.middleWidth - 30, this.middleHeight + 50);

        this.ctx.font = 'normal normal 13px MuseoSans, arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.numberXValues.forEach((xValue) => {
            this.ctx.fillText(xValue.label, xValue.position, this.middleHeight + 20);
        });

        this.drawPoints();
    }

    drawPoints() {
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = '#FFF';
        this.ctx.strokeStyle = '#0071CD';

        this.dataHolder.forEach((item) => {
            this.ctx.beginPath();
            this.ctx.arc(this.pointsXValues[item.duedays], this.middleHeight, 4, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        });

        this.drawPointLines();
    }

    drawPointLines() {
        this.ctx.strokeStyle = '#0071CD';
        this.ctx.lineCap = 'butt';
        this.ctx.lineWidth = 2;
        let shouldUseFullLength: boolean = false;
        let counter = 1;

        this.dataHolder.forEach((item, index) => {

            this.ctx.font = 'normal bold 13px MuseoSans, arial, sans-serif';
            this.ctx.fillStyle = '#2b2b2b';

            if (counter === 3) {
                counter = 1;
                shouldUseFullLength = !shouldUseFullLength;
            }

            // Make sure every other item goes up and down
            const y = index % 2 === 0
                ? (this.canvas.nativeElement.height * 0.2 - (shouldUseFullLength ? 0 : -30))
                : (this.canvas.nativeElement.height * 0.8 - (shouldUseFullLength ? 0 : 30));
            // Tweak to place text
            const textAlignmentValue = index % 2 === 0 ? -8 : 12;
            // Draw line

            this.ctx.beginPath();
            this.ctx.moveTo(this.pointsXValues[item.duedays], this.middleHeight + (index % 2 === 0 ? -4 : 4));
            this.ctx.lineTo(this.pointsXValues[item.duedays], y);
            this.ctx.stroke();

            // Set text-alignment based on text placement
            if (item.duedays < 3) {
                this.ctx.textAlign = 'left';
            } else if (item.duedays >= 26) {
                this.ctx.textAlign = 'right';
            } else {
                this.ctx.textAlign = 'center';
            }

            this.ctx.fillText(this.dataHolder[index].Name, this.pointsXValues[item.duedays], y + textAlignmentValue);

            // Draw blue infor circle icons
            this.ctx.fillStyle = '#0071CD';
            const xValue = this.pointsXValues[item.duedays] + 10 + (this.ctx.measureText(this.dataHolder[index].Name).width *
                ( item.duedays < 3 ? 1 : item.duedays >= 26 ? 0 : 0.5));

            this.ctx.beginPath();
            this.ctx.arc(xValue + ( item.duedays < 3 ? 2 : item.duedays >= 26 ? - 2 : 0), y - 4 + textAlignmentValue, 6, 0, 2 * Math.PI);
            this.ctx.fill();

            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'normal bold 10px MuseoSans, arial, sans-serif';
            this.ctx.fillText('i', xValue, y + textAlignmentValue);
            this.infoPointPositions.push({ x: xValue, y: y + textAlignmentValue, item: item } );

            counter++;
        });
    }
}
