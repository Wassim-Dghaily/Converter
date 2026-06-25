import type { Converter, ConversionInput, ConversionResult } from "../types";
import { brandedFilename } from "../filename";
import { isFFmpegLoaded, loadFFmpeg } from "../ffmpeg-client";

const AUDIO_TARGETS = ["mp3", "wav", "aac"];
const LOSSY_AUDIO = ["mp3", "aac"];
const VIDEO_TARGETS = ["mp4", "webm", "mkv"];

/**
 * Video converter (Phase 4) — built on the same ffmpeg.wasm core as audio.
 *
 * Handles three jobs from one converter, branching on the target:
 *  - video → video (mp4/webm/mkv): optional downscale by height.
 *  - video → gif: fps + width controls, lanczos scaling.
 *  - video → audio (mp3/wav/aac): strips video, optional bitrate ("extract audio").
 *
 * Single-thread ffmpeg.wasm is CPU/memory-bound, so large or long videos are slow and can be
 * heavy on memory — see PROJECT_MEMORY §7. ffmpeg runs in its own worker (off the main thread).
 */
export const videoConverter: Converter = {
  id: "video-transcode",
  category: "video",
  runtime: "client",
  status: "available",
  from: ["mp4", "webm", "mkv", "mov", "avi"],
  to: ["mp4", "webm", "mkv", "gif", "mp3", "wav", "aac"],
  options: [
    {
      id: "resolution",
      type: "select",
      label: "Resolution",
      default: "",
      appliesTo: VIDEO_TARGETS,
      options: [
        { value: "", label: "Original" },
        { value: "1080", label: "1080p" },
        { value: "720", label: "720p" },
        { value: "480", label: "480p" },
      ],
    },
    { id: "gifFps", type: "range", label: "GIF frame rate", min: 5, max: 30, step: 1, default: 12, unit: " fps", appliesTo: ["gif"] },
    { id: "gifWidth", type: "range", label: "GIF width", min: 240, max: 640, step: 40, default: 480, unit: " px", appliesTo: ["gif"] },
    { id: "bitrate", type: "range", label: "Audio bitrate", min: 64, max: 320, step: 32, default: 192, unit: " kbps", appliesTo: LOSSY_AUDIO },
  ],
  async convert({ file, from, to, options, onProgress }: ConversionInput): Promise<ConversionResult> {
    onProgress?.({
      ratio: 0,
      stage: isFFmpegLoaded() ? "Preparing" : "Loading converter (first run, ~32 MB)…",
    });

    let ffmpeg;
    try {
      ffmpeg = await loadFFmpeg();
    } catch (err) {
      throw new Error(`Couldn't load the conversion engine. ${err instanceof Error ? err.message : err}`);
    }

    const { fetchFile } = await import("@ffmpeg/util");

    const logTail: string[] = [];
    const onLog = (e: { message: string }) => {
      logTail.push(e.message);
      if (logTail.length > 15) logTail.shift();
    };
    const onFfmpegProgress = (e: { progress: number }) =>
      onProgress?.({ ratio: Math.min(1, Math.max(0, e.progress)), stage: "Converting" });
    ffmpeg.on("log", onLog);
    ffmpeg.on("progress", onFfmpegProgress);

    const inputName = `input${from.ext}`;
    const outputName = `output${to.ext}`;
    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const args = ["-i", inputName];
      if (AUDIO_TARGETS.includes(to.id)) {
        args.push("-vn");
        if (LOSSY_AUDIO.includes(to.id)) args.push("-b:a", `${Number(options?.bitrate ?? 192)}k`);
      } else if (to.id === "gif") {
        const fps = Number(options?.gifFps ?? 12);
        const width = Number(options?.gifWidth ?? 480);
        args.push("-vf", `fps=${fps},scale=${width}:-1:flags=lanczos`);
      } else {
        // video → video
        const res = String(options?.resolution ?? "");
        if (res) args.push("-vf", `scale=-2:${res}`);
        if (to.id === "mp4" || to.id === "mkv") args.push("-pix_fmt", "yuv420p");
      }
      args.push(outputName);

      const code = await ffmpeg.exec(args);
      if (code !== 0) {
        const joined = logTail.join("\n");
        if (AUDIO_TARGETS.includes(to.id) && /does not contain any stream/i.test(joined)) {
          throw new Error("This video doesn't have an audio track to extract.");
        }
        const reason = logTail.filter((l) => /error|invalid|unknown|unable|no such/i.test(l)).slice(-3);
        throw new Error(
          `Conversion failed (ffmpeg exit ${code}).` +
            (reason.length ? ` ${reason.join(" ")}` : ` ${logTail.slice(-3).join(" ")}`),
        );
      }

      const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
      if (!data || data.byteLength === 0) throw new Error("Conversion produced an empty file.");
      onProgress?.({ ratio: 1, stage: "Done" });

      const bytes = new Uint8Array(data.byteLength);
      bytes.set(data);
      return { blob: new Blob([bytes], { type: to.mime }), filename: brandedFilename(file.name, to.ext) };
    } finally {
      ffmpeg.off("progress", onFfmpegProgress);
      ffmpeg.off("log", onLog);
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    }
  },
};
