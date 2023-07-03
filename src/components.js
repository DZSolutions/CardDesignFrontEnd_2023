import { fabric } from "fabric";
import "./js/JsBarcode.all.min.js";
import QRCode from "./js/qrcode.min.js";
import QRCodeStyling from "qr-code-styling";
class ComponentAdapter {
	constructor(adapter) {
		this.canvas = adapter.canvas;
		this.global_id = adapter.global_id;
		this.ob_properties = adapter.ob_properties;
		this.view = adapter.view;
		this.viewport = adapter.viewport;
	}
}

class Component {
	constructor(adapter) {
		this.Setconstructor(adapter);
	}

	Setconstructor = (adapter) => {
		this.adapter = adapter;
	};

	UpdateBarcode = (selected_obj) => {
		let pre_1_w = selected_obj.item(1).item(1).width;
		if (selected_obj.mappingData.sample) {
			let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			try {
				JsBarcode(svg, String(selected_obj.mappingData.sample), {
					background: "#ffffff00",
					lineColor: selected_obj.mappingData.color,
					format: selected_obj.mappingData.barcodeType,
					displayValue: false,
					margin: 0,
					height: 100,
				});
			} catch {
				return;
			}
			fabric.loadSVGFromString(svg.outerHTML, (objects, options) => {
				let barcode = new fabric.util.groupSVGElements(objects, {
					left: 0,
					top: 0,
					height: 100,
					dirty: true,
					objectCaching: false,
					originX: "center",
					originY: "top",
					lockScalingX: true,
					lockScalingY: true,
				});
				barcode._calcBounds();
				selected_obj.item(1).item(0).width = barcode.width;
				selected_obj.item(1).item(1).width = barcode.width;
				selected_obj.item(1).width = barcode.width;
				selected_obj.item(0).width = barcode.width;
				selected_obj.width = barcode.width;
				selected_obj.item(1).item(0)._objects = barcode._objects;
				selected_obj.item(1).item(1).set({ text: selected_obj.mappingData.sample });
				this.adapter.canvas.renderAll();
				if (pre_1_w <= selected_obj.width) {
					selected_obj.item(1).item(1).set({ width: pre_1_w });
				}
				this.adapter.canvas.renderAll();
			});
		}
	};

	AddBarcode = () => {
		let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		let data = "Example 1234";
		JsBarcode(svg, String(data), {
			background: "#ffffff00",
			lineColor: "#000000ff",
			format: "CODE128",
			displayValue: false,
			margin: 0,
			height: 100,
		});
		fabric.loadSVGFromString(svg.outerHTML, (objects, options) => {
			let barcode = new fabric.util.groupSVGElements(objects, {
				left: 0,
				height: 100,
				dirty: true,
				objectCaching: false,
				originX: "center",
				originY: "top",
			});
			let rect_barcode = barcode.getBoundingRect();
			let text = new fabric.Textbox(data, {
				left: 0,
				top: rect_barcode.height,
				width: rect_barcode.width,
				fontSize: 20,
				textAlign: "center",
				dirty: true,
				objectCaching: false,
				caching: false,
				originX: "center",
				originY: "top",
			});
			let rect_text = text.getBoundingRect();
			let pre_group = new fabric.Group([barcode, text], {
				top: 0,
				left: 0,
				dirty: true,
				objectCaching: false,
				originX: "center",
				originY: "top",
				lockScalingX: true,
				lockScalingY: true,
			});
			let rect = pre_group.getBoundingRect();
			let background = new fabric.Rect({
				left: 0,
				top: -1 * (rect_text.height / 2),
				strokeWidth: 0,
				width: rect.width,
				height: rect.height + rect_text.height / 2,
				fill: "#ffffffff",
				dirty: true,
				objectCaching: false,
				caching: false,
				originX: "center",
				originY: "top",
				lockScalingX: true,
				lockScalingY: true,
			});
			this.adapter.global_id++;
			let group = new fabric.Group([background, pre_group], {
				top: 0,
				id: this.adapter.global_id,
				lockScalingX: true,
				lockScalingY: true,
				dirty: true,
				objectCaching: false,
				caching: false,
				mappingData: {
					comp: "barcode",
					source: "STATIC",
					sample: "Example 1234",
					color: "#000000ff",
					fill: "#ffffffff",
					barcodeType: "CODE128",
					displayText: true,
				},
				originX: "center",
				originY: "top",
			});
			this.adapter.canvas.add(group);
			group.item(1).item(1).set({
				width: rect.width,
				backgroundColor: "#ffffffff",
			});
			group.item(1).set({ height: group.item(1).item(0).height });
			group.center();
			this.adapter.canvas.renderAll();
		});
	};

	UpdateQRCode = (selected_obj) => {
		let svg = new QRCode({
			content: String(selected_obj.mappingData.sample),
			padding: 2,
			width: 100,
			height: 100,
			color: selected_obj.mappingData.color,
			background: selected_obj.mappingData.fill,
			ecl: "M",
		}).svg();
		fabric.loadSVGFromString(svg, (objects, options) => {
			let qr = new fabric.util.groupSVGElements(objects, options);
			qr._calcBounds();
			selected_obj.remove();
			selected_obj._objects = [];
			qr._objects.map((o) => {
				selected_obj.add(o);
			});
			this.adapter.canvas.renderAll();
		});
	};

	AddQRCode = () => {
		return new Promise((resolve) => {
			let data = "Example 1234";
			let svg = new QRCode({
				content: String(data),
				padding: 2,
				width: 100,
				height: 100,
				color: "#000000ff",
				background: "#ffffffff",
				ecl: "M",
			}).svg();
			fabric.loadSVGFromString(svg, (objects, options) => {
				this.adapter.global_id++;
				let qr = new fabric.util.groupSVGElements(objects, {
					id: this.adapter.global_id,
					fill: "#000000ff",
					mappingData: {
						comp: "qr-code",
						source: "STATIC",
						sample: "Example 1234",
						color: "#000000ff",
						fill: "#ffffffff",
					},
				});
				this.adapter.canvas.add(qr);
				qr.center();
				this.adapter.canvas.renderAll();
				resolve();
			});
		});
	};

	AddQRCode2 = () => {
		return new Promise((resolve) => {
			let canvas = this.adapter.canvas;
			let adapter_g_id = this.adapter.global_id++;
			let data = "Example 1234";
			const qrCode = new QRCodeStyling({
				width: 300,
				height: 300,
				type: "png",
				data: String(data),
				image: null,
				dotsOptions: {
					color: "#000000",
				},
				backgroundOptions: {
					color: "#ffffff",
				},
				imageOptions: {
					crossOrigin: "anonymous",
				},
			});
			qrCode.getRawData("png").then(async (blob) => {
				let reader = new FileReader();
				reader.onloadend = function () {
					fabric.Image.fromURL(reader.result, function (img) {
						let oImg = img.set({
							id: adapter_g_id,
							fill: "#000000ff",
							dirty: true,
							objectCaching: false,
							mappingData: {
								comp: "qr-code-2",
								source: "STATIC",
								sample: "Example 1234",
								color: "#000000ff",
								fill: "#ffffffff",
								image: null,
							},
							crossOrigin: "anonymous",
						});
						canvas.add(oImg);
						oImg.center();
						canvas.renderAll();
						resolve();
					});
				};
				reader.readAsDataURL(blob);
			});
		});
	};

	UpdateQRCode2 = (selected_obj) => {
		let canvas = this.adapter.canvas;
		const qrCode = new QRCodeStyling({
			width: 300,
			height: 300,
			type: "png",
			data: String(selected_obj.mappingData.sample),
			image: selected_obj.mappingData.image,
			dotsOptions: {
				color: selected_obj.mappingData.color,
			},
			backgroundOptions: {
				color: selected_obj.mappingData.fill,
			},
			imageOptions: {
				crossOrigin: "anonymous",
			},
		});
		qrCode.getRawData("png").then(async (blob) => {
			let reader = new FileReader();
			reader.onloadend = function () {
				fabric.Image.fromURL(reader.result, async function (img) {
					img.set({
						dirty: true,
						objectCaching: false,
						crossOrigin: "anonymous",
					});
					selected_obj.setSrc(img._element.src, async function (ob) {
						canvas.renderAll();
					});
				});
			};
			reader.readAsDataURL(blob);
		});
	};

	AddBackGround = (e) => {
		let canvas = this.adapter.canvas;
		let file = e.target.files[0];
		let reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function (f) {
			let data = f.target.result;
			fabric.Image.fromURL(data, function (img) {
				img.scaleToWidth(canvas.width);
				img.scaleToHeight(canvas.height);
				img.set({
					left: canvas.width / 2 - (img.width * img.scaleY) / 2,
				});
				canvas.setBackgroundImage(
					img.toDataURL({ format: "png" }, function () {
						canvas.requestRenderAll();
						document.getElementById("bg-image-upload").value = null;
					})
				);
			});
		};
	};

	SetBackGroundImage = (image) => {
		let canvas = this.adapter.canvas;
		fabric.Image.fromURL(image, function (img) {
			img.scaleToWidth(canvas.width);
			img.scaleToHeight(canvas.height);
			img.set({
				left: canvas.width / 2 - (img.width * img.scaleY) / 2,
			});
			canvas.setBackgroundImage(img.toDataURL({ format: "png" }), function () {
				canvas.requestRenderAll();
			});
		});
	};

	AddText = () => {
		this.adapter.global_id++;
		let text = new fabric.IText("Click to edit text...", {
			id: this.adapter.global_id,
			dirty: true,
			objectCaching: false,
			fill: "#000",
			left: 100,
			top: 100,
			fontSize: 32,
			fontFamily: "Arial",
			mappingData: { comp: "static-text" },
		});
		this.adapter.canvas.add(text);
		text.center();
		this.adapter.canvas.renderAll();
	};

	AddTextField = () => {
		this.adapter.global_id++;
		let text = new fabric.Textbox("SAMPLE", {
			id: this.adapter.global_id,
			dirty: true,
			objectCaching: false,
			editable: false,
			fill: "#000",
			left: 100,
			top: 100,
			fontSize: 32,
			fontFamily: "Arial",
			mappingData: { comp: "field-text", source: "STATIC", sample: "SAMPLE" },
		});
		this.adapter.canvas.add(text);
		text.center();
		this.adapter.canvas.renderAll();
	};

	AddImage = async (e) => {
		return new Promise((resolve) => {
			let canvas = this.adapter.canvas;
			this.adapter.global_id++;
			const adapter_g_id = this.adapter.global_id;
			let file = e.target.files[0];
			let reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function (f) {
				let data = f.target.result;
				fabric.Image.fromURL(data, function (img) {
					let oImg = img.set({
						angle: 0,
						padding: 0,
						cornersize: 0,
						top: 0,
						left: 0,
						fill: "#000",
						dirty: true,
						objectCaching: false,
						originX: "center",
						originY: "center",
					});
					let background = new fabric.Rect({
						top: 0,
						left: 0,
						strokeWidth: 0,
						width: oImg.width * oImg.scaleX,
						height: oImg.height * oImg.scaleY,
						fill: "#ffffff",
						dirty: true,
						objectCaching: false,
						originX: "center",
						originY: "center",
					});
					let clipPathImg = new fabric.Rect({
						dirty: true,
						objectCaching: false,
						left: -1 * (oImg.width / 2),
						top: -1 * (oImg.height / 2),
						width: oImg.width,
						height: oImg.height,
					});
					oImg.clipPath = clipPathImg;
					let group = new fabric.Group([background, oImg], {
						id: adapter_g_id,
						dirty: true,
						objectCaching: false,
						mappingData: { comp: "img", source: "STATIC", sample: "", is_fixed_ratio: false, rounded: 0 },
						originX: "left",
						originY: "top",
					});
					group._calcBounds();
					canvas.add(group);
					group.center();
					group.item(0).set({ height: group.item(1).height, width: group.item(1).width });
					canvas.renderAll();
					document.getElementById("image-upload").value = null;
					resolve(true);
				});
			};
		});
	};

	_roundedImage = (ctx, x, y, width, height, radius) => {
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
	};

	AddRec = () => {
		this.adapter.global_id++;
		var rect = new fabric.Rect({
			left: 100,
			top: 150,
			fill: "#e74c3c",
			width: 200,
			height: 200,
			id: this.adapter.global_id,
			mappingData: { comp: "shape" },
		});
		this.adapter.canvas.add(rect);
		rect.center();
		this.adapter.canvas.renderAll();
	};

	AddCircle = () => {
		this.adapter.global_id++;
		var circ = new fabric.Circle({
			left: 100,
			top: 150,
			fill: "#3498db",
			radius: 100,
			id: this.adapter.global_id,
			mappingData: { comp: "shape" },
		});
		this.adapter.canvas.add(circ);
		circ.center();
		this.adapter.canvas.renderAll();
	};

	AddTri = () => {
		this.adapter.global_id++;
		var triangle = new fabric.Triangle({
			left: 100,
			top: 150,
			fill: "#2ecc71",
			width: 200,
			height: 200,
			id: this.adapter.global_id,
			mappingData: { comp: "shape" },
		});
		this.adapter.canvas.add(triangle);
		triangle.center();
		this.adapter.canvas.renderAll();
	};

	_toDataUrl = (url, callback) => {
		var xhr = new XMLHttpRequest();
		xhr.onload = function () {
			var reader = new FileReader();
			reader.onloadend = function () {
				callback(reader.result);
			};
			reader.readAsDataURL(xhr.response);
		};
		xhr.open("GET", url);
		xhr.responseType = "blob";
		xhr.send();
	};
}

export { Component, ComponentAdapter };
