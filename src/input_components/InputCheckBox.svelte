<script>
    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    export let id , label , value;

    const oninput = (o) => {
        value = !o;
        dispatch('input', {value: value});
    }
</script>

<div class="input-group" style="background: #fff;">
    <div class="form-check" style="padding-top: 5px; padding-bottom: 5px; padding-left: 2rem;">
        <label class="form-check-label" for={id}>
            <input class="form-check-input" type="checkbox" id={id} on:click={()=>{oninput(value)}} checked={value}>
            {label}
        </label>
    </div>
</div>
