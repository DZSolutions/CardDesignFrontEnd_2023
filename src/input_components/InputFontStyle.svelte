<script>
    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    export let value;

    const oninput = () => {
        dispatch('input', {value: value});
    }

</script>

<div class="input-group">
    <div class="btn-group" style="width: 100%;" role="group">
        <button type="button" on:click={() => {
            value.fontWeight = value.fontWeight > 300 ? 300 : 600
            oninput()
        }} class="btn btn-light"><img src="./img/icon/text-bold-icon.png" style="height:18px;" alt="bold"/></button>
        <button type="button" on:click={() => {
            value.fontStyle = value.fontStyle !== 'normal' ? 'normal' : 'italic'
            oninput()
        }} class="btn btn-light"><img src="./img/icon/text-italic-icon.png" style="height:18px;" alt="italic"/></button>
        <button type="button" on:click={() => {
            value.textAlign = 'left'
            oninput()
        }} class="btn btn-light"><img src="./img/icon/Editing-Align-Left-icon.png" style="height:18px;" alt="left"/></button>
        <button type="button" on:click={() => {
            value.textAlign = 'center'
            oninput()
        }} class="btn btn-light"><img src="./img/icon/Editing-Align-Center-icon.png" style="height:18px;" alt="center"/></button>
        <button type="button" on:click={() => {
            value.textAlign = 'right'
            oninput()
        }} class="btn btn-light"><img src="./img/icon/Editing-Align-Right-icon.png" style="height:18px;" alt="right"/></button>
    </div>
</div>
