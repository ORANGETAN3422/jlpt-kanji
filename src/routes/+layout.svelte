<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<nav class="flex items-center justify-between px-6 py-4 border-b border-amber-300/10" style="background-color: #1a1f2e;">
    <div class="flex items-center">
        <a href={resolve('/')} class="text-amber-300/80 font-semibold tracking-widest uppercase text-sm">JLPT Kanji</a>
        {#if page.url.pathname !== '/'}
            <span class="text-slate-600 mx-3">/</span>
            <span class="text-slate-400 text-sm capitalize">{page.url.pathname.replace(/\//g, ' ').trim()}</span>
        {/if}
    </div>
    <div class="flex items-center gap-1">
        {#each [5,4,3,2,1] as n (n)}
            <a
                href={resolve(`/jlpt-${n}`)}
                class="text-sm px-3 py-1 rounded-lg border transition-colors {page.url.pathname === `/jlpt-n${n}`
                    ? 'bg-amber-600/20 border-amber-400/60 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'}"
            >N{n}</a>
        {/each}
    </div>
</nav>
<div class="min-h-screen p-6" style="background-color: #1e2433;">
    {@render children()}
</div>
