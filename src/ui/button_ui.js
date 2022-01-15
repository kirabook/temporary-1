export default class button_ui extends RexPlugins.UI.Label {
    constructor(scene, x, y, text, style, targetScene) {

		var textStyle = { fontFamily: 'Arial', fontSize: scene.buttonFontSize, color: '#000000', align: '', colorHover: '#ffffff' };
	    var buttonStyle = { paddingLeft: 10, paddingTop: 5, align: 'center', color: '0xffffff', borderColor: '0x000000', borderThickness: 1, colorHover: '0x000000', borderHover: '0x000000', alpha: 1 };

    	switch(style){
    		case 'primary':
    			textStyle.color = '#ffffff';
    			textStyle.colorHover = '#ffffff';
    			buttonStyle.color = '0x0d6efd';
    			buttonStyle.borderColor = '0x0d6efd';
    			buttonStyle.colorHover = '0x0b5ed7';
    			buttonStyle.borderHover = '0x0a58ca';
    		break;
    		case 'secondary':
    			textStyle.color = '#ffffff';
    			textStyle.colorHover = '#ffffff';
    			buttonStyle.color = '0x6c757d';
    			buttonStyle.borderColor = '0x6c757d';
    			buttonStyle.colorHover = '0x5c636a';
    			buttonStyle.borderHover = '0x565e64';
    		break;
    		case 'success':
    			textStyle.color = '#ffffff';
    			textStyle.colorHover = '#ffffff';
    			buttonStyle.color = '0x198754';
    			buttonStyle.borderColor = '0x198754';
    			buttonStyle.colorHover = '0x157347';
    			buttonStyle.borderHover = '0x146c43';
    		break;
    		case 'danger':
    			textStyle.color = '#ffffff';
    			textStyle.colorHover = '#ffffff';
    			buttonStyle.color = '0xdc3545';
    			buttonStyle.borderColor = '0xdc3545';
    			buttonStyle.colorHover = '0xbb2d3b';
    			buttonStyle.borderHover = '0xb02a37';
    		break;
    		case 'warning':
    			textStyle.color = '#000000';
    			textStyle.colorHover = '#000000';
    			buttonStyle.color = '0xffc107';
    			buttonStyle.borderColor = '0xffc107';
    			buttonStyle.colorHover = '0xffca2c';
    			buttonStyle.borderHover = '0xffc720';
    		break;
    		case 'info':
    			textStyle.color = '#000000';
    			textStyle.colorHover = '#000000';
    			buttonStyle.color = '0x0dcaf0';
    			buttonStyle.borderColor = '0x0dcaf0';
    			buttonStyle.colorHover = '0x31d2f2';
    			buttonStyle.borderHover = '0x25cff2';
    		break;
    		case 'info':
    			buttonStyle.alpha = 0;
    			textStyle.color = '#0d6efd';
    			textStyle.colorHover = '#0a58ca';
    			buttonStyle.color = '0x0dcaf0';
    			buttonStyle.borderColor = '0x0dcaf0';
    			buttonStyle.colorHover = '0x31d2f2';
    			buttonStyle.borderHover = '0x25cff2';
    		break;
    		case 'actionMenu':
    			buttonStyle.alpha = 0;
    			textStyle.color = '#0d6efd';
    			textStyle.colorHover = '#0a58ca';
    			buttonStyle.color = '0x0dcaf0';
    			buttonStyle.borderColor = '0x0dcaf0';
    			buttonStyle.colorHover = '0x31d2f2';
    			buttonStyle.borderHover = '0x25cff2';
    		break;
    	}

    	var buttonBackground = scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, buttonStyle.color, buttonStyle.alpha).setStrokeStyle(buttonStyle.borderThickness, buttonStyle.borderColor, buttonStyle.alpha);
    	var buttonText = scene.add.text(0, 0, text, textStyle);

    	var config = {
	        background: buttonBackground,
	        text: buttonText, 
	        align: buttonStyle.align, 
	        name: 'button',
	        space: {
	            left: buttonStyle.paddingLeft,
	            right: buttonStyle.paddingLeft,
	            top: buttonStyle.paddingTop,
	            bottom: buttonStyle.paddingTop
	        }
	    }

        super(scene, config);
        //super(scene, x, y, text, { fontSize: 20 + 'px', fontFamily: 'Arial', color: '#ffffff'});
	    this.scene = scene;

        this.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.mouseOver(textStyle, buttonStyle) )
            .on('pointerout', () => this.mouseOut(textStyle, buttonStyle) )
            .on('pointerdown', () => {
                this.mouseOver(textStyle, buttonStyle)
                targetScene ? this.scene.scene.start(targetScene) : null;
            })
            .on('pointerup', () => {
                this.mouseOut(textStyle, buttonStyle)
                //this.scene.talk.waitForClick();
            });

        scene.add.existing(this);
        this.layout();

    }

	enable() {
		this.setInteractive({ cursor: 'url(assets/cursors/32x32/finger.png), pointer' })
		  .on('pointerover', this.mouseOver)
		  .on('pointerout', this.mouseOut)
		  .on('pointerup', this.mouseClick);
	}

	disable() {
		this.removeInteractive()
		  .off('pointerover', this.mouseOver)
		  .off('pointerout', this.mouseOut)
		  .off('pointerup', this.mouseClick);
	}

	mouseOver(textStyle, buttonStyle) {
		let background = this.getElement('background');
		let text = this.getElement('text');

		background.setFillStyle(buttonStyle.colorHover);
		text.setColor(textStyle.colorHover);

		console.log('mouseOver');
	}

	mouseOut(textStyle, buttonStyle) {
		let background = this.getElement('background');
		let text = this.getElement('text');

		background.setFillStyle(buttonStyle.color);
		text.setColor(textStyle.color);

		console.log('mouseOut');
	}

	mouseClick() {
		// retrieves the active main scene
		//let scene = this.scene.scene.get(window.const.mainScene);
		// load the answer
		//scene.talk.loadAnswer(this.load);
	}
}