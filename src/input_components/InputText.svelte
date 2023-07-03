<script>
    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    export let id , label , value;

    const oninput = (o) => {
        value = o.target.value;
        dispatch('input', {value: value});
    }
</script>

<div class="input-group">
    <span class="input-group-text" style="width: 150px" id={id}>{label}</span>
	<input type="text" on:input={oninput} class="form-control" value={value} aria-describedby={id} />
</div>
