<script lang="ts">
	import { createMember, getMembers } from '$lib/requests/member';
	import { authStore } from '$lib/stores/auth.svelte';
	import { guildStore } from '$lib/stores/guild.svelte';
	import StyledButton from '../styledButton.svelte';
	import Modal from './modal.svelte';

	let { closeCallback }: { closeCallback: () => void } = $props();

	let selectedGuild = guildStore.guildState.currentGuild;
	if (!selectedGuild) closeCallback();

	let members = $state<Member[]>([]);
	let selectedMember = $state<Member | null>(null);

	$effect(() => {
		getMembers(authStore.authState?.token ?? '', selectedGuild?.id.toString() ?? '')
			.then((data) => (members = data))
			.catch((err) => {
				console.error(err);
				alert('Something went wrong while collecting members able to be added.');
			});
	});

	function submitAddMember() {
		if (!selectedMember) {
			alert('No member has been selected.');
			return;
		}
		if (!selectedGuild) {
			alert('No guild is currently selected to add members to.');
			return;
		}
		createMember(authStore.authState?.token ?? '', selectedMember.id, selectedGuild?.id ?? -1)
			.then((data) => {
				if (!selectedGuild) return;
				if (!selectedGuild.members) {
					selectedGuild.members = [];
				}
				selectedGuild.members.push(data);
			})
			.catch((err) => {
				console.error(err);
				alert('Something went wrong while adding member.');
			})
			.finally(closeCallback);
	}
</script>

<Modal {closeCallback}>
	<h2 class="text-xl">Add Member</h2>
	<div class="grid grid-cols-1 gap-2">
		<div class="flex flex-col">
			{#if members.length == 0}
				<span>Womp Womp... you've already added everyone.</span>
			{:else}
				<label for="memberName">User</label>
				<select
					name="memberName"
					class="rounded-lg border border-accent bg-background p-2"
					bind:value={selectedMember}
				>
					<option value={null}>Select member to add</option>
					{#each members as member}
						<option value={member}>{member.username}</option>
					{/each}
				</select>
			{/if}
		</div>
		<div class="flex justify-around gap-4">
			{#if members.length > 0}
				<StyledButton text="submit" onclick={submitAddMember} />
			{/if}
			<StyledButton text="cancel" onclick={closeCallback} />
		</div>
	</div>
</Modal>
