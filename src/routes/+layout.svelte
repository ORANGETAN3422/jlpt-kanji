<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/cube_23.png';
	import { page } from '$app/state';
	import { resolve, base } from '$app/paths';

	let { children } = $props();
	const pathname = $derived(page.url.pathname.replace(base, '') || '/');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>JLPT Kanji</title>
	<meta
		name="description"
		content="Track your kanji progress across all JLPT levels. View stroke order, readings, meanings and example words."
	/>

	<!-- Open Graph -->
	<meta property="og:title" content="JLPT Kanji" />
	<meta
		property="og:description"
		content="Track your kanji progress across all JLPT levels. View stroke order, readings, meanings and example words."
	/>
	<meta property="og:type" content="website" />

	<meta name="theme-color" content="#1e2433" />
</svelte:head>
<nav
	class="flex items-center justify-between border-b border-amber-300/10 px-6 py-4"
	style="background-color: #1a1f2e;"
>
	<div class="flex items-center">
		<a href={resolve('/')} class="text-sm font-semibold tracking-widest text-amber-300/80 uppercase"
			>JLPT Kanji</a
		>
		{#if pathname !== '/'}
			<span class="mx-3 text-slate-600">/</span>
			<span class="text-sm text-slate-400 capitalize">{pathname.replace(/\//g, ' ').trim()}</span>
		{/if}
	</div>
	<div class="flex items-center gap-1">
		{#each [5, 4, 3, 2, 1] as n (n)}
			<a
				href={resolve(`/jlpt-${n}`)}
				class="rounded-lg border px-3 py-1 text-sm transition-colors {pathname === `/jlpt-${n}`
					? 'border-amber-400/60 bg-amber-600/20 text-amber-300'
					: 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'}"
				>N{n}</a
			>
		{/each}
	</div>
</nav>
<div class="min-h-screen p-6" style="background-color: #1e2433;">
	{@render children()}
</div>
