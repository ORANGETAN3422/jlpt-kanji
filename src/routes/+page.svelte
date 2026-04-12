<script lang="ts">
    import { getLearnedKanji } from '$lib/storage';
    import { resolve } from '$app/paths';
    import type { homepageData } from "$lib/types";

    let { data }: { data: homepageData } = $props();
    let learned = $state<string[]>([]);

    $effect(() => {
        learned = getLearnedKanji();
    });

    const levels = $derived([
        { n: 5, kanji: data.jlpt5 ?? [] },
        { n: 4, kanji: data.jlpt4 ?? [] },
        { n: 3, kanji: data.jlpt3 ?? [] },
        { n: 2, kanji: data.jlpt2 ?? [] },
        { n: 1, kanji: data.jlpt1 ?? [] },
    ].map(l => ({
        ...l,
        learned: l.kanji.filter(k => learned.includes(k)).length,
        pct: l.kanji.length > 0 ? Math.round(l.kanji.filter(k => learned.includes(k)).length / l.kanji.length * 100) : 0
    })));

    const total = $derived({
        all: levels.reduce((s, l) => s + l.kanji.length, 0),
        learned: levels.reduce((s, l) => s + l.learned, 0),
    });

    function jlptColour(n: number): string {
        switch (n) {
            case 1: return '#00b197';
            case 2: return '#ff7b05';
            case 3: return '#8b6ca8';
            case 4: return '#ec6d64';
            case 5: return '#187fc2';
            default: return '#64748b';
        }
    }
</script>

<div class="max-w-2xl mx-auto py-8">
    <h1 class="text-amber-300/80 text-3xl font-semibold tracking-widest uppercase mb-2">JLPT Kanji</h1>
    <p class="text-slate-400 text-sm mb-10">Track your kanji progress across all JLPT levels.</p>

    <!-- total -->
    <div class="bg-slate-700/50 border border-amber-300/20 rounded-xl p-6 mb-6">
        <div class="flex justify-between items-end mb-3">
            <span class="text-white font-medium">Total Progress</span>
            <span class="text-slate-400 text-sm">{total.learned} / {total.all}</span>
        </div>
        <div class="h-2 bg-slate-600/60 rounded-full overflow-hidden flex">
            {#each levels as level (level.n)}
                {#if level.learned > 0}
                    <div
                        class="h-full transition-all"
                        style="width: {level.learned / total.all * 100}%; background-color: {jlptColour(level.n)};"
                    ></div>
                {/if}
            {/each}
        </div>
        <p class="text-amber-300/60 text-xs mt-2">{Math.round(total.learned / total.all * 100)}% complete</p>
    </div>

    <!-- per jlpt -->
    <div class="flex flex-col gap-3">
        {#each levels as level (level.n)}
            <a
                href={resolve(`/jlpt-${level.n}`)}
                class="bg-slate-700/50 rounded-xl p-5 transition-colors block border"
                style="border-color: {jlptColour(level.n)}33;"
                onmouseenter={e => (e.currentTarget as HTMLElement).style.borderColor = jlptColour(level.n) + '66'}
                onmouseleave={e => (e.currentTarget as HTMLElement).style.borderColor = jlptColour(level.n) + '33'}
            >
                <div class="flex justify-between items-end mb-3">
                    <div class="flex items-center gap-3">
                        <span class="font-semibold tracking-wider text-lg" style="color: {jlptColour(level.n)};">N{level.n}</span>
                        <span class="text-slate-500 text-xs">{level.kanji.length} kanji</span>
                    </div>
                    <span class="text-slate-400 text-sm">{level.learned} / {level.kanji.length}</span>
                </div>
                <div class="h-1.5 bg-slate-600/60 rounded-full overflow-hidden">
                    <div
                        class="h-full rounded-full transition-all"
                        style="width: {level.pct}%; background-color: {jlptColour(level.n)};"
                    ></div>
                </div>
                <p class="text-xs mt-2" style="color: {jlptColour(level.n)}99;">{level.pct}% learned</p>
            </a>
        {/each}
    </div>
</div>

<p class="text-slate-500 text-sm">
    Powered by 
    <a href="https://kanjiapi.dev/" target="_blank" class="underline text-sky-500">kanjiapi.dev</a>, 
    <a href="https://jlpt-vocab-api.vercel.app/" target="_blank" class="underline text-sky-500">JLPT Vocabulary API</a>
    and <a href="https://jisho.org" target="_blank" class="underline text-sky-500">Jisho</a>.
</p>
<p class="text-slate-500 text-sm">
    Built with 
    <a href="https://svelte.dev" target="_blank" class="underline text-sky-500">Svelte</a>, 
    <a href="https://svelte.dev" target="_blank" class="underline text-sky-500">SvelteKit</a> 
    and <a href="https://tailwindcss.com" target="_blank" class="underline text-sky-500">tailwindcss</a>.
</p>