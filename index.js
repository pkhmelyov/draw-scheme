(function () {

    var WIDTH = 800;
    var HEIGHT = 600;

    function Point (x, y) {
        this.x = x;
        this.y = y;
    }

    function Line (start, end) {
        this.start = start;
        this.end = end;
    }

    var Drawer = (function () {
        var drawer = function (canvas) {
            this._canvas = canvas
            this._width = canvas.width;
            this._height = canvas.height;
            this._context = canvas.getContext("2d");
            this._xCorrection = 0;
            this._yCorrection = 0;
            this._xDirectionCorrection = 1;
            this._yDirectionCorrection = 1;
            this._xScaling = 1;
            this._yScaling = 1;
        };

        drawer.prototype.Origin = {
            TopLeft: "TopLeft",
            TopRight: "TopRight",
            BottomLeft: "BottomLeft",
            BottomRight: "BottomRight",
            TopCenter: "TopCenter",
            BottomCenter: "BottomCenter",
            LeftCenter: "LeftCenter",
            RightCenter: "RightCenter",
            Center: "Center",
            Custom: "Custom"
        };

        drawer.prototype.XDirection = {
            LeftToRight: "LeftToRight",
            RightToLeft: "RightToLeft"
        };

        drawer.prototype.YDirection = {
            BottomToTop: "BottomToTop",
            TopToBottom: "TopToBottom"
        };

        drawer.prototype.SetOrigin = function (origin, x, y, normalize) {
            switch (origin) {
                case this.Origin.TopLeft:
                    this._xCorrection = 0;
                    this._yCorrection = 0;
                    break;
                case this.Origin.TopRight:
                    this._xCorrection = this._width;
                    this._yCorrection = 0;
                    break;
                case this.Origin.BottomLeft:
                    this._xCorrection = 0;
                    this._yCorrection = this._height;
                    break;
                case this.Origin.BottomRight:
                    this._xCorrection = this._width;
                    this._yCorrection = this._height;
                    break;
                case this.Origin.TopCenter:
                    this._xCorrection = this._width / 2;
                    this._yCorrection = 0;
                    break;
                case this.Origin.BottomCenter:
                    this._xCorrection = this._width / 2;
                    this._yCorrection = this._height;
                    break;
                case this.Origin.LeftCenter:
                    this._xCorrection = 0;
                    this._yCorrection = this._height / 2;
                    break;
                case this.Origin.RightCenter:
                    this._xCorrection = this._width;
                    this._yCorrection = this._height / 2;
                    break;
                case this.Origin.Center:
                    this._xCorrection = this._width / 2;
                    this._yCorrection = this._height / 2;
                    break;
                case this.Origin.Custom:
                    var point = normalize ? this.Normalize({ x, y }) : { x, y };
                    this._xCorrection = point.x;
                    this._yCorrection = point.y;
                    break;
            }
        };

        drawer.prototype.SetXDirection = function (direction) {
            switch (direction) {
                case this.XDirection.LeftToRight:
                    this._xDirectionCorrection = 1;
                    break;
                case this.XDirection.RightToLeft:
                    this._xDirectionCorrection = -1;
                    break;
            }
        };

        drawer.prototype.SetYDirection = function (direction) {
            switch (direction) {
                case this.YDirection.TopToBottom:
                    this._yDirectionCorrection = 1;
                    break;
                case this.YDirection.BottomToTop:
                    this._yDirectionCorrection = -1;
                    break;
            }
        };

        drawer.prototype.SetDirections = function (directions) {
            this.SetXDirection(directions.x);
            this.SetYDirection(directions.y);
        };

        drawer.prototype.Setup = function (settings) {
            this.SetOrigin(settings.origin.origin, settings.origin.x, settings.origin.y, settings.origin.normalize);
            this.SetDirections(settings.directions);
        };

        drawer.prototype.Reset = function () {
            this.Setup({
                origin: { origin: this.Origin.Center },
                directions: {
                    x: this.XDirection.LeftToRight,
                    y: this.YDirection.BottomToTop
                }
            });
        };

        drawer.prototype.SetXScaling = function (scaling) {
            this._xScaling = scaling;
        };

        drawer.prototype.SetYScaling = function (scaling) {
            this._yScaling = scaling;
        };

        drawer.prototype.SetScaling = function (scaling) {
            this.SetXScaling(scaling);
            this.SetYScaling(scaling);
        };

        drawer.prototype.Normalize = function (point) {
            var x = point.x * this._xScaling * this._xDirectionCorrection + this._xCorrection;
            var y = point.y * this._yScaling * this._yDirectionCorrection + this._yCorrection;
            return new Point(x, y);
        };

        drawer.prototype.DrawLine = function (line) {
            var normalized = new Line(this.Normalize(line.start), this.Normalize(line.end));
            this._context.beginPath();
            this._context.moveTo(normalized.start.x, normalized.start.y);
            this._context.lineTo(normalized.end.x, normalized.end.y);
            this._context.stroke();
        };

        drawer.prototype.DrawLines = function (lines) {
            for (line of lines) {
                this.DrawLine(line);
            }
        };

        drawer.prototype.DrawText = function (text, point, font) {
            var normalized = this.Normalize(point);
            this._context.font = font;
            this._context.fillText(text, normalized.x, normalized.y);
        };

        return drawer;
    })();

    var Ruler = (function () {
        var ruler = function (drawer, width, height) {
            this._drawer = drawer;
            this._width = width;
            this._height = height;
            this._degree = height / 24;

            this._leftEdge = -this._width / 2;
            this._rightEdge = this._width / 2;
            this._topEdge = this._height / 2;
            this._bottomEdge = -this._height / 2;
            this._origin = { x: 0, y: this._bottomEdge + this._degree / 2 };
        };

        ruler.prototype.DrawRulerBase = function () {
            this._drawer.Reset();
            var lines = [
                { start: { x: this._leftEdge, y: this._topEdge }, end: { x: this._rightEdge, y: this._topEdge } },
                { start: { x: this._rightEdge, y: this._topEdge }, end: { x: this._rightEdge, y: this._bottomEdge } },
                { start: { x: this._rightEdge, y: this._bottomEdge }, end: { x: this._leftEdge, y: this._bottomEdge } },
                { start: { x: this._leftEdge, y: this._bottomEdge }, end: { x: this._leftEdge, y: this._topEdge } },
            ];
            this._drawer.DrawLines(lines);
        };

        ruler.prototype.DrawDegrees = function () {
            var drawDegrees = function (drawNumber) {
                for (var i = 0; i < 23; i++) {
                    var y = this._degree * i;
                    this._drawer.DrawLine({
                        start: { x: 0, y: y },
                        end: {
                            x: i % 5 === 0 ? 1 : .7,
                            y: y
                        }
                    });
                    if (i % 5 === 0 && drawNumber) drawNumber(i, y);
                }
            }.bind(this);

            var drawNumber = function(number, y) {
                debugger;
                number /= 10;
                var point = { y: y - .3 };
                switch (number) {
                    case 0:
                    case 1:
                    case 2:
                        point.x = -2;
                        break;
                    case .5:
                    case 1.5:
                        point.x = -3;
                        break;
                }
                this._drawer.DrawText(number, point, "14px serif");
            }.bind(this);

            this._drawer.Reset();
            this._drawer.Setup({
                origin: {
                    origin: this._drawer.Origin.Custom,
                    x: this._leftEdge,
                    y: this._origin.y,
                    normalize: true
                },
                directions: {
                    x: this._drawer.XDirection.LeftToRight,
                    y: this._drawer.YDirection.BottomToTop
                }
            });
            drawDegrees(drawNumber);

            this._drawer.Setup({
                origin: {
                    origin: this._drawer.Origin.Custom,
                    x: this._width,
                    y: 0,
                    normalize: true
                },
                directions: {
                    x: this._drawer.XDirection.RightToLeft,
                    y: this._drawer.YDirection.BottomToTop
                }
            });
            drawDegrees();
        };

        ruler.prototype.DrawRuler = function () {
            this.DrawRulerBase();
            this.DrawDegrees();
        };

        ruler.prototype.ConvertRulerValue = function (value) {
            return value * 10 * this._degree;
        };

        ruler.prototype.DrawThing = function(min, max, first, third, median) {
            this._drawer.Reset();
            this._drawer.Setup({
                origin: {
                    origin: this._drawer.Origin.Custom,
                    x: this._origin.x,
                    y: this._origin.y,
                    normalize: true
                },
                directions: {
                    x: this._drawer.XDirection.LeftToRight,
                    y: this._drawer.YDirection.BottomToTop
                }
            });

            var minWidth = this._width / 8;
            var quartileWidth = this._width * .28;
            min = this.ConvertRulerValue(min);
            max = this.ConvertRulerValue(max);
            first = this.ConvertRulerValue(first);
            third = this.ConvertRulerValue(third);
            median = this.ConvertRulerValue(median);
            var minLegend = { x: this._rightEdge + 8, y: min };
            var maxLegend = { x: this._rightEdge + 8, y: max };
            var firstLegend = { x: this._rightEdge + 8, y: first };
            var thirdLegend = { x: this._rightEdge + 8, y: third };
            var medianLegend = { x: this._leftEdge - 8, y: median };
            var lines = [
                { start: { x: -minWidth, y: min }, end: { x: minWidth, y: min } },
                { start: { x: -minWidth, y: max }, end: { x: minWidth, y: max } },
                { start: { x: -quartileWidth, y: first }, end: { x: quartileWidth, y: first } },
                { start: { x: -quartileWidth, y: third }, end: { x: quartileWidth, y: third } },
                { start: { x: -quartileWidth, y: median }, end: { x: quartileWidth, y: median } },
                { start: { x: 0, y: min }, end: { x: 0, y: first } },
                { start: { x: 0, y: max }, end: { x: 0, y: third } },
                { start: { x: -quartileWidth, y: first }, end: { x: -quartileWidth, y: third } },
                { start: { x: quartileWidth, y: first }, end: { x: quartileWidth, y: third } }
            ];
            this._drawer.DrawLines(lines);

            this._drawer._context.strokeStyle = "blue";
            this._drawer._context.fillStyle = "blue";
            this._drawer._context.lineWidth = 2;
            lines = [
                { start: { x: minWidth + this._degree / 2, y: min }, end: minLegend },
                { start: { x: minWidth + this._degree / 2, y: max }, end: maxLegend },
                { start: { x: quartileWidth + this._degree / 2, y: first }, end: firstLegend },
                { start: { x: quartileWidth + this._degree / 2, y: third }, end: thirdLegend },
                { start: { x: -quartileWidth - this._degree / 2, y: median }, end: medianLegend },
            ];
            this._drawer.DrawLines(lines);

            this._drawer.DrawText("minimum", { x: minLegend.x + this._degree / 2, y: minLegend.y - .3 }, "bold 18px serif");
            this._drawer.DrawText("maximum", { x: maxLegend.x + this._degree / 2, y: maxLegend.y - .3 }, "bold 18px serif");
            this._drawer.DrawText("first quartile", { x: firstLegend.x + this._degree / 2, y: firstLegend.y - .3 }, "bold 18px serif");
            this._drawer.DrawText("third quartile", { x: thirdLegend.x + this._degree / 2, y: thirdLegend.y - .3 }, "bold 18px serif");
            this._drawer.DrawText("median", { x: medianLegend.x - this._degree * 4, y: medianLegend.y - .3 }, "bold 18px serif");

            this._drawer._context.strokeStyle = "red";
            this._drawer._context.fillStyle = "red";
            this._drawer.DrawLine({ start: { x: thirdLegend.x - 4, y: thirdLegend.y - .5 }, end: { x: firstLegend.x - 4, y: firstLegend.y + .5 } });
            this._drawer.DrawText("IQR", { x: firstLegend.x - 3 , y: firstLegend.y + (thirdLegend.y - firstLegend.y) / 2 - .7 }, "italic bold 18px serif");
        };

        return ruler;
    })();

    document.addEventListener("DOMContentLoaded", function() {
        var canvas = document.getElementById("canvas");
        var drawer = new Drawer(canvas);
        drawer.SetScaling(8);
        var ruler = new Ruler(drawer, 10, 47);
        ruler.DrawRuler();
        ruler.DrawThing(.05, 2.2, .45, 1.15, .7);
    });

})();