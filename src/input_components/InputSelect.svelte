<script>
    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    export let id , label , value, options;

    const oninput = (o) => {
        value = o.target.value;
        dispatch('input', {value: value});
    }
</script>

<div class="input-group">
    <span class="input-group-text" style="width: 150px" id={id}>{label}</span>
    <select class="form-control" aria-describedby={id} on:input={oninput} bind=value>
        {#each options as o}
            <option value={o.value} selected={o.value == value}>{o.name}</option>
        {/each}
    </select>
</div>
