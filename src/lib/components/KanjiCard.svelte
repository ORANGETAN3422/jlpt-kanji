<script lang="ts">
    import type { kanjiInfo } from "$lib/types";

   let { data } : { data: kanjiInfo; } = $props();

   function gradeLabel(grade: number | null): string {
        if (grade === null) return 'Non-Jōyō';
        if (grade <= 6) return `Grade ${grade}`;
        if (grade === 8) return 'Junior High (Jōyō)';
        if (grade === 9) return 'Jinmeiyō';
        return `Grade ${grade}`;
    }

    function gradeClass(grade: number | null): string {
        if (grade === null) return 'bg-[#5a5a6e]/60';
        if (grade <= 6) return 'bg-[#4a7c59]/60';
        if (grade === 8) return 'bg-[#4a6fa5]/60';
        if (grade === 9) return 'bg-[#7c5c8a]/60';
        return 'bg-[#5a5a6e]/60';
    }

    const codepoint = $derived(data.kanji.codePointAt(0)?.toString(16).padStart(5, '0'));

    let svgContent = $state('');
    let svgContainer: HTMLDivElement | undefined = $state();
    let animating = $state(false);

    $effect(() => {
        if (codepoint) {
            svgContent = '';
            fetch(`https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${codepoint}.svg`)
                .then(r => r.text())
                .then(svg => svgContent = svg.replace(/<\?xml[^?]*\?>/g, '').replace(/<!DOCTYPE[^[]*(\[[^\]]*\])?\s*>/g, ''));
        }
    });

    function animate() {
        if (!svgContainer || animating) return;
        animating = true;

        const paths = svgContainer.querySelectorAll<SVGPathElement>('path');
        const texts = svgContainer.querySelectorAll<SVGTextElement>('text');
        const STROKE_DURATION = 0.4;

        texts.forEach(text => {
            text.style.opacity = '0';
            text.style.transition = 'none';
        });

        paths.forEach((path, i) => {
            const length = path.getTotalLength();
            path.style.strokeDasharray = `${length}`;
            path.style.strokeDashoffset = `${length}`;
            path.style.transition = 'none';

            const text = texts[i];

            requestAnimationFrame(() => requestAnimationFrame(() => {
                if (text) {
                    text.style.transition = `opacity 0.1s ease ${i * STROKE_DURATION}s`;
                    text.style.opacity = '1';
                }

                path.style.transition = `stroke-dashoffset ${STROKE_DURATION}s ease ${i * STROKE_DURATION}s`;
                path.style.strokeDashoffset = '0';
            }));
        });

        setTimeout(() => animating = false, paths.length * STROKE_DURATION * 1000);
    }

    function reset() {
        if (!svgContainer) return;
        animating = false;
        const paths = svgContainer.querySelectorAll<SVGPathElement>('path');
        const texts = svgContainer.querySelectorAll<SVGTextElement>('text');
        paths.forEach(path => {
            path.style.transition = 'none';
            path.style.strokeDashoffset = '';
            path.style.strokeDasharray = '';
        });
        texts.forEach(text => {
            text.style.transition = 'none';
            text.style.opacity = '';
        });
    }

    function jlptClass(level: number | null): string {
        switch (level) {
            case 1: return 'bg-[#00b197]/60';
            case 2: return 'bg-[#ff7b05]/60';
            case 3: return 'bg-[#8b6ca8]/60';
            case 4: return 'bg-[#ec6d64]/60';
            case 5: return 'bg-[#187fc2]/60 ';
            default: return 'bg-slate-600/60';
        }
    }
</script>

<div class="mt-6 bg-slate-700/50 border border-amber-300/20 rounded-xl p-6 flex gap-6 items-start">
    <span class="japanese text-7xl text-white leading-none shrink-0">{data.kanji}</span>
    <div class="flex flex-col gap-2 text-sm flex-1">
        <p class="text-white font-medium">{data.meanings.join(', ')}</p>
        <p class="text-slate-400">On: <span class="text-slate-200">{data.on_readings.join('、')}</span></p>
        <p class="text-slate-400">Kun: <span class="text-slate-200">{data.kun_readings.join('、')}</span></p>
        <div class="flex flex-wrap gap-2 mt-1 text-xs">
            <span class="rounded-2xl px-2.5 text-slate-300 {jlptClass(data.jlpt)}">JLPT N{data.jlpt}</span>
            <span class="rounded-2xl px-2.5 text-slate-300 {gradeClass(data.grade)}">{gradeLabel(data.grade)}</span>
            <span class="rounded-2xl px-2.5 bg-[#7a5c3a]/60 text-slate-300">{data.stroke_count} strokes</span>
        </div>
    </div>
    <div class="flex flex-col items-center gap-2 shrink-0">
        <div class="relative w-28 h-28 border border-amber-300/20">
            <!-- grid lines -->
            <div class="absolute inset-0 border-r border-b border-amber-300/20" style="width: 50%; height: 50%;"></div>
            <div class="absolute inset-0 border-l border-b border-amber-300/20" style="left: 50%; width: 50%; height: 50%;"></div>
            <div class="absolute border-r border-t border-amber-300/20" style="width: 50%; height: 50%; top: 50%;"></div>
            <div class="absolute border-l border-t border-amber-300/20" style="left: 50%; width: 50%; height: 50%; top: 50%;"></div>
            {#if svgContent}
            <div class="absolute inset-0 w-full h-full p-1 svg-stroke-order" bind:this={svgContainer}>
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html svgContent}
            </div>
            {/if}
        </div>
        <div class="flex gap-2">
            <button
                onclick={animate}
                disabled={animating || !svgContent}
                class="text-xs px-2.5 py-1 rounded-lg bg-slate-700/50 border border-amber-300/40 text-amber-300/80 hover:border-amber-300/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >▶ Play</button>
            <button
                onclick={reset}
                disabled={!svgContent}
                class="text-xs px-2.5 py-1 rounded-lg bg-slate-700/50 border border-slate-500 text-slate-400 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >↺ Reset</button>
        </div>
    </div>
</div>