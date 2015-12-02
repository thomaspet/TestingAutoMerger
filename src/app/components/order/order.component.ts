import {Component,Input,OnInit,Directive, AfterViewInit,ElementRef} from "angular2/angular2";
import {Router} from 'angular2/router';
import {Routes} from '../../route.config';

@Directive({
	selector:'[kendo-grid]',
	inputs:['options']
})
export class kendoGrid implements AfterViewInit {
	options:any;
	
	constructor(public element:ElementRef) {
		
	}
	
	ngAfterViewInit() {
		var component = this;
		var elem:any = $(this.element.nativeElement);
		if(!elem.data('kendoGrid')) {
			elem.kendoGrid(this.options);
		}
	}
}

@Component({
	template: '<div kendo-grid [options]="kOptions"></div>',
	directives: [kendoGrid]
})
export class OrderGrid {
	kOptions: any;
	constructor(router: Router){
		this.kOptions = {
			scrollable: {
				virtual: true
			},
			sortable: true,
			groupable: true,
			selectable: true,
			height: 600,

			columns: [
				{ field: "ID", title: "Ordrenr" },
				{ field: "CustomerID", title: "Kundenr" },
				{ field: "CustomerName", title: "Kundenavn" },
				{ field: "OrderDate", title: "Ordredato", format: "{0:dd/MM/yyyy}" },
				{ field: "SumTotal", title: "Total", format: "{0:c}", attributes: { style: "text-align:right;" } }
			],
			change: function (ev) {
				var item = <any>ev.sender.dataItem(this.select());
				router.navigate([`/${Routes.orderDetail.name}`, { id: item.ID }])
			}
		};
		this.kOptions.dataSource = {
			type: 'json',
			transport: {
				read: {
					url: 'http://devapi.unieconomy.no/api/biz/orders',
					type: 'GET',
					headers: {
						"Client": "client1"
					}
				}
			},
			schema: {
				model: {
					id: "ID",
					fields: {
						ID: {
							editable: false,
							nullable: true
						},
						CustomerName: {
							validation: {
								required: true
							}
						},
						CustomerID: {
							editable: false,
							nullable: false
						},
						OrderDate: {
							type: "date"
						},
						SumTotal: {
							editable: false,
							type: "number"
						}
					}
				}
			}
		}
	}
}