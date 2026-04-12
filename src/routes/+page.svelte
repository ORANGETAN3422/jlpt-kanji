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
        <div class="h-2 bg-slate-600/60 rounded-full overflow-hidden">
            <div
                class="h-full bg-amber-400/70 rounded-full transition-all"
                style="width: {Math.round(total.learned / total.all * 100)}%"
            ></div>
        </div>
        <p class="text-amber-300/60 text-xs mt-2">{Math.round(total.learned / total.all * 100)}% complete</p>
    </div>

    <!-- per jlpt -->
    <div class="flex flex-col gap-3">
        {#each levels as level (level.n)}
            <a href={resolve(`/jlpt-${level.n}`)} class="bg-slate-700/50 border border-amber-300/20 rounded-xl p-5 hover:border-amber-300/40 transition-colors block">
                <div class="flex justify-between items-end mb-3">
                    <div class="flex items-center gap-3">
                        <span class="text-amber-300/80 font-semibold tracking-wider text-lg">N{level.n}</span>
                        <span class="text-slate-500 text-xs">{level.kanji.length} kanji</span>
                    </div>
                    <span class="text-slate-400 text-sm">{level.learned} / {level.kanji.length}</span>
                </div>
                <div class="h-1.5 bg-slate-600/60 rounded-full overflow-hidden">
                    <div
                        class="h-full bg-emerald-500/70 rounded-full transition-all"
                        style="width: {level.pct}%"
                    ></div>
                </div>
                <p class="text-slate-500 text-xs mt-2">{level.pct}% learned</p>
            </a>
        {/each}
    </div>
</div>
