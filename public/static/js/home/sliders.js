class SliderRange {
    constructor(el) {
        this.oninput = null;
        this.onchange = null;
        this.onPreview = null;
        this._value = 50;
        this._min = 0;
        this._max = 100;
        this.$element = $(el);
        this.isSliderThumbPressed = false;
        this.$slider = $(`<div id="-${new Date().getTime()}" class="rc-slider">
                    <div class="rc-track">
                        <div class="rc-progress"></div>
                        <span class="rc-thumb"></span>
                        <span class="rc-preview" data-title="00:00">
                        <span class="rc-preview-content">
                        </span>
                            <div><span class="rc-preview-title"></div>
                            <span class="rc-preview-arrow"></span>
                        </span>
                    </div>
                </div>`);

        this.$element.append(this.$slider);

        this.$slider.find('.rc-track').on('mousedown touchstart', (e) => {
            this.isSliderThumbPressed = true;
            let xpos;
            if (e.type == "touchstart") {
                xpos = e.touches[0].pageX;
            } else {
                xpos = e.pageX;
            }
            this.updateValue(xpos - this.getOffset());
        });

        this.$slider.find('.rc-thumb').on('mousedown touchstart', (e) => {
            this.isSliderThumbPressed = true;
        });

        $(document).on('mousemove touchmove', (e) => {
            if (this.isSliderThumbPressed) {
                let xpos;
                if (e.type == "touchmove") {
                    xpos = e.touches[0].pageX;
                } else {
                    xpos = e.pageX;
                }

                var newPos = Math.floor(xpos - this.getOffset());
                if (newPos > -11 && newPos < this.offsetW()) {
                    this.updateValue(newPos);
                }
            }
        });

        this.$slider.find('.rc-track').on('mousemove', (e) => {
            if (this.onPreview) {

                var newPos = Math.floor(e.pageX - this.getOffset()) + 13;

                var current = Number(newPos.map(0, this.$slider.width(), this.min, this.max).toFixed(2));
                var pos = newPos.map(0, this.$slider.width(), 0, 100).toFixed(0);

                this.$slider.find('.rc-preview').css({
                    left: `calc(${pos < 0 ? 0 : pos > 100 ? 100 : pos}% - 40px)`
                });

                this.onPreview(this.validateValue(current));
            } else {
                this.$slider.find('.rc-preview').css({ display: "none" })
            }
        });

        $(document).on('mouseup touchend',(e) => {
            if (this.isSliderThumbPressed){
                if(this.onchange) this.onchange(this._value);
            }
            this.isSliderThumbPressed = false;
            e.stopPropagation();
        });
    }

    getOffset() {
        return this.$slider[0].getBoundingClientRect().x - 25;
    }

    offsetW() {
        return Math.floor(this.$slider[0].offsetWidth) - 14;
    }

    get max() {
        return this._max;
    }

    set max(val) {
        this._max = val;
        if (this._value > val) this._value = val;
    }

    get min() {
        return this._min;
    }

    set min(val) {
        this._min = val;
        if (this._value < val) this._value = val;
    }

    get value() {
        return this._value;
    }

    set value(val) {
        this._value = this.validateValue(val);
        this.updatePos();
    }

    validateValue(val) {
        return val < this.min ? this.min : val > this.max ? this.max : val;
    }

    setPreviewContent(el) {
        this.$slider.find('.rc-preview-content').empty().append(el);
    }

    setPreviewTitle(text) {
        this.$slider.find('.rc-preview-title').text(text);
    }

    updateValue(val) {
        var val = Number(val.map(-10, this.offsetW(), this.min, this.max).toFixed(2));
        this._value = this.validateValue(val);
        if (this.oninput) {
            this.oninput(this._value);
        }
        this.updatePos();
    }

    updatePos() {
        if (typeof this._value === "number") {
            setTimeout(() => {
                var pos = this._value.map(this._min, this._max, 0, 100).toFixed(2) + "%";
                this.$slider.find('.rc-thumb')[0].style.left = `calc(${pos} - 13px)`;
                this.$slider.find('.rc-progress')[0].style.width = pos;
            });
        }
    }

    cleanUp() {
        this.$element.empty();
    }
}