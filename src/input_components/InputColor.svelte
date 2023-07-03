<script>
	import * as AColorPicker from "a-color-picker";
	import { onMount, afterUpdate, createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();

	export let id, label, value = '';
	$: v = value;
	let picker;
	const oninput = (o) => {
		value = o.target.value;
		dispatch("input", { value: value });
	};
	onMount(() => {
		picker = AColorPicker.createPicker(".picker-" + id, { slBarSize: [320, 60] }).on("change", (picker, color) => {
			value = AColorPicker.parseColor(color, "hexcss4");
			dispatch("input", { value: value });
		});
	});
	const makeTransparent = () => {
		if ((value) && (value.length == 8)) {
			value += "ff";
		}
		value = "00" === value.slice(7, 9) ? value.slice(0, 7) + "ff" : value.slice(0, 7) + "00";
		dispatch("input", { value: value });
	};
	afterUpdate(() => {
		if (picker) {
			picker.color = v;
		}
	});
</script>

<div style="background: #fff; margin-bottom: 5px; border-radius: 5px;">
	<div style="background: #fff; padding: 5px; border-radius: 5px;">{label}</div>
	<div class="picker-{id}" acp-show-alpha acp-show-hsl="no" acp-color={v} />
	<div class="form-check" style="padding-top: 5px; padding-bottom: 5px; padding-left: 2rem;">
		<label class="form-check-label" for={id}>
			<input
				class="form-check-input"
				type="checkbox"
				value=""
				checked={(value) && (value.length > 8) && ("00" === value.slice(7, 9))}
				on:click={makeTransparent}
				{id}
			/>
			Transparent
		</label>
	</div>
</div>

<style>
	:global(.a-color-picker-row:not(:first-child)) {
		padding: 4px;
	}
</style>
