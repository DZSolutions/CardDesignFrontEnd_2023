<script>
	export let id, label, oninput;
</script>

<div class="input-group">
	<span class="input-group-text" style="width: 150px" {id}>{label}</span>
	<button
		type="button"
		class="form-control btn btn-primary"
		id={"inp-c-upload-" + id}
		style="border-radius: 4px;"
		on:click={(e) => {
			document.getElementById("inp-c-upload-f-" + id).click();
		}}
	>
		Upload
	</button>
	<input
		id={"inp-c-upload-f-" + id}
		type="file"
		style="display:none;"
		on:change={async (e) => {
			oninput(e);
			e.target.value = "";
		}}
		accept="image/*"
	/>
</div>
