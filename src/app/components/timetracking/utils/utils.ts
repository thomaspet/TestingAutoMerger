declare var moment;

export function safeInt(value: any) {
    if (value === undefined) { return 0; }
    var tmp = parseInt(value, 10);
    if (isNaN(tmp)) {
        return 0;
    }
    return tmp;

}

export function parseTime(value:string, allowMacros = true): Date {
    var h = 0;
    var m = 0;
    
	if (allowMacros) {
		if (value==='*') return moment().toDate();
	}
	
    if (value.indexOf(':')>0) {
        var parts = value.split(':');
        h = safeInt(parts[0]);
        m = safeInt(parts[1]);
    } else {
        switch (value.length) {
            case 1:
                h = safeInt(value);
                break;
            case 2:
                h = safeInt(value);
				if (h>24) {
					h = safeInt(value.substr(0,1));
					m = safeInt(value.substr(1))*10;
				}
                break;
			case 3:
				h = safeInt(value.substr(0,1));
				if (h>2) {
					m = safeInt(value.substr(1));
				} else {
					h = safeInt(value.substr(0,2));
					m = safeInt(value.substr(2));
				}
				break;
			case 4:
				h = safeInt(value.substr(0,2));
				m = safeInt(value.substr(2,2));
				break;
        }
    }
    
    return timeSerial(h,m);
}

export function addTime(value:Date, amount:number, addType = 'hours') {
	return moment(value).add(amount, addType).toDate();
}

function timeSerial(hour:number, minute:number): Date {
    return moment().hour(hour).minute(minute).toDate();
}