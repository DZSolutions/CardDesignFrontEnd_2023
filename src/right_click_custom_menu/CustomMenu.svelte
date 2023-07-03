<script>
	import Menu from "./Menu.svelte";
	import MenuOption from "./MenuOption.svelte";
	import MenuDivider from "./MenuDivider.svelte";

	//   import { tick } from "svelte";
	//   import Icon from "./Icon.svelte";

	export let onOpenMenu, onCopy, onPaste, onMoveForward, onMoveBackward, onDelete, onMoveFront, onMoveBack;

	let pos = { x: 0, y: 0 };
	let showMenu = false;

	export async function onRightClick(e) {
		if (showMenu) {
			showMenu = false;
			await new Promise((res) => setTimeout(res, 100));
		}
		pos = { x: e.clientX, y: e.clientY };
		showMenu = true;
	}

	function closeMenu() {
		showMenu = false;
	}
</script>

{#if showMenu}
	<Menu {...pos} on:click={closeMenu} on:clickoutside={closeMenu}>
		{#if onOpenMenu.copy}
			<MenuOption
				on:click={() => {
					onCopy();
				}}
				text="Copy"
			/>
		{/if}
		<MenuOption
			on:click={() => {
				onPaste();
			}}
			text="Paste"
		/>
		<MenuDivider />
		<MenuOption
			on:click={() => {
				onMoveFront();
			}}
			text="Move Front"
		/>
		<MenuOption
			on:click={() => {
				onMoveForward();
			}}
			text="Move Forward"
		/>
		<MenuDivider />
		<MenuOption
			on:click={() => {
				onMoveBackward();
			}}
			text="Move Backward"
		/>
		<MenuOption
			on:click={() => {
				onMoveBack();
			}}
			text="Move Back"
		/>
		<MenuDivider />
		<MenuOption
			on:click={() => {
				onDelete();
			}}
			text="Delete"
		/>
		<!-- <MenuOption 
			isDisabled={true} 
			on:click={console.log} 
			text="Delete" /> -->
		<!-- <MenuOption on:click={console.log}>
			<Icon />
			<span>Delete</span>
		</MenuOption> -->
	</Menu>
{/if}

<!-- <svelte:body on:contextmenu|preventDefault={onRightClick} /> -->
