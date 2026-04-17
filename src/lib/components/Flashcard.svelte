<script lang="ts">
    import { getKanjiInfo } from '$lib/api';
    import { getLearnedKanji, addToLearnedKanji, removeFromLearnedKanji } from '$lib/storage';
    import type { kanjiInfo } from '$lib/types';
    import { SvelteMap } from 'svelte/reactivity';

    const { kanjiList, onClose }: { kanjiList: string[]; onClose: () => void } = $props();

    let excludeLearned = $state(false);
    let queue = $state<string[]>([]);
    let queueIndex = $state(0);
    let remaining = $state<string[]>([]);
    let flipped = $state(false);
    let loading = $state(false);
    let currentKanji: kanjiInfo | null = $state(null);
    let learned = $state(false);
    const cache = new SvelteMap<string, kanjiInfo>();
    const ratings = new SvelteMap<string, number>();

    let svgContent = $state('');
    let svgContainer: HTMLDivElement | undefined = $state();
    let animating = $state(false);

    const activeList = $derived(
        excludeLearned ? kanjiList.filter(k => !getLearnedKanji().includes(k)) : kanjiList
    );

    // seed queue with one random card; rest go into the remaining pool
    $effect(() => {
        if (activeList.length === 0) { queue = []; remaining = []; queueIndex = 0; return; }
        const firstIdx = Math.floor(Math.random() * activeList.length);
        queue = [activeList[firstIdx]];
        remaining = activeList.filter((_, i) => i !== firstIdx);
        queueIndex = 0;
    });

    $effect(() => {
        const kanji = queue[queueIndex];
        if (kanji) loadKanji(kanji);
    });

    async function loadKanji(kanji: string) {
        flipped = false;
        svgContent = '';
        animating = false;
        learned = getLearnedKanji().includes(kanji);
        if (cache.has(kanji)) {
            currentKanji = cache.get(kanji)!;
            loadSvg(kanji);
            return;
        }
        loading = true;
        currentKanji = null;
        try {
            const info = await getKanjiInfo({ kanji, fetch });
            cache.set(kanji, info);
            currentKanji = info;
        } finally {
            loading = false;
        }
        loadSvg(kanji);
    }

    function loadSvg(kanji: string) {
        const cp = kanji.codePointAt(0)?.toString(16).padStart(5, '0');
        if (!cp) return;
        fetch(`https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${cp}.svg`)
            .then(r => r.text())
            .then(svg => {
                svgContent = svg
                    .replace(/<\?xml[^?]*\?>/g, '')
                    .replace(/<!DOCTYPE[^[]*(\[[^\]]*\])?\s*>/g, '');
            });
    }

    function setExcludeLearned(val: boolean) {
        excludeLearned = val;
    }

    function pickWeighted(): string | null {
        if (remaining.length === 0) {
            const nonEasy = activeList.filter(k => ratings.get(k) !== 3);
            if (nonEasy.length === 0) return null;
            remaining = nonEasy;
        }

        const weights = remaining.map(k => {
            switch (ratings.get(k)) {
                case 0:  return 4; // again
                case 1:  return 2; // hard
                case 2:  return 1; // alright
                case 3:  return 0; // easy
                default: return 5; // untested
            }
        });

        const total = weights.reduce((a: number, b) => a + b, 0);
        let rand = Math.random() * total;
        let pickedIdx = remaining.length - 1;

        for (let i = 0; i < remaining.length; i++) {
            rand -= weights[i];
            if (rand <= 0) { pickedIdx = i; break; }
        }

        const picked = remaining[pickedIdx];
        remaining.splice(pickedIdx, 1);
        return picked;
    }

    // 0: again, 1: hard, 2: alright, 3: easy
    function rate(score: number) {
        const kanji = queue[queueIndex];
        if (kanji) ratings.set(kanji, score);

        const next = pickWeighted();
        if (next) queue.push(next);

        if (queueIndex < queue.length - 1) queueIndex++;
    }

    function toggleLearned() {
        if (!currentKanji) return;
        if (learned) {
            removeFromLearnedKanji(currentKanji.kanji);
        } else {
            addToLearnedKanji(currentKanji.kanji);
        }
        learned = !learned;
    }

    function animate() {
        if (!svgContainer || animating) return;
        animating = true;
        const paths = svgContainer.querySelectorAll<SVGPathElement>('path');
        const texts = svgContainer.querySelectorAll<SVGTextElement>('text');
        const DUR = 0.5;
        texts.forEach(t => { t.style.opacity = '0'; t.style.transition = 'none'; });
        paths.forEach((p, i) => {
            const len = p.getTotalLength();
            p.style.strokeDasharray = `${len}`;
            p.style.strokeDashoffset = `${len}`;
            p.style.transition = 'none';
            const t = texts[i];
            requestAnimationFrame(() => requestAnimationFrame(() => {
                if (t) { t.style.transition = `opacity 0.1s ease ${i * DUR}s`; t.style.opacity = '1'; }
                p.style.transition = `stroke-dashoffset ${DUR}s ease ${i * DUR}s`;
                p.style.strokeDashoffset = '0';
            }));
        });
        setTimeout(() => animating = false, paths.length * DUR * 1000);
    }

    function jlptColour(n: number) {
        const map: Record<number, string> = { 1: '#00b197', 2: '#ff7b05', 3: '#8b6ca8', 4: '#ec6d64', 5: '#187fc2' };
        return map[n] ?? '#64748b';
    }

</script>

<svelte:window onkeydown={e => {
    if (e.key === 'Escape') onClose();
    else if ((e.key === ' ' || e.key === 'Enter') && !loading) { e.preventDefault(); flipped = !flipped; }
    else if (e.key === '1' && flipped) rate(0);
    else if (e.key === '2' && flipped) rate(1);
    else if (e.key === '3' && flipped) rate(2);
    else if (e.key === '4' && flipped) rate(3);
}} />

<div class="fixed inset-0 z-50 flex flex-col" style="background-color: #151929;">
    <!-- header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 shrink-0">
        <span class="text-slate-500 text-sm tabular-nums">
            {#if queue.length > 0}
                <span class="text-slate-200 font-medium">{queue.length}</span>
            {:else}
                0
            {/if}
        </span>
        <div class="flex items-center gap-2">
            <button
                onclick={() => setExcludeLearned(!excludeLearned)}
                class="text-xs px-3 py-1.5 rounded-lg border transition-colors {excludeLearned
                    ? 'bg-sky-900/40 border-sky-700/60 text-sky-400 hover:border-sky-500'
                    : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-300'}"
            >Exclude learned</button>
            <button
                onclick={onClose}
                class="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50 text-lg leading-none"
                aria-label="Close"
            >×</button>
        </div>
    </div>

    <!-- card section -->
    <div class="flex-1 flex items-center justify-center px-6 py-6 min-h-0">
        {#if queue.length === 0}
            <div class="text-center">
                <p class="text-slate-400 mb-1">No kanji to review.</p>
                <p class="text-slate-600 text-sm">Turn off "Exclude learned" to see all cards.</p>
            </div>
        {:else}
            <div class="w-full max-w-md h-95 perspective-distant">
                <!-- Card: flips on the Y axis -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="relative w-full h-full select-none transform-3d transition-[transform] duration-400 ease-[ease]"
                    style="transform: {flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}"
                    onclick={() => { if (!loading && !flipped) flipped = true; }}
                    onkeydown={() => {}}
                >
                    <!-- front -->
                    <div
                        class="absolute inset-0 backface-hidden [-webkit-backface-visibility:hidden]
                            rounded-2xl border border-amber-300/15 hover:border-amber-300/30 transition-colors cursor-pointer
                            flex flex-col items-center justify-center gap-3"
                        style="background-color: #1e2433;"
                    >
                        <span class="japanese leading-none text-white" style="font-size: 9rem;">
                            {queue[queueIndex]}
                        </span>
                        <span class="text-slate-600 text-sm tracking-wide">click to reveal</span>
                    </div>

                    <!-- back -->
                    <div
                        class="absolute inset-0 backface-hidden [-webkit-backface-visibility:hidden] transform-[rotateY(180deg)]
                            rounded-2xl border border-amber-300/25 overflow-hidden"
                        style="background-color: #1e2433;"
                    >
                        {#if loading}
                            <div class="w-full h-full flex items-center justify-center">
                                <p class="text-slate-400 text-sm">Loading...</p>
                            </div>
                        {:else if currentKanji}
                            <div class="h-full flex flex-col p-5 gap-3">
                                <!-- info -->
                                <div class="flex gap-4 items-start">
                                    <span class="japanese text-7xl text-white leading-none shrink-0">{currentKanji.kanji}</span>
                                    <div class="flex flex-col gap-1.5 flex-1 min-w-0 pt-1">
                                        <p class="text-white font-medium text-sm leading-snug">{currentKanji.meanings.join(', ')}</p>
                                        {#if currentKanji.on_readings.length > 0}
                                            <p class="text-xs text-slate-500">On: <span class="japanese text-slate-300">{currentKanji.on_readings.join('、')}</span></p>
                                        {/if}
                                        {#if currentKanji.kun_readings.length > 0}
                                            <p class="text-xs text-slate-500">Kun: <span class="japanese text-slate-300">{currentKanji.kun_readings.join('、')}</span></p>
                                        {/if}
                                        <div class="flex gap-1.5 mt-0.5 flex-wrap">
                                            <span
                                                class="text-xs rounded-full px-2 py-0.5"
                                                style="background-color: {jlptColour(currentKanji.jlpt)}25; color: {jlptColour(currentKanji.jlpt)};"
                                            >N{currentKanji.jlpt}</span>
                                            <span class="text-xs rounded-full px-2 py-0.5 bg-amber-900/30 text-amber-400/70">{currentKanji.stroke_count} strokes</span>
                                        </div>
                                    </div>
                                    <!-- stroke -->
                                    <div class="shrink-0 flex flex-col items-center gap-1.5">
                                        <div class="relative w-19 h-19 border border-amber-300/20">
                                            <div class="absolute border-r border-b border-amber-300/10" style="inset:0;width:50%;height:50%"></div>
                                            <div class="absolute border-l border-b border-amber-300/10" style="left:50%;top:0;width:50%;height:50%"></div>
                                            <div class="absolute border-r border-t border-amber-300/10" style="left:0;top:50%;width:50%;height:50%"></div>
                                            <div class="absolute border-l border-t border-amber-300/10" style="left:50%;top:50%;width:50%;height:50%"></div>
                                            {#if svgContent}
                                                <div class="absolute inset-0 p-0.5 svg-stroke-order" bind:this={svgContainer}>
                                                    <!-- eslint-disable svelte/no-at-html-tags -->
                                                    {@html svgContent}
                                                </div>
                                            {/if}
                                        </div>
                                        {#if svgContent}
                                            <button
                                                onclick={e => { e.stopPropagation(); animate(); }}
                                                disabled={animating}
                                                class="text-xs px-2 py-0.5 rounded bg-slate-700/60 border border-amber-300/30 text-amber-300/70 hover:border-amber-300/60 disabled:opacity-30 transition-colors"
                                            >▶</button>
                                        {/if}
                                    </div>
                                </div>

                                <div class="mt-auto flex flex-col gap-2">
                                    <button
                                        onclick={e => { e.stopPropagation(); toggleLearned(); }}
                                        class="w-full text-xs py-1.5 rounded-lg border transition-colors {learned
                                            ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300 hover:border-emerald-400'
                                            : 'bg-slate-700/40 border-slate-600 text-slate-400 hover:border-slate-500'}"
                                    >{learned ? '✓ Learned' : '+ Mark as learned'}</button>

                                    <div class="grid grid-cols-4 gap-2">
                                        <button
                                            onclick={e => { e.stopPropagation(); rate(0); }}
                                            class="py-2.5 rounded-xl border text-sm font-medium transition-colors
                                                bg-rose-900/25 border-rose-500/40 text-rose-300
                                                hover:bg-rose-900/40 hover:border-rose-400/70"
                                        >
                                            <span class="block text-xs opacity-50 mb-0.5">1</span>
                                            Again
                                        </button>
                                        <button
                                            onclick={e => { e.stopPropagation(); rate(1); }}
                                            class="py-2.5 rounded-xl border text-sm font-medium transition-colors
                                                bg-orange-900/25 border-orange-500/40 text-orange-300
                                                hover:bg-orange-900/40 hover:border-orange-400/70"
                                        >
                                            <span class="block text-xs opacity-50 mb-0.5">2</span>
                                            Hard
                                        </button>
                                        <button
                                            onclick={e => { e.stopPropagation(); rate(2); }}
                                            class="py-2.5 rounded-xl border text-sm font-medium transition-colors
                                                bg-sky-900/25 border-sky-500/40 text-sky-300
                                                hover:bg-sky-900/40 hover:border-sky-400/70"
                                        >
                                            <span class="block text-xs opacity-50 mb-0.5">3</span>
                                            Alright
                                        </button>
                                        <button
                                            onclick={e => { e.stopPropagation(); rate(3); }}
                                            class="py-2.5 rounded-xl border text-sm font-medium transition-colors
                                                bg-emerald-900/25 border-emerald-500/40 text-emerald-300
                                                hover:bg-emerald-900/40 hover:border-emerald-400/70"
                                        >
                                            <span class="block text-xs opacity-50 mb-0.5">4</span>
                                            Easy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>

    <!-- footer -->
    <div class="flex items-center justify-center px-6 py-4 border-t border-slate-700/60 shrink-0">
        <span class="text-slate-600 text-xs">Space to flip · 1 / 2 / 3 / 4 to rate</span>
    </div>
</div>
