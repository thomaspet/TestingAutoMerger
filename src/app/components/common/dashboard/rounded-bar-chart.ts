import * as Chart from 'chart.js';

/**
 * RoundedRectangle - Extends from regular Rectangle but have rounded corners.
 */
(<any> Chart).elements.RoundedRectangle = (<any> Chart).elements.Rectangle.extend({
    draw: function () {
        const ctx = this._chart.ctx;
        const vm = this._view;

        let negativeBar;
        let barValue;

        try {
            const chart = this._chart;
            const datasetIndex = this._datasetIndex;
            const index = this._index;
            const value = chart.config.data.datasets[datasetIndex].data[index];

            barValue = value;
            negativeBar = value < 0;
        } catch (e) {
            console.error(e);
        }

        let left, right, top, bottom;
        const borderWidth = vm.borderWidth;

        left = vm.x - vm.width / 2;
        right = vm.x + vm.width / 2;
        top = vm.y;
        bottom = vm.base;

        // calculate the bar width and roundess
        const barWidth = Math.abs(left - right);
        const roundness = this._chart.config.options.barRoundness || 1;
        const radius = barWidth * roundness * 0.5;

        // keep track of the original top of the bar
        const prevTop = top;

        // move the top down so there is room to draw the rounded top
        top = prevTop + radius;
        const barRadius = top - prevTop;

        ctx.beginPath();
        ctx.fillStyle = vm.backgroundColor;
        ctx.strokeStyle = vm.borderColor;
        ctx.lineWidth = borderWidth;

        // draw the rounded top rectangle
        if (barValue) {
            Chart.helpers.drawRoundedTopRectangle(negativeBar, ctx, left, (top - barRadius + 1), barWidth, bottom - prevTop, barRadius);
        }

        ctx.fill();
        if (borderWidth) {
            ctx.stroke();
        }

        // restore the original top value so tooltips and scales still work
        top = prevTop;
    }
});


// Helpers

/**
 * Draws a rectangle with a rounded top
 */
Chart.helpers.drawRoundedTopRectangle = function (negativeBar, ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);

    const yCoordinate = negativeBar ? (y - radius) : (y + radius);

    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, yCoordinate);

    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);

    ctx.lineTo(x, yCoordinate);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
};


Chart.defaults.roundedBarChart = Chart.defaults.bar;
Chart.controllers.roundedBarChart = Chart.controllers.bar.extend({
    dataElementType: (<any> Chart).elements.RoundedRectangle
});
