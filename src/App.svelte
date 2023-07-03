<script>
	import jQuery from "jquery";
	import { fabric } from "fabric";
	import { onMount } from "svelte";
	import { Component, ComponentAdapter } from "./components.js";
	import { fade } from "svelte/transition";
	import preloader from "./img/preloader.gif";
	const urlParams = new URLSearchParams(window.location.search);
	import * as bootstrap from "bootstrap";
	import CustomMenu from "./right_click_custom_menu/CustomMenu.svelte";

	import FaBarcode from "svelte-icons/fa/FaBarcode.svelte";
	import FaQrcode from "svelte-icons/fa/FaQrcode.svelte";
	import FaRegImages from "svelte-icons/fa/FaRegImages.svelte";
	import FaShapes from "svelte-icons/fa/FaShapes.svelte";
	import FaTextHeight from "svelte-icons/fa/FaTextHeight.svelte";
	import FaTextWidth from "svelte-icons/fa/FaTextWidth.svelte";
	import FaRegImage from "svelte-icons/fa/FaRegImage.svelte";
	import FaTrashAlt from "svelte-icons/fa/FaTrashAlt.svelte";
	import FaFileDownload from "svelte-icons/fa/FaFileDownload.svelte";
	import FaFileUpload from "svelte-icons/fa/FaFileUpload.svelte";
	import FaCloudUploadAlt from "svelte-icons/fa/FaCloudUploadAlt.svelte";
	import FaWindowClose from "svelte-icons/fa/FaWindowClose.svelte";
	import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";

	/** Input Properties */
	import InputPx from "./input_components/InputPx.svelte";
	import InputText from "./input_components/InputText.svelte";
	import InputCheckBox from "./input_components/InputCheckBox.svelte";
	import InputSelect from "./input_components/InputSelect.svelte";
	import InputColor from "./input_components/InputColor.svelte";
	import InputFontStyle from "./input_components/InputFontStyle.svelte";
	import InputUpload from "./input_components/InputUpload.svelte";
	import SortableList from "@palsch/svelte-sortablejs";
	let custommenu;

	const base_api_url = "https://api-carddesign.dzcardsolutions.com";

	var this_layout_name = null;
	var layoutname_list = [];

	var _filter_layoutname_list = null;

	var global_id = 0;
	var view = "FRONT";
	var viewport = "H";
	var load_design_data = {
		front: {
			viewport: "H",
			obj: [],
			layer: [],
		},
		back: {
			viewport: "H",
			obj: [],
			layer: [],
		},
	};

	var canvas = null;
	var canvas_export = null;

	var component = null;
	$: ob_properties = null;
	$: _ref_comp = null;
	$: _clipboard = null;

	var _ref_layer = load_design_data.front.layer;

	var is_open_draw = false;
	var is_open_draw_cate = "";

	var org_id = null;

	var preset_background = [
		{ src: "./img/background/1.png" },
		{ src: "./img/background/2.png" },
		{ src: "./img/background/3.png" },
		{ src: "./img/background/4.png" },
		{ src: "./img/background/4.png" },
		{ src: "./img/background/4.png" },
	];

	var preest_font_list = [
		{ value: "Arial", name: "Arial" },
		{ value: "Arial Black", name: "Arial Black" },
		{ value: "Comic Sans MS", name: "Comic Sans MS" },
		{ value: "Georgia", name: "Georgia" },
		{ value: "Impact", name: "Impact" },
		{ value: "Lucida Sans Unicode", name: "Lucida Sans Unicode" },
		{ value: "Palatino Linotype", name: "Palatino Linotype" },
		{ value: "Tahoma", name: "Tahoma" },
		{ value: "Times New Roman", name: "Times New Roman" },
		{ value: "Trebuchet MS", name: "Trebuchet MS" },
		{ value: "Verdana", name: "Verdana" },
	];

	var rest_main_c_height = 0;
	var panelstyles = {
		"note-bg-color": 0,
	};
	$: panelcssVarStyles = Object.entries(panelstyles)
		.map(([key, value]) => `--${key}:${value}`)
		.join(";");

	/* gridview for esign only */
	var grid = 10;
	var is_grid = false;

	const addGridView = () => {
		if (is_grid) {
			for (var i = 0; i < 1016 / grid; i++) {
				canvas.add(
					new fabric.Line([i * grid, 0, i * grid, 1016], {
						id: "grid_" + i + "_a",
						stroke: "rgba(0, 0, 0, 0.1)",
						selectable: false,
						mappingData: { comp: "grid" },
					})
				);
				canvas.add(
					new fabric.Line([0, i * grid, 1016, i * grid], {
						id: "grid_" + i + "_b",
						stroke: "rgba(0, 0, 0, 0.1)",
						selectable: false,
						mappingData: { comp: "grid" },
					})
				);
			}
		}
	};
	/** */
	let editLayerNameModal;
	onMount(() => {
		editLayerNameModal = new bootstrap.Modal(document.getElementById("editLayerNameModal"), {});
		/***/
		if (urlParams.has("org_id")) {
			if (urlParams.get("org_id") && urlParams.get("org_id") !== "") {
				org_id = urlParams.get("org_id");
			}
		}

		rest_main_c_height = jQuery(window).height() - jQuery("#main-c").offset().top;
		jQuery("#preloader_panel").fadeIn();
		jQuery.ajax({
			type: "POST",
			url: base_api_url + "/get_all_layoutname/",
			data: JSON.stringify({ org_id: org_id }),
			contentType: "application/json",
			dataType: "json",
			success: function (data) {
				if (data && Array.isArray(data.list)) {
					layoutname_list = data.list;
				}
				let new_create = false;
				if (urlParams.has("new")) {
					if (urlParams.get("new") === "true" || urlParams.get("new") === true) {
						new_create = true;
					}
				}
				if (urlParams.has("layout_name") && new_create === false) {
					let layout_name = urlParams.get("layout_name");
					let l = layoutname_list.find((o) => o.name === layout_name);
					if (l) {
						this_layout_name = l.name;
						if (l.front_fabric_json && l.back_fabric_json) {
							load_design_data = {
								front: JSON.parse(l.front_fabric_json),
								back: JSON.parse(l.back_fabric_json),
							};
						}
						_switch_view("FRONT");
					}
				}
				jQuery("#preloader_panel").fadeOut();
			},
			error: function (response) {
				console.log("error response", response);
				alert("Error: " + response.responseJSON.error);
			},
		});

		canvas = new fabric.Canvas("canvas", {
			selection: false,
			overflow: "hidden",
			preserveObjectStacking: true,
			backgroundColor: "#FFFFFF",
			height: 642,
			width: 1016,
			padding: 0,
			dirty: true,
			objectCaching: false,
			caching: false,
		});
		canvas.setZoom(0.8);

		canvas_export = new fabric.Canvas("canvas_export", {
			selection: false,
			overflow: "hidden",
			preserveObjectStacking: true,
			backgroundColor: "tranparent",
			height: 642,
			width: 1016,
			padding: 0,
			dirty: true,
			objectCaching: false,
			caching: false,
		});

		_ref_comp = new ComponentAdapter({
			canvas: canvas,
			global_id: global_id,
			ob_properties: ob_properties,
			view: view,
			viewport: viewport,
		});
		component = new Component(_ref_comp);

		/** canvas events */
		addGridView();

		canvas.on("object:moving", function (obj) {
			/** for gridview */
			if (is_grid) {
				if (Math.round((obj.target.left / grid) * 4) % 1 == 0 && Math.round((obj.target.top / grid) * 4) % 1 == 0) {
					obj.target
						.set({
							left: Math.round(obj.target.left / grid) * grid,
							top: Math.round(obj.target.top / grid) * grid,
						})
						.setCoords();
				}
			}
			/***/
			obj_selected(obj);
		});

		canvas.on("object:scaling", function (obj) {
			const selected_obj = obj.target;
			if (selected_obj.mappingData?.comp === "barcode") {
				/**prevent scaling */
				let shape = obj.target;
				shape.width = shape.width;
				shape.height = shape.height;
				shape.scaleX = 1;
				shape.scaleY = 1;
			} else if (selected_obj.mappingData?.comp === "field-text") {
				/**prevent scaling */
				let shape = obj.target;
				shape.width = shape.width * shape.scaleX;
				shape.height = shape.height * shape.scaleY;
				shape.scaleX = 1;
				shape.scaleY = 1;
				canvas.renderAll();
			} else if (selected_obj.mappingData?.comp === "img") {
				/**prevent scaling */
				_recal_is_fixed_ratio(selected_obj);
			}
			obj_selected(obj);
		});

		const _recal_is_fixed_ratio = (selected_obj) => {
			let shape = selected_obj;
			if (typeof selected_obj.item === "function" && selected_obj.mappingData.is_fixed_ratio) {
				let rec = selected_obj.item(0);
				let img = selected_obj.item(1);

				img.scaleX = 1;
				img.scaleY = 1;
				rec.scaleX = 1;
				rec.scaleY = 1;
				canvas.renderAll();

				let pre_scale = (shape.height * shape.scaleY) / img.height;
				img.set({ scaleY: pre_scale, scaleX: pre_scale });
				/** scale 2 */
				if (img.width * img.scaleX > shape.width) {
					let pre_scale_2 = (shape.width * shape.scaleX) / (img.width * img.scaleX);
					img.set({ scaleY: img.scaleY * pre_scale_2, scaleX: img.scaleX * pre_scale_2 });
				}
				if (img.height * img.scaleY > shape.height) {
					let pre_scale_2 = (shape.height * shape.scaleY) / (img.height * img.scaleY);
					img.set({ scaleY: img.scaleY * pre_scale_2, scaleX: img.scaleX * pre_scale_2 });
				}

				shape.width = Math.floor(shape.width * shape.scaleX);
				shape.height = Math.floor(shape.height * shape.scaleY);
				shape.scaleX = 1;
				shape.scaleY = 1;

				rec.width = shape.width;
				rec.height = shape.height;
				rec.scaleX = shape.scaleX;
				rec.scaleY = shape.scaleY;

				canvas.renderAll();
			} else {
				let shape = selected_obj;
				let rec = selected_obj.item(0);
				let img = selected_obj.item(1);

				img.scaleX = 1;
				img.scaleY = 1;
				rec.scaleX = 1;
				rec.scaleY = 1;
				canvas.renderAll();

				let pre_scaleY = (shape.height * shape.scaleY) / img.height;
				let pre_scaleX = (shape.width * shape.scaleX) / img.width;
				img.set({ scaleY: pre_scaleY, scaleX: pre_scaleX });

				shape.width = Math.floor(shape.width * shape.scaleX);
				shape.height = Math.floor(shape.height * shape.scaleY);
				shape.scaleX = 1;
				shape.scaleY = 1;

				rec.width = shape.width;
				rec.height = shape.height;
				rec.scaleX = shape.scaleX;
				rec.scaleY = shape.scaleY;

				canvas.renderAll();
			}
		};

		canvas.on("selection:cleared", function () {
			console.log("selection:cleared");
			ob_properties = null;
			_active_layer(null);
		});

		canvas.on("selection:created", function (obj) {
			console.log("selection:created");
			if (obj.target.type === "activeSelection") {
				canvas.discardActiveObject();
			}
			setTimeout(() => {
				obj_selected(obj);
				_active_layer(obj.target.id);
			}, 100);
		});

		canvas.on("selection:updated", function (obj) {
			console.log("selection:updated");
			if (obj.target.type === "activeSelection") {
				canvas.discardActiveObject();
				return;
			}
			setTimeout(() => {
				obj_selected(obj);
				_active_layer(obj.target.id);
			}, 100);
		});

		const obj_selected = (obj) => {
			const selected_obj = obj.target;
			ob_properties = null;
			ob_properties = {
				selected_obj: selected_obj,
				properties: [],
			};
			if (ob_properties && Array.isArray(ob_properties.properties)) {
				/** barcode */
				if (ob_properties.selected_obj.mappingData?.comp === "barcode") {
					/** width */
					ob_properties.properties.push({
						comp: InputPx,
						props: {
							id: "width",
							label: "width",
							value: Math.round(selected_obj.width * selected_obj.scaleX),
						},
						oninput: (e) => {
							ob_properties.selected_obj.set({
								scaleX: Number(e.detail.value) / ob_properties.selected_obj.item(1).item(0).width,
							});
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({ width: Number(e.detail.value) });
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({ scaleX: ob_properties.selected_obj.item(1).item(0).width / Number(e.detail.value) });
							canvas.renderAll();
						},
					});
					/** height */
					ob_properties.properties.push({
						comp: InputPx,
						props: {
							id: "height",
							label: "height",
							value: Math.round(selected_obj.height * selected_obj.scaleY),
						},
						oninput: (e) => {
							ob_properties.selected_obj.set({
								scaleY: Number(e.detail.value) / ob_properties.selected_obj.height,
							});
							canvas.renderAll();
						},
					});
					/** left */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "left", label: "left", value: Math.round(Number(selected_obj.left)) },
						oninput: (e) => {
							ob_properties.selected_obj.set({ left: Number(e.detail.value) });
							canvas.renderAll();
						},
					});
					/** top */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "top", label: "top", value: Math.round(Number(selected_obj.top)) },
						oninput: (e) => {
							ob_properties.selected_obj.set({ top: Number(e.detail.value) });
							ob_properties.selected_obj.setCoords();
							canvas.renderAll();
						},
					});
					/** field */
					ob_properties.properties.push({
						comp: InputText,
						props: {
							id: "field",
							label: "field",
							value: selected_obj.mappingData.source,
						},
						oninput: (e) => {
							let o = ob_properties.selected_obj.mappingData;
							o.source = e.detail.value;
							ob_properties.selected_obj.set({ mappingData: o });
							canvas.renderAll();
							/** update label width */
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({ width: Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX) });
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({
									scaleX:
										ob_properties.selected_obj.item(1).item(0).width /
										Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX),
								});
							canvas.renderAll();
						},
					});
					/** sample */
					ob_properties.properties.push({
						comp: InputText,
						props: {
							id: "sample",
							label: "sample",
							value: selected_obj.mappingData.sample,
						},
						oninput: (e) => {
							let o = ob_properties.selected_obj.mappingData;
							let v = e.detail.value;
							if (v === "") {
								v = "Example 1234";
							}
							o.sample = v;
							ob_properties.selected_obj.set({ mappingData: o });
							selected_obj.mappingData.sample = o.sample;
							component.UpdateBarcode(selected_obj);
							canvas.renderAll();
							/** update label width */
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({ width: Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX) });
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({
									scaleX:
										ob_properties.selected_obj.item(1).item(0).width /
										Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX),
								});
							canvas.renderAll();
						},
					});
					/* barcode type */
					ob_properties.properties.push({
						comp: InputSelect,
						props: {
							id: "barcode-type",
							label: "barcode type",
							value: selected_obj.mappingData.barcodeType,
							options: [
								{ value: "CODE128", name: "CODE128" },
								{ value: "CODE39", name: "CODE39" },
							],
						},
						oninput: (e) => {
							let o = selected_obj.mappingData;
							o.barcodeType = e.detail.value;
							ob_properties.selected_obj.set({ mappingData: o });
							component.UpdateBarcode(selected_obj);
							canvas.renderAll();
							/** update label width */
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({ width: Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX) });
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({
									scaleX:
										ob_properties.selected_obj.item(1).item(0).width /
										Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX),
								});
							canvas.renderAll();
						},
					});
					/** displayText */
					ob_properties.properties.push({
						comp: InputCheckBox,
						props: {
							id: "displayText",
							label: "Display Text",
							value: selected_obj.mappingData.displayText,
						},
						oninput: (e) => {
							let o = ob_properties.selected_obj.mappingData;
							o.displayText = e.detail.value;
							ob_properties.selected_obj.set({ mappingData: o });
							if (o.displayText) {
								ob_properties.selected_obj.item(1).item(1).set({ visible: true });
								ob_properties.selected_obj.item(0).height =
									ob_properties.selected_obj.item(0).height + (-1 * ob_properties.selected_obj.item(0).top) / 2 + 2;
							} else {
								ob_properties.selected_obj.item(1).item(1).set({ visible: false });
								ob_properties.selected_obj.item(0).set({
									height: ob_properties.selected_obj.item(1).item(0).height,
								});
							}
							canvas.renderAll();
							/** update label width */
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({ width: Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX) });
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({
									scaleX:
										ob_properties.selected_obj.item(1).item(0).width /
										Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX),
								});
							canvas.renderAll();
						},
					});
					/** font-size */
					ob_properties.properties.push({
						comp: InputPx,
						props: {
							id: "font-size",
							label: "font-size",
							value: selected_obj.item(1).item(1).fontSize,
						},
						oninput: (e) => {
							ob_properties.selected_obj.item(1).item(1).set({ fontSize: e.detail.value });
							canvas.renderAll();
							/** update label width */
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({ width: Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX) });
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({
									scaleX:
										ob_properties.selected_obj.item(1).item(0).width /
										Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX),
								});
							canvas.renderAll();
						},
					});
					/* font-family */
					ob_properties.properties.push({
						comp: InputSelect,
						props: {
							id: "font-family",
							label: "font-family",
							value: selected_obj.item(1).item(1).fontFamily,
							options: preest_font_list,
						},
						oninput: (e) => {
							ob_properties.selected_obj.item(1).item(1).set({ fontFamily: e.detail.value });
							canvas.renderAll();
							/** update label width */
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({ width: Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX) });
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({
									scaleX:
										ob_properties.selected_obj.item(1).item(0).width /
										Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX),
								});
							canvas.renderAll();
						},
					});
					/** font-style */
					ob_properties.properties.push({
						comp: InputFontStyle,
						props: {
							id: "font-size",
							label: "font-size",
							value: {
								fontWeight: selected_obj.item(1).item(1).fontWeight,
								fontStyle: selected_obj.item(1).item(1).fontStyle,
								textAlign: selected_obj.item(1).item(1).textAlign,
							},
						},
						oninput: (e) => {
							ob_properties.selected_obj.item(1).item(1).set({
								fontWeight: e.detail.value.fontWeight,
								fontStyle: e.detail.value.fontStyle,
								textAlign: e.detail.value.textAlign,
							});
							canvas.renderAll();
							/** update label width */
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({ width: Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX) });
							ob_properties.selected_obj
								.item(1)
								.item(1)
								.set({
									scaleX:
										ob_properties.selected_obj.item(1).item(0).width /
										Number(ob_properties.selected_obj.width * ob_properties.selected_obj.scaleX),
								});
							canvas.renderAll();
						},
					});
					/** angle */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "angle", label: "angle", value: selected_obj.angle },
						oninput: (e) => {
							ob_properties.selected_obj.set({ angle: e.detail.value });
							canvas.renderAll();
						},
					});
					/** color */
					ob_properties.properties.push({
						comp: InputColor,
						props: {
							id: "color",
							label: "color",
							value: selected_obj.mappingData.color,
						},
						oninput: (e) => {
							let o = ob_properties.selected_obj.mappingData;
							o.color = e.detail.value;
							ob_properties.selected_obj.set({ mappingData: o });
							selected_obj.mappingData.color = o.color;
							component.UpdateBarcode(selected_obj);
							canvas.renderAll();
						},
					});
					/** fill */
					ob_properties.properties.push({
						comp: InputColor,
						props: {
							id: "fill",
							label: "fill",
							value: selected_obj.mappingData.fill,
						},
						oninput: (e) => {
							let o = ob_properties.selected_obj.mappingData;
							o.fill = e.detail.value;
							ob_properties.selected_obj.set({ mappingData: o });
							selected_obj.item(1).item(1).set({ backgroundColor: o.fill });
							selected_obj.item(0).set({ fill: o.fill });
							selected_obj.item(1).set({ backgroundColor: o.fill });
							canvas.renderAll();
						},
					});
				} else if (
					ob_properties.selected_obj.mappingData?.comp === "qr-code" ||
					ob_properties.selected_obj.mappingData?.comp === "qr-code-2"
				) {
					/** field */
					ob_properties.properties.push({
						comp: InputText,
						props: {
							id: "field",
							label: "field",
							value: selected_obj.mappingData.source,
						},
						oninput: (e) => {
							let o = ob_properties.selected_obj.mappingData;
							o.source = e.detail.value;
							ob_properties.selected_obj.set({ mappingData: o });
							canvas.renderAll();
						},
					});
					/** sample */
					ob_properties.properties.push({
						comp: InputText,
						props: {
							id: "sample",
							label: "sample",
							value: selected_obj.mappingData.sample,
						},
						oninput: (e) => {
							let o = ob_properties.selected_obj.mappingData;
							let v = e.detail.value;
							if (v === "") {
								v = "Example 1234";
							}
							o.sample = v;
							ob_properties.selected_obj.set({ mappingData: o });
							selected_obj.mappingData.sample = o.sample;
							selected_obj.mappingData.color = o.color;
							selected_obj.mappingData.fill = o.fill;
							if (ob_properties.selected_obj.mappingData?.comp === "qr-code") {
								component.UpdateQRCode(selected_obj);
							}
							if (ob_properties.selected_obj.mappingData?.comp === "qr-code-2") {
								component.UpdateQRCode2(selected_obj);
							}
							canvas.renderAll();
						},
					});
					if (ob_properties.selected_obj.mappingData?.comp === "qr-code-2") {
						/** logoImage */
						ob_properties.properties.push({
							comp: InputUpload,
							props: {
								id: "uploadImage",
								label: "Upload",
							},
							oninput: (e) => {
								if (e && e.target && e.target.files.length > 0) {
									let file = e.target.files[0];
									let reader = new FileReader();
									reader.readAsDataURL(file);
									reader.onload = function (f) {
										let data = reader.result;
										ob_properties.selected_obj.mappingData.image = data;
										component.UpdateQRCode2(ob_properties.selected_obj);
									};
								}
							},
						});
					}
					/** left */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "left", label: "left", value: Math.round(Number(selected_obj.left)) },
						oninput: (e) => {
							ob_properties.selected_obj.set({ left: Number(e.detail.value) });
							canvas.renderAll();
						},
					});
					/** top */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "top", label: "top", value: Math.round(Number(selected_obj.top)) },
						oninput: (e) => {
							ob_properties.selected_obj.set({ top: Number(e.detail.value) });
							ob_properties.selected_obj.setCoords();
							canvas.renderAll();
						},
					});
					/** angle */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "angle", label: "angle", value: selected_obj.angle },
						oninput: (e) => {
							ob_properties.selected_obj.set({ angle: e.detail.value });
							canvas.renderAll();
						},
					});
					/** color */
					ob_properties.properties.push({
						comp: InputColor,
						props: {
							id: "color",
							label: "color",
							value: selected_obj.mappingData.color,
						},
						oninput: (e) => {
							let o = ob_properties.selected_obj.mappingData;
							o.color = e.detail.value;
							ob_properties.selected_obj.set({ mappingData: o });
							if (ob_properties.selected_obj.mappingData?.comp === "qr-code") {
								selected_obj.mappingData.sample = o.sample;
								selected_obj.mappingData.color = o.color;
								selected_obj.mappingData.fill = o.fill;
								component.UpdateQRCode(selected_obj);
							}
							if (ob_properties.selected_obj.mappingData?.comp === "qr-code-2") {
								selected_obj.mappingData.sample = o.sample;
								selected_obj.mappingData.color = o.color;
								selected_obj.mappingData.fill = o.fill;
								component.UpdateQRCode2(selected_obj);
							}
							canvas.renderAll();
						},
					});
					/** fill */
					ob_properties.properties.push({
						comp: InputColor,
						props: {
							id: "fill",
							label: "fill",
							value: selected_obj.mappingData.fill,
						},
						oninput: (e) => {
							let o = ob_properties.selected_obj.mappingData;
							o.fill = e.detail.value;
							ob_properties.selected_obj.set({ mappingData: o });
							if (ob_properties.selected_obj.mappingData?.comp === "qr-code") {
								selected_obj.mappingData.sample = o.sample;
								selected_obj.mappingData.color = o.color;
								selected_obj.mappingData.fill = o.fill;
								component.UpdateQRCode(selected_obj);
							}
							if (ob_properties.selected_obj.mappingData?.comp === "qr-code-2") {
								selected_obj.mappingData.sample = o.sample;
								selected_obj.mappingData.color = o.color;
								selected_obj.mappingData.fill = o.fill;
								component.UpdateQRCode2(selected_obj);
							}
							canvas.renderAll();
						},
					});
				} else if (ob_properties.selected_obj.mappingData?.comp === "field-text") {
					/** field */
					ob_properties.properties.push({
						comp: InputText,
						props: {
							id: "field",
							label: "field",
							value: selected_obj.mappingData.source,
						},
						oninput: (e) => {
							let o = ob_properties.selected_obj.mappingData;
							o.source = e.detail.value;
							ob_properties.selected_obj.set({ mappingData: o });
							canvas.renderAll();
						},
					});
					/** left */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "left", label: "left", value: Math.round(Number(selected_obj.left)) },
						oninput: (e) => {
							ob_properties.selected_obj.set({ left: Number(e.detail.value) });
							canvas.renderAll();
						},
					});
					/** top */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "top", label: "top", value: Math.round(Number(selected_obj.top)) },
						oninput: (e) => {
							ob_properties.selected_obj.set({ top: Number(e.detail.value) });
							ob_properties.selected_obj.setCoords();
							canvas.renderAll();
						},
					});
					/** sample */
					ob_properties.properties.push({
						comp: InputText,
						props: {
							id: "sample",
							label: "sample",
							value: selected_obj.mappingData.sample,
						},
						oninput: (e) => {
							let h = ob_properties.selected_obj.height;
							let o = ob_properties.selected_obj.mappingData;
							o.sample = e.detail.value;
							ob_properties.selected_obj.set({
								mappingData: o,
								text: o.sample,
							});
							ob_properties.selected_obj.set({ height: h });
							canvas.renderAll();
						},
					});
					/** font-size */
					ob_properties.properties.push({
						comp: InputPx,
						props: {
							id: "font-size",
							label: "font-size",
							value: selected_obj.fontSize,
						},
						oninput: (e) => {
							ob_properties.selected_obj.set({ fontSize: e.detail.value });
							canvas.renderAll();
						},
					});
					/* font-family */
					ob_properties.properties.push({
						comp: InputSelect,
						props: {
							id: "font-family",
							label: "font-family",
							value: selected_obj.fontFamily,
							options: preest_font_list,
						},
						oninput: (e) => {
							ob_properties.selected_obj.set({ fontFamily: e.detail.value });
							canvas.renderAll();
						},
					});
					/** font-style */
					ob_properties.properties.push({
						comp: InputFontStyle,
						props: {
							id: "font-size",
							label: "font-size",
							value: {
								fontWeight: selected_obj.fontWeight,
								fontStyle: selected_obj.fontStyle,
								textAlign: selected_obj.textAlign,
							},
						},
						oninput: (e) => {
							let h = ob_properties.selected_obj.height;
							ob_properties.selected_obj.set({
								fontWeight: e.detail.value.fontWeight,
								fontStyle: e.detail.value.fontStyle,
								textAlign: e.detail.value.textAlign,
							});
							ob_properties.selected_obj.set({ height: h });
							canvas.renderAll();
						},
					});
					/** angle */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "angle", label: "angle", value: selected_obj.angle },
						oninput: (e) => {
							ob_properties.selected_obj.set({ angle: e.detail.value });
							canvas.renderAll();
						},
					});
					/** color */
					ob_properties.properties.push({
						comp: InputColor,
						props: { id: "fill", label: "fill", value: selected_obj.fill },
						oninput: (e) => {
							ob_properties.selected_obj.set({ fill: e.detail.value });
							canvas.renderAll();
						},
					});
				} else if (ob_properties.selected_obj.mappingData?.comp === "static-text") {
					/** font-size */
					/** left */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "left", label: "left", value: Math.round(Number(selected_obj.left)) },
						oninput: (e) => {
							ob_properties.selected_obj.set({ left: Number(e.detail.value) });
							canvas.renderAll();
						},
					});
					/** top */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "top", label: "top", value: Math.round(Number(selected_obj.top)) },
						oninput: (e) => {
							ob_properties.selected_obj.set({ top: Number(e.detail.value) });
							ob_properties.selected_obj.setCoords();
							canvas.renderAll();
						},
					});
					ob_properties.properties.push({
						comp: InputPx,
						props: {
							id: "font-size",
							label: "font-size",
							value: selected_obj.fontSize,
						},
						oninput: (e) => {
							ob_properties.selected_obj.set({ fontSize: e.detail.value });
							canvas.renderAll();
						},
					});
					/* font-family */
					ob_properties.properties.push({
						comp: InputSelect,
						props: {
							id: "font-family",
							label: "font-family",
							value: selected_obj.fontFamily,
							options: preest_font_list,
						},
						oninput: (e) => {
							ob_properties.selected_obj.set({ fontFamily: e.detail.value });
							canvas.renderAll();
						},
					});
					/** font-style */
					ob_properties.properties.push({
						comp: InputFontStyle,
						props: {
							id: "font-size",
							label: "font-size",
							value: {
								fontWeight: selected_obj.fontWeight,
								fontStyle: selected_obj.fontStyle,
								textAlign: selected_obj.textAlign,
							},
						},
						oninput: (e) => {
							ob_properties.selected_obj.set({
								fontWeight: e.detail.value.fontWeight,
								fontStyle: e.detail.value.fontStyle,
								textAlign: e.detail.value.textAlign,
							});
							canvas.renderAll();
						},
					});
					/* scaleX */
					ob_properties.properties.push({
						comp: InputPx,
						props: {
							id: "scaleX",
							label: "scaleX",
							value: selected_obj.scaleX,
						},
						oninput: (e) => {
							ob_properties.selected_obj.set({ scaleX: e.detail.value });
							canvas.renderAll();
						},
					});
					/* scaleY */
					ob_properties.properties.push({
						comp: InputPx,
						props: {
							id: "scaleY",
							label: "scaleY",
							value: selected_obj.scaleY,
						},
						oninput: (e) => {
							ob_properties.selected_obj.set({ scaleY: e.detail.value });
							canvas.renderAll();
						},
					});
					/** angle */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "angle", label: "angle", value: selected_obj.angle },
						oninput: (e) => {
							ob_properties.selected_obj.set({ angle: e.detail.value });
							canvas.renderAll();
						},
					});
					/** color */
					ob_properties.properties.push({
						comp: InputColor,
						props: { id: "fill", label: "fill", value: selected_obj.fill },
						oninput: (e) => {
							ob_properties.selected_obj.set({ fill: e.detail.value });
							canvas.renderAll();
						},
					});
				} else if (ob_properties.selected_obj.mappingData?.comp === "img") {
					/** width */
					ob_properties.properties.push({
						comp: InputPx,
						props: {
							id: "width",
							label: "width",
							value: selected_obj.width,
						},
						oninput: (e) => {
							ob_properties.selected_obj.set({
								width: Number(e.detail.value),
							});
							_recal_is_fixed_ratio(selected_obj);
							canvas.renderAll();
						},
					});
					/** height */
					ob_properties.properties.push({
						comp: InputPx,
						props: {
							id: "height",
							label: "height",
							value: selected_obj.height,
						},
						oninput: (e) => {
							ob_properties.selected_obj.set({
								height: Number(e.detail.value),
							});
							_recal_is_fixed_ratio(selected_obj);
							canvas.renderAll();
						},
					});
					/** field */
					ob_properties.properties.push({
						comp: InputText,
						props: {
							id: "field",
							label: "field",
							value: selected_obj.mappingData.source,
						},
						oninput: (e) => {
							let o = ob_properties.selected_obj.mappingData;
							o.source = e.detail.value;
							ob_properties.selected_obj.set({ mappingData: o });
							canvas.renderAll();
						},
					});
					/** is_fixed_ratio */
					if (typeof selected_obj.item === "function") {
						ob_properties.properties.push({
							comp: InputCheckBox,
							props: {
								id: "is_fixed_ratio",
								label: "Fixed Ratio",
								value: selected_obj.mappingData.is_fixed_ratio,
							},
							oninput: (e) => {
								let o = ob_properties.selected_obj.mappingData;
								o.is_fixed_ratio = e.detail.value;
								ob_properties.selected_obj.set({ mappingData: o });
								_recal_is_fixed_ratio(ob_properties.selected_obj);
								canvas.renderAll();
							},
						});
					}
					/** rounded */
					ob_properties.properties.push({
						comp: InputPx,
						props: {
							id: "rounded",
							label: "radius",
							value: selected_obj.mappingData.rounded ? selected_obj.mappingData.rounded : 0,
						},
						oninput: (e) => {
							let r = e.detail.value;
							if (r <= 0) {
								r = 0;
							}
							let o = ob_properties.selected_obj.mappingData;
							o.rounded = r;
							ob_properties.selected_obj.set({ mappingData: o });
							let clipPathImg = new fabric.Rect({
								left: -1 * (selected_obj.item(1).width / 2),
								top: -1 * (selected_obj.item(1).height / 2),
								width: selected_obj.item(1).width,
								height: selected_obj.item(1).height,
								rx: o.rounded,
								ry: o.rounded,
							});
							selected_obj.item(0).set({ rx: o.rounded, ry: o.rounded });
							selected_obj.item(1).set({ clipPath: clipPathImg });
							_recal_is_fixed_ratio(selected_obj);
							canvas.renderAll();
						},
					});
					/** displayText */
					ob_properties.properties.push({
						comp: InputUpload,
						props: {
							id: "uploadImage",
							label: "Upload",
						},
						oninput: (e) => {
							if (e && e.target && e.target.files.length > 0) {
								let file = e.target.files[0];
								let reader = new FileReader();
								reader.readAsDataURL(file);
								reader.onload = function (f) {
									let data = f.target.result;
									ob_properties.selected_obj.item(1).setSrc(data, async function (ob) {
										canvas.renderAll();
										_recal_is_fixed_ratio(ob_properties.selected_obj);
										canvas.renderAll();
									});
								};
							}
						},
					});
					/** left */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "left", label: "left", value: Math.round(Number(selected_obj.left)) },
						oninput: (e) => {
							ob_properties.selected_obj.set({ left: Number(e.detail.value) });
							canvas.renderAll();
						},
					});
					/** top */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "top", label: "top", value: Math.round(Number(selected_obj.top)) },
						oninput: (e) => {
							ob_properties.selected_obj.set({ top: Number(e.detail.value) });
							ob_properties.selected_obj.setCoords();
							canvas.renderAll();
						},
					});
					/** angle */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "angle", label: "angle", value: selected_obj.angle },
						oninput: (e) => {
							ob_properties.selected_obj.set({ angle: e.detail.value });
							canvas.renderAll();
						},
					});
					/** color */
					if (typeof selected_obj.item === "function") {
						ob_properties.properties.push({
							comp: InputColor,
							props: {
								id: "fill",
								label: "fill",
								value: selected_obj.item(0).fill,
							},
							oninput: (e) => {
								ob_properties.selected_obj.item(0).set({ fill: e.detail.value });
								canvas.renderAll();
							},
						});
					}
				}
				if (ob_properties.selected_obj.mappingData?.comp === "shape") {
					/** color */
					ob_properties.properties.push({
						comp: InputColor,
						props: { id: "fill", label: "fill", value: selected_obj.fill },
						oninput: (e) => {
							ob_properties.selected_obj.set({ fill: e.detail.value });
							canvas.renderAll();
						},
					});
					/** left */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "left", label: "left", value: Math.round(Number(selected_obj.left)) },
						oninput: (e) => {
							ob_properties.selected_obj.set({ left: Number(e.detail.value) });
							canvas.renderAll();
						},
					});
					/** top */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "top", label: "top", value: Math.round(Number(selected_obj.top)) },
						oninput: (e) => {
							ob_properties.selected_obj.set({ top: Number(e.detail.value) });
							ob_properties.selected_obj.setCoords();
							canvas.renderAll();
						},
					});
					/** angle */
					ob_properties.properties.push({
						comp: InputPx,
						props: { id: "angle", label: "angle", value: selected_obj.angle },
						oninput: (e) => {
							ob_properties.selected_obj.set({ angle: e.detail.value });
							canvas.renderAll();
						},
					});
					if (selected_obj.get("type") === "rect") {
						/** rounded */
						ob_properties.properties.push({
							comp: InputPx,
							props: {
								id: "rounded",
								label: "radius",
								value: selected_obj.rx,
							},
							oninput: (e) => {
								let r = e.detail.value;
								if (r <= 0) {
									r = 0;
								}
								selected_obj.set({ rx: r, ry: r });
								canvas.renderAll();
							},
						});
					}
				} else {
					/** other common comp */
				}
			}
		};
	});

	const pipe_add_comp = (comp) => {};
	const pipe_update_comp = (comp) => {};
	const pipe_remove_comp = (comp) => {};

	/* FRONT | BACK */
	const SwitchView = (p_view) => {
		SaveCanvasDesign(canvas);
		_switch_view(p_view);
	};

	const _switch_view = (p_view) => {
		view = p_view;
		canvas.clear();
		canvas.renderAll();
		if (view === "FRONT") {
			_rotate_canvas(load_design_data.front.viewport);
			_ref_layer = load_design_data.front.layer;
			_load_obj_to_canvas(canvas, load_design_data.front);
		} else {
			_rotate_canvas(load_design_data.back.viewport);
			_ref_layer = load_design_data.back.layer;
			_load_obj_to_canvas(canvas, load_design_data.back);
		}
		addGridView();
	};

	const SaveCanvasDesign = (canvas) => {
		let jsonObj = _save_canvas(canvas);
		if (view === "FRONT") {
			load_design_data.front.obj = jsonObj;
			load_design_data.front.layer = _ref_layer;
			load_design_data.front.viewport = viewport;
		} else {
			load_design_data.back.obj = jsonObj;
			load_design_data.back.layer = _ref_layer;
			load_design_data.back.viewport = viewport;
		}
		return jsonObj;
	};

	const SaveFile = () => {
		SaveCanvasDesign(canvas);
		localStorage.setItem("load_design_data", JSON.stringify(load_design_data));
		let json = JSON.stringify(load_design_data);
		let blob = new Blob([json], { type: "application/json" });
		let url = URL.createObjectURL(blob);
		let a = document.createElement("a");
		a.download = "my-business-card.bcd";
		a.href = url;
		a.click();
	};

	const DownloadImg = () => {
		canvas.discardActiveObject();
		canvas.renderAll();
		canvas_export.clear();
		canvas_export.setWidth(canvas.width);
		canvas_export.setHeight(canvas.height);
		canvas_export.loadFromJSON(canvas.toJSON(["id", "mappingData"]), function () {
			if (canvas_export._objects && Array.isArray(canvas_export._objects)) {
				let grid = canvas_export._objects.filter((item) => {
					if (item && item.mappingData && item.mappingData.comp && item.mappingData.comp === "grid") {
						return true;
					}
				});
				if (grid) {
					grid.map((o) => canvas_export.remove(o));
				}
			}
			canvas_export.renderAll();
			setTimeout(() => {
				let a = document.createElement("a");
				a.download = "my-business-card.png";
				a.href = canvas_export.toDataURL({
					format: "png",
				});
				a.click();
			}, 300);
		});
	};

	const RotateCanvas = (p_viewport) => {
		_rotate_canvas(p_viewport);
		SaveCanvasDesign(canvas);
	};

	const _rotate_canvas = (p_viewport) => {
		viewport = p_viewport;
		/* V = width="1016" height="642" */
		if (viewport === "V") {
			canvas.setHeight(1016);
			canvas.setWidth(642);
		} else {
			canvas.setHeight(642);
			canvas.setWidth(1016);
		}
	};

	const ClearCanvas = () => {
		_ref_comp.global_id = 0;
		_ref_layer = [];
		canvas.discardActiveObject();
		canvas.clear();
		SaveCanvasDesign(canvas);
		_switch_view(view);
	};

	const _save_canvas = (canvas) => {
		let jsonObj = canvas.toJSON(["id", "mappingData"]);
		return jsonObj;
	};

	const getCompName = (item) => {
		if (item && item.id) {
			let t = _search_obj_by_id(item.id)?.mappingData?.comp;
			return t ? t : "*";
		}
	};

	const SaveCloud = () => {
		SaveCanvasDesign(canvas);
		jQuery("#preloader_panel").fadeIn();
		jQuery.post(
			base_api_url + "/update/cardlayout/",
			{
				layout_name: this_layout_name,
				blob_front: JSON.stringify(load_design_data.front),
				blob_back: JSON.stringify(load_design_data.back),
			},
			function (data) {
				if (urlParams.has("redirect")) {
					let redirect = urlParams.get("redirect");
					window.location.href = decodeURIComponent(redirect);
				}
				jQuery("#preloader_panel").fadeOut();
			}
		);
	};

	const ImportFile = (e) => {
		canvas.clear();
		canvas.renderAll();
		let files = e.target.files;
		let fr = new FileReader();
		fr.onload = function () {
			try {
				let object = JSON.parse(fr.result);
				load_design_data = object;
				_rotate_canvas(load_design_data.front.viewport);
				_switch_view("FRONT");
			} catch (e) {
				console.log("error", e);
			}
		};
		if (files[0] !== undefined) {
			fr.readAsText(files[0]);
		}
	};

	const DeleteSelected = () => {
		let o = canvas.getActiveObject();
		if (o) {
			let ID = o.id;
			canvas.remove(o);
			_delete_layer(ID);
		}
	};

	const MoveForward = () => {
		let o = canvas.getActiveObject();
		if (o) {
			let index = _ref_layer.findIndex((i) => i.id === o.id);
			if (index > 0) {
				let x = index - 1;
				let y = index;
				_ref_layer[x] = _ref_layer.splice(y, 1, _ref_layer[x])[0];
				_ref_layer = _ref_layer;
				_move_re_layer();
			}
		}
	};

	const MoveBackward = () => {
		let o = canvas.getActiveObject();
		if (o) {
			let index = _ref_layer.findIndex((i) => i.id === o.id);
			if (index < _ref_layer.length - 1) {
				let x = index;
				let y = index + 1;
				_ref_layer[x] = _ref_layer.splice(y, 1, _ref_layer[x])[0];
				_ref_layer = _ref_layer;
				_move_re_layer();
			}
		}
	};

	const MoveFront = () => {
		let o = canvas.getActiveObject();
		if (o) {
			let index = _ref_layer.findIndex((i) => i.id === o.id);
			if (index > 0) {
				let x = _ref_layer[index];
				_ref_layer.splice(index, 1);
				_ref_layer = [x, ..._ref_layer];
				_move_to(_ref_layer);
			}
		}
	};

	const MoveBack = () => {
		let o = canvas.getActiveObject();
		if (o) {
			let index = _ref_layer.findIndex((i) => i.id === o.id);
			if (_ref_layer.length > 0 && index >= 0 && index < _ref_layer.length - 1) {
				let x = _ref_layer[index];
				_ref_layer.splice(index, 1);
				_ref_layer = [..._ref_layer, x];
				_move_to(_ref_layer);
			}
		}
	};

	const _load_obj_to_canvas = (canvas, object) => {
		const obj = object.obj;
		const layer = object.layer;
		if (!Array.isArray(_ref_layer)) {
			_ref_layer = [];
		}
		if (obj) {
			_ref_comp.global_id = 0;
			if (Array.isArray(layer)) {
				for (var i = 0; i < layer.length; i++) {
					if (_ref_comp.global_id <= layer[i].id) {
						_ref_comp.global_id = layer[i].id;
					}
				}
			}
			if (obj.objects && Array.isArray(obj.objects)) {
				obj.objects.forEach((o) => {
					if (!o.id) {
						_ref_comp.global_id++;
						o.id = _ref_comp.global_id;
						_add_layer_without_active(_ref_comp.global_id, "Layer " + _ref_comp.global_id);
					}
				});
			}
			_ref_comp.global_id++;
			canvas.loadFromJSON(obj, function () {
				canvas.renderAll();
			});
		}
	};

	const _add_layer = (id, name) => {
		if (_ref_layer) {
			_ref_layer = [{ id: id, name: name, active: false }, ..._ref_layer];
			_active_layer(id);
			_move_to(_ref_layer);
		}
	};

	const _add_layer_without_active = (id, name) => {
		if (_ref_layer) {
			_ref_layer = [{ id: id, name: name, active: false }, ..._ref_layer];
		}
	};

	const _active_layer = (id) => {
		if (_ref_layer) {
			_ref_layer.forEach((O) => {
				if (O.id === id) {
					O.active = true;
				} else {
					O.active = false;
				}
			});
			_ref_layer = _ref_layer;
		}
	};

	const _delete_layer = (id) => {
		if (_ref_layer) {
			let i = _ref_layer.findIndex((o) => o.id === id);
			if (i > -1) {
				let T = _ref_layer;
				T.splice(i, 1);
				_ref_layer = T;
			}
		}
	};

	const _search_obj_by_id = (id) => {
		let objs = canvas.getObjects();
		for (let i = 0; i < objs.length; i++) {
			if (objs[i] && objs[i].get("id") === id) {
				return objs[i];
			}
		}
	};

	const _move_re_layer = () => {
		let r = [..._ref_layer].reverse();

		for (var i = 0; i < r.length; i++) {
			let item = _search_obj_by_id(r[i].id);
			if (item) {
				canvas.moveTo(item, i + 1);
			}
		}
	};

	const _move_to = (canvas_items) => {
		let r = [...canvas_items].reverse();
		for (var i = 0; i < r.length; i++) {
			let item = _search_obj_by_id(r[i].id);
			if (item) {
				canvas.moveTo(item, i + 1);
			}
		}
	};

	const sortableOptions = {
		animation: 100,
		easing: "cubic-bezier(1, 0, 0, 1)",
	};
	const Copy = () => {
		if (canvas.getActiveObject()) {
			canvas.getActiveObject().clone(function (cloned) {
				_clipboard = cloned;
				_clipboard.mappingData = canvas.getActiveObject().mappingData;
			});
		}
	};

	const Paste = () => {
		_clipboard.clone(function (clonedObj) {
			_ref_comp.global_id++;
			canvas.discardActiveObject();
			clonedObj.set({
				id: _ref_comp.global_id,
				left: clonedObj.left + 10,
				top: clonedObj.top + 10,
				evented: true,
				mappingData: _clipboard.mappingData,
			});
			if (clonedObj.type === "activeSelection") {
				// active selection needs a reference to the canvas.
				clonedObj.canvas = canvas;
				clonedObj.forEachObject(function (obj) {
					canvas.add(obj);
				});
				// this should solve the unselectability
				clonedObj.setCoords();
			} else {
				canvas.add(clonedObj);
			}
			_clipboard.top += 10;
			_clipboard.left += 10;
			canvas.setActiveObject(clonedObj);
			canvas.requestRenderAll();
			_add_layer(_ref_comp.global_id, "Layer " + _ref_comp.global_id);
		});
	};

	const ExitProject = () => {
		window.location.reload(true);
	};
</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" />

	<style>
		body {
			background-color: #000;
		}
		#canvas {
			background: #fff;
		}
	</style>
</svelte:head>

<main>
	<div
		id="preloader_panel"
		style="display: none; position:fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1500; background: #00000080; text-align:center;"
	>
		<img src={preloader} alt="preloader" style="margin: 0 auto;margin-top: 25vh; width: 100px;" />
	</div>
	<nav
		class="navbar navbar-expand-sm bg-dark navbar-dark"
		style="position: fixed;top: 0;left: 0;bottom: 0;width: 150px;z-index: 1000; display: inline-block;"
	>
		<div class="container-fluid" style="padding: 0px;">
			<!-- Links -->
			<ul class="navbar-nav" style="width: 100%;position: relative;display: inline-block;">
				<li class="nav-item">
					<a
						class="nav-link"
						href={void 0}
						on:click={() => {
							component.AddBarcode();
							_add_layer(_ref_comp.global_id, "Layer " + _ref_comp.global_id);
						}}><span class="icon"><span class="icon-i"><FaBarcode /></span></span>Barcode</a
					>
				</li>
				<!-- QR Code Old Version (Without Logo) -->
				<!-- <li class="nav-item"> <a class="nav-link" href={void 0} on:click={async () => { await component.AddQRCode(); _add_layer(_ref_comp.global_id, "Layer " + _ref_comp.global_id); }}><span class="icon"><span class="icon-i"><FaQrcode /></span></span>QR</a> </li> -->
				<li class="nav-item">
					<a
						class="nav-link"
						href={void 0}
						on:click={async () => {
							await component.AddQRCode2();
							_add_layer(_ref_comp.global_id, "Layer " + _ref_comp.global_id);
						}}><span class="icon"><span class="icon-i"><FaQrcode /></span></span>QR</a
					>
				</li>
				<li class="nav-item">
					<a
						class="nav-link"
						href={void 0}
						on:click={(e) => {
							document.getElementById("image-upload").click();
						}}><span class="icon"><span class="icon-i"><FaRegImages /></span></span>Imagae</a
					>
					<input
						id="image-upload"
						type="file"
						style="display:none;"
						on:change={async (e) => {
							await component.AddImage(e);
							_add_layer(_ref_comp.global_id, "Layer " + _ref_comp.global_id);
							e.target.value = "";
						}}
						accept="image/*"
					/>
				</li>
				<li class="nav-item">
					<a
						class="nav-link"
						href={void 0}
						on:click={() => {
							is_open_draw = true;
							is_open_draw_cate = "shape";
						}}><span class="icon"><span class="icon-i"><FaShapes /></span></span>Shape</a
					>
				</li>
				<li class="nav-item">
					<a
						class="nav-link"
						href={void 0}
						on:click={() => {
							component.AddText();
							_add_layer(_ref_comp.global_id, "Layer " + _ref_comp.global_id);
						}}><span class="icon"><span class="icon-i"><FaTextHeight /></span></span>Word Art</a
					>
				</li>
				<li class="nav-item">
					<a
						class="nav-link"
						href={void 0}
						on:click={() => {
							component.AddTextField();
							_add_layer(_ref_comp.global_id, "Layer " + _ref_comp.global_id);
						}}><span class="icon"><span class="icon-i"><FaTextWidth /></span></span>Text</a
					>
				</li>
				<li class="nav-item">
					<a
						class="nav-link"
						href={void 0}
						on:click={(e) => {
							is_open_draw = true;
							is_open_draw_cate = "background";
						}}><span class="icon"><span class="icon-i"><FaRegImage /></span></span>Background</a
					>
					<input
						id="bg-image-upload"
						type="file"
						style="display:none;"
						on:change={(e) => {
							component.AddBackGround(e);
							is_open_draw = false;
							e.target.value = "";
						}}
						accept="image/*"
					/>
				</li>
				<li class="nav-item">
					<a
						class="nav-link"
						href={void 0}
						on:click={() => {
							if (window.confirm("Are you sure to clear all design ?")) {
								ClearCanvas();
							}
						}}><span class="icon"><span class="icon-i"><FaTrashAlt /></span></span>Clear</a
					>
				</li>
				<li class="nav-item">
					<a
						class="nav-link"
						href={void 0}
						on:click={(e) => {
							document.getElementById("upload-bcd").click();
						}}><span class="icon"><span class="icon-i"><FaFileUpload /></span></span>Import File</a
					>
					<input type="file" id="upload-bcd" style="display:none;" on:change={(e) => ImportFile(e)} accept=".bcd" />
				</li>
				<li class="nav-item">
					<a class="nav-link" href={void 0} on:click={SaveFile}
						><span class="icon"><span class="icon-i"><FaFileDownload /></span></span>Save Local</a
					>
				</li>
				<li class="nav-item">
					<a class="nav-link" href={void 0} on:click={DownloadImg}
						><span class="icon"><span class="icon-i"><FaFileDownload /></span></span>Save as Image</a
					>
				</li>
				<li class="nav-item">
					<a class="nav-link" href={void 0} on:click={SaveCloud}
						><span class="icon"><span class="icon-i"><FaCloudUploadAlt /></span></span>Save Cloud</a
					>
				</li>
				<li class="nav-item">
					<a class="nav-link" href={void 0} on:click={ExitProject}
						><span class="icon"><span class="icon-i"><FaWindowClose /></span></span>Exit Project</a
					>
				</li>
			</ul>
		</div>
	</nav>
	<div id="drawer" style={is_open_draw && is_open_draw_cate ? "width:250px;" : "width:1px;"}>
		<span
			id="drawer_toggle"
			on:click={() => {
				if (is_open_draw_cate && is_open_draw_cate !== "") {
					is_open_draw = !is_open_draw;
				} else {
					is_open_draw = false;
				}
			}}
		>
			<img src="./img/icon/menu.png" alt="menu" style="width:24px;" />
		</span>
		<div style="overflow: auto;height: 100%;position: relative;">
			{#if is_open_draw_cate === "background"}
				<div style="overflow-x: hidden;" in:fade={{ delay: 300 }}>
					<div style="margin-bottom:5px; padding: 5px;">
						<button
							class="btn btn-primary"
							style="width:100%;"
							on:click={() => {
								document.getElementById("bg-image-upload").click();
							}}>Upload</button
						>
					</div>
					{#each preset_background as b}
						<div
							style="text-align: center;margin-bottom: 5px;padding: 5px;"
							on:click={() => {
								component.SetBackGroundImage(b.src);
								is_open_draw = false;
							}}
						>
							<img src={b.src} alt="preest_backgroud" style="width:100%;" />
						</div>
					{/each}
				</div>
			{/if}
			{#if is_open_draw_cate === "shape"}
				<div style="overflow-x: hidden;" in:fade={{ delay: 400 }}>
					<img
						src="./img/shape/circle.png"
						alt="preest_shape"
						style="width:100%;margin-bottom:5px;"
						on:click={() => {
							component.AddCircle();
							_add_layer(_ref_comp.global_id, "Layer " + _ref_comp.global_id);
							is_open_draw = false;
						}}
					/>
					<img
						src="./img/shape/rec.png"
						alt="preest_shape"
						style="width:100%;margin-bottom:5px;"
						on:click={() => {
							component.AddRec();
							_add_layer(_ref_comp.global_id, "Layer " + _ref_comp.global_id);
							is_open_draw = false;
						}}
					/>
					<img
						src="./img/shape/tri.png"
						alt="preest_shape"
						style="width:100%;margin-bottom:5px;"
						on:click={() => {
							component.AddTri();
							_add_layer(_ref_comp.global_id, "Layer " + _ref_comp.global_id);
							is_open_draw = false;
						}}
					/>
				</div>
			{/if}
		</div>
	</div>
	<div
		class="container-fluid"
		id="main-c"
		style={rest_main_c_height > 0 ? "min-height: " + rest_main_c_height + "px;" : ""}
	>
		<div class="row">
			<div class="col-9" id="panel_1" style={rest_main_c_height > 0 ? "min-height: " + rest_main_c_height + "px;" : ""}>
				<div style="padding: 25px 15px;">
					<div style="display: inline-block;">
						<div
							class="canvas_tools_menu"
							style="color: rgb(219 219 219); margin-bottom: 25px;font-size: 14px; font-weight: bold;"
						>
							{#if this_layout_name}
								<span style="margin-right: 5px;padding: 5px 10px;background: #000;border-radius: 8px;"
									>{this_layout_name}</span
								>
							{/if}
							<a
								style={view === "FRONT" ? "color:yellow" : ""}
								href={void 0}
								on:click={() => {
									SwitchView("FRONT");
								}}>Front</a
							>
							|
							<a
								style={view === "BACK" ? "color:yellow" : ""}
								href={void 0}
								on:click={() => {
									SwitchView("BACK");
								}}>Back</a
							>
							|
							<a
								style={viewport === "H" ? "color:yellow" : ""}
								href={void 0}
								on:click={() => {
									RotateCanvas("H");
								}}>Rotate H</a
							>
							|
							<a
								style={viewport === "V" ? "color:yellow" : ""}
								href={void 0}
								on:click={() => {
									RotateCanvas("V");
								}}>Rotate V</a
							>
							|
							<a
								href={void 0}
								on:click={() => {
									DeleteSelected();
								}}>Delete</a
							>
							|
							<a
								href={void 0}
								on:click={() => {
									Copy();
								}}>Copy</a
							>
							|
							<a
								href={void 0}
								on:click={() => {
									Paste();
								}}>Paste</a
							>
						</div>
						<div
							id="canvas_wraper"
							style="overflow: hidden !important; border-radius: 30px !important; {viewport === 'H'
								? 'width: 810px !important; height: 510px !important;'
								: 'width: 510px !important; height: 810px !important;'}"
							on:contextmenu|preventDefault={(e) => {
								custommenu.onRightClick(e);
							}}
						>
							<CustomMenu
								bind:this={custommenu}
								onOpenMenu={{
									copy: true,
								}}
								onCopy={() => {
									Copy();
								}}
								onPaste={() => {
									Paste();
								}}
								onDelete={() => {
									DeleteSelected();
								}}
								onMoveForward={() => {
									MoveForward();
								}}
								onMoveBackward={() => {
									MoveBackward();
								}}
								onMoveFront={() => {
									MoveFront();
								}}
								onMoveBack={() => {
									MoveBack();
								}}
							/>
							<canvas id="canvas" />
						</div>
						<div style="display:none;"><canvas id="canvas_export" /></div>
					</div>
				</div>
			</div>
			<div class="col-3" id="panel_2" style={rest_main_c_height > 0 ? "min-height: " + rest_main_c_height + "px;" : ""}>
				<div style="width: 325px;">
					{#if ob_properties}
						<div style="margin-bottom:5px;">
							{#each ob_properties.properties as op, i}
								<div key={ob_properties.selected_obj.id}>
									{#if op.comp === InputPx}
										<svelte:component
											this={op.comp}
											id={op.props.id}
											label={op.props.label}
											bind:value={op.props.value}
											on:input={op.oninput}
										/>
									{/if}
									{#if op.comp === InputText}
										<svelte:component
											this={op.comp}
											id={op.props.id}
											label={op.props.label}
											bind:value={op.props.value}
											on:input={op.oninput}
										/>
									{/if}
									{#if op.comp === InputColor}
										<svelte:component
											this={op.comp}
											id={op.props.id}
											label={op.props.label}
											bind:value={op.props.value}
											on:input={op.oninput}
										/>
									{/if}
									{#if op.comp === InputSelect}
										<svelte:component
											this={op.comp}
											id={op.props.id}
											label={op.props.label}
											options={op.props.options}
											bind:value={op.props.value}
											on:input={op.oninput}
										/>
									{/if}
									{#if op.comp === InputCheckBox}
										<svelte:component
											this={op.comp}
											id={op.props.id}
											label={op.props.label}
											bind:value={op.props.value}
											on:input={op.oninput}
										/>
									{/if}
									{#if op.comp === InputFontStyle}
										<svelte:component this={op.comp} bind:value={op.props.value} on:input={op.oninput} />
									{/if}
									{#if op.comp === InputUpload}
										<svelte:component this={op.comp} label={op.props.label} oninput={op.oninput} />
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
				<div style="background: #fff;border-radius: 5px;overflow: hidden;padding: 5px; width: 325px;">
					{#if _ref_layer != null}
						<div style="margin-bottom:5px;"><b>Layers</b></div>
						<SortableList
							ulClass="sortable-list"
							{sortableOptions}
							on:orderChanged={(e) => {
								_move_to(_ref_layer);
							}}
							bind:items={_ref_layer}
							idKey="id"
							let:item
						>
							<div
								on:click|self={() => {
									let o = _search_obj_by_id(item.id);
									if (o && canvas) {
										canvas.setActiveObject(o);
										canvas.renderAll();
									}
								}}
								style="padding:5px;background:#fff;border:1px solid #ccc;margin-bottom:5px;{item.active
									? 'background:#ffdcdc;'
									: ''}"
							>
								{item.name}
								<span
									style="margin-left: 5px;background: rgb(239 209 209);border-radius: 4px;font-size: 10px;padding: 2px 4px;"
								>
									{getCompName(item)}
								</span>
								<a
									style="float:right;"
									href={void 0}
									on:click={() => {
										if (window.confirm("Are you sure to delete this layer ?")) {
											let o = _search_obj_by_id(item.id);
											if (o) {
												canvas.remove(o);
												_delete_layer(item.id);
											}
										}
									}}><span class="icon-delete"><FaTrashAlt /></span></a
								>
								<a
									style="float:right;"
									href={void 0}
									on:click={() => {
										jQuery("#editLayerNameModal_name").val(item.name);
										jQuery("#editLayerNameModal_name").attr("data-layer-id", item.id);
										editLayerNameModal.show();
									}}><span class="icon-edit"><FaRegEdit /></span></a
								>
							</div>
						</SortableList>
					{/if}
				</div>
			</div>
		</div>
	</div>
	{#if this_layout_name === null || this_layout_name === ""}
		<div style="position: fixed; z-index:1000; top: 0; left: 0; right: 0; bottom: 0; background: rgb(0 0 0 / 71%);">
			<div
				id="layout_select_wraper"
				style="width: 500px;margin: 15vh auto;max-width: 100%;padding: 15px; border-radius: 10px;box-shadow: -5px 5px 11px -5px rgba(0,0,0,0.75);-webkit-box-shadow: -5px 5px 11px -5px rgba(0,0,0,0.75);-moz-box-shadow: -5px 5px 11px -5px rgba(0,0,0,0.75);"
			>
				<div>
					<div class="mb-3">
						<label for="" class="form-label"><b>Layout Name</b></label>
						<input
							type="text"
							class="form-control"
							id="create_layout_name"
							on:change={(e) => {
								_filter_layoutname_list = e.currentTarget.value;
							}}
						/>
					</div>
					<div class="d-grid gap-2">
						<button
							type="button"
							class="btn btn-primary"
							on:click={() => {
								let create_layout_name = jQuery("#create_layout_name").val();
								if (create_layout_name.trim() === "") {
									jQuery("#create_layout_name").addClass("required");
								} else {
									/* org_id */
									jQuery.ajax({
										type: "POST",
										url: base_api_url + "/create/cardlayout/",
										data: JSON.stringify({
											layout_name: org_id ? org_id + "_" + create_layout_name : create_layout_name,
											org_id: org_id,
										}),
										contentType: "application/json",
										dataType: "json",
										success: function (data) {
											this_layout_name = org_id ? org_id + "_" + create_layout_name : create_layout_name;
										},
										error: function (response) {
											console.log("error response", response);
											alert("Error: " + response.responseJSON.error);
										},
									});
								}
							}}><b>Create New</b></button
						>
					</div>
					<div style="margin-top: 5px; padding: 5px; overflow: auto;max-height: 300px;">
						{#each layoutname_list as l}
							<div
								class="layoutname_list"
								on:click={() => {
									this_layout_name = l.name;
									if (l.front_fabric_json && l.back_fabric_json) {
										load_design_data = {
											front: JSON.parse(l.front_fabric_json),
											back: JSON.parse(l.back_fabric_json),
										};
									}
									_switch_view("FRONT");
								}}
							>
								{l.name}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
	<div class="modal" tabindex="-1" id="editLayerNameModal">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Layer Name</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
				</div>
				<div class="modal-body">
					<input tye="text" class="form-control" value="" id="editLayerNameModal_name" />
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
					<button
						type="button"
						class="btn btn-primary"
						on:click={() => {
							let layer_id = jQuery("#editLayerNameModal_name").attr("data-layer-id");
							let ref_index = _ref_layer.findIndex((i) => i.id === Number(layer_id));
							if (ref_index >= 0) {
								_ref_layer[ref_index].name = jQuery("#editLayerNameModal_name").val();
							}
							editLayerNameModal.hide();
						}}>Save</button
					>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	:global(body) {
		padding: 0;
	}
	#canvas_export {
		overflow: hidden;
	}
	#canvas {
		border-radius: 32px;
		box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.5);
		-webkit-box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.5);
		-moz-box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}
	#main-c {
		/* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#4c4c4c+0,1c1c1c+91,131313+100 */
		background: #4c4c4c; /* Old browsers */
		background: -moz-radial-gradient(center, ellipse cover, #4c4c4c 0%, #1c1c1c 91%, #131313 100%); /* FF3.6-15 */
		background: -webkit-radial-gradient(
			center,
			ellipse cover,
			#4c4c4c 0%,
			#1c1c1c 91%,
			#131313 100%
		); /* Chrome10-25,Safari5.1-6 */
		background: radial-gradient(
			ellipse at center,
			#4c4c4c 0%,
			#1c1c1c 91%,
			#131313 100%
		); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
	}
	#panel_1 {
		height: 700px;
		text-align: center;
		padding-left: 155px;
	}
	#canvas_wraper {
		box-shadow: -4px 10px 5px 0px rgba(0, 0, 0, 0.39);
		-webkit-box-shadow: -4px 10px 5px 0px rgba(0, 0, 0, 0.39);
		-moz-box-shadow: -4px 10px 5px 0px rgba(0, 0, 0, 0.39);
		border: 3px solid #ff4040;
		background: #ffffff;
	}
	#layout_select_wraper {
		/* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#f2f6f8+0,d8e1e7+72,d8e1e7+77,d8e1e7+77,e0eff9+100 */
		background: #f2f6f8; /* Old browsers */
		background: -moz-radial-gradient(
			center,
			ellipse cover,
			#f2f6f8 0%,
			#d8e1e7 72%,
			#d8e1e7 77%,
			#d8e1e7 77%,
			#e0eff9 100%
		); /* FF3.6-15 */
		background: -webkit-radial-gradient(
			center,
			ellipse cover,
			#f2f6f8 0%,
			#d8e1e7 72%,
			#d8e1e7 77%,
			#d8e1e7 77%,
			#e0eff9 100%
		); /* Chrome10-25,Safari5.1-6 */
		background: radial-gradient(
			ellipse at center,
			#f2f6f8 0%,
			#d8e1e7 72%,
			#d8e1e7 77%,
			#d8e1e7 77%,
			#e0eff9 100%
		); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
	}
	#panel_2 {
		height: 700px;
		/* background: #212529; */
		padding: 10px;
		overflow: auto;
		padding-top: 25px;
		padding-bottom: 25px;
	}
	:global(.input-group) {
		margin-bottom: 2px;
		border-radius: 4px;
	}

	:global(ul.sortable-list) {
		list-style-type: none;
		padding: 0;
		overflow: auto;
		max-height: 400px;
	}
	.navbar-dark .navbar-nav .nav-link {
		color: rgba(255, 255, 255, 0.55);
		font-size: 16px;
		padding: 4px 8px;
		/* border-right: 2px solid #343434; */
		color: #fff;
		display: grid;
		font-size: 12px;
		float: left;
		width: 50% !important;
		text-align: center;
		border: 1px solid #1c1c1c;
		height: 74px;
		padding: 10px 5px;
	}
	.nav-item:hover {
		background: #2e3338;
	}
	.layoutname_list {
		padding: 5px;
		border: 1px solid #cccccc;
		background: #fff;
		margin-bottom: 5px;
		cursor: pointer;
	}
	.layoutname_list:hover {
		background-color: #eee;
	}
	#drawer {
		width: 1px;
		height: 100vh;
		display: inline-block;
		position: fixed;
		z-index: 500;
		background: #1c1c1c;
		padding: 5px;
		padding-bottom: 15px;
		transition: width 0.5s;
		left: 150px;
	}
	#drawer #drawer_toggle {
		background: #1c1c1c;
		position: absolute;
		right: -30px;
		top: 15%;
		padding: 4px;
		color: #fff;
	}
	.navbar a:hover {
		color: yellow !important;
		cursor: pointer;
		text-decoration: none;
	}
	:global(.navbar a:hover .icon-i) {
		color: yellow !important;
	}
	#drawer_toggle {
		cursor: pointer;
	}
	.canvas_tools_menu a {
		color: #fff;
	}
	.canvas_tools_menu a:hover,
	:global(.canvas_tools_menu a:hover .icon-i svg) {
		color: yellow !important;
		cursor: pointer;
	}
	/** scrollbar */
	/* width */
	::-webkit-scrollbar {
		width: 10px;
	}

	/* Track */
	::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	/* Handle */
	::-webkit-scrollbar-thumb {
		background: #888;
	}

	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
	:global(.canvas-container) {
		overflow: hidden !important;
		border-radius: 30px !important;
		left: -2px;
		top: -2px;
	}
	:global(.icon-i) {
		color: #ffffff;
		width: 24px;
		height: 18px;
		display: inline-block;
	}
	:global(.icon-i > svg) {
		vertical-align: sub;
	}
	:global(.icon-edit, .icon-delete) {
		color: #0e0e0e;
		width: 24px;
		height: 18px;
		display: inline-block;
	}
	:global(.icon-i:hover),
	:global(.icon-edit:hover, .icon-delete:hover) {
		cursor: pointer;
	}
</style>
